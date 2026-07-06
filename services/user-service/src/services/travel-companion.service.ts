import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelCompanion, RelationshipType, ConnectionStatus, UserRole, CurrentStatus } from '../entities/travel-companion.entity';
import { CompanionInvitation, InvitationType, InvitationStatus } from '../entities/companion-invitation.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { CreateCompanionInvitationDto, AcceptInvitationDto, UpdateCompanionDto, ConnectByUserIdDto, UpdateTravelPreferencesDto } from '../dto/travel-companion.dto';
import { UserCodeService } from './user-code.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/notification.entity';
import { NotificationGateway } from '../websocket/notification.gateway';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class TravelCompanionService {
  constructor(
    @InjectRepository(TravelCompanion)
    private companionRepository: Repository<TravelCompanion>,
    @InjectRepository(CompanionInvitation)
    private invitationRepository: Repository<CompanionInvitation>,
    @InjectRepository(UserProfile)
    private userRepository: Repository<UserProfile>,
    private userCodeService: UserCodeService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) { }

  async getUserCompanions(userId: string): Promise<TravelCompanion[]> {
    // Ensure user profile exists before querying companions
    await this.ensureUserProfile(userId);

    const companions = await this.companionRepository.find({
      where: { user: { id: userId } },
      relations: ['companion'],
      order: { createdAt: 'DESC' }
    });

    // Also ensure companion profiles are up to date
    for (const companion of companions) {
      if (companion.companion) {
        await this.ensureUserProfile(companion.companion.id);
      }
    }

    // Reload companions to get updated profile data
    const updatedCompanions = await this.companionRepository.find({
      where: { user: { id: userId } },
      relations: ['companion'],
      order: { createdAt: 'DESC' }
    });

    // Update current status based on WebSocket connections
    for (const companion of updatedCompanions) {
      if (companion.companion) {
        const isOnline = this.notificationGateway.isUserOnline(companion.companion.id);
        companion.currentStatus = isOnline ? CurrentStatus.ONLINE : CurrentStatus.OFFLINE;
        console.log(`🔍 [TravelCompanion] User ${companion.companion.firstName} ${companion.companion.lastName} (${companion.companion.id}) - Online: ${isOnline}, Status: ${companion.currentStatus}`);
      }
    }

    console.log(`📊 [TravelCompanion] Returning ${updatedCompanions.length} companions with updated status`);
    return updatedCompanions;
  }

  async getCompanionStats(userId: string) {
    const companions = await this.getUserCompanions(userId);
    const invitations = await this.getPendingInvitations(userId);

    const primaryTravelers = companions.filter(c => c.role === UserRole.PRIMARY).length;
    const companionUsers = companions.filter(c => c.role === UserRole.COMPANION).length;
    const connected = companions.filter(c => c.status === ConnectionStatus.CONNECTED).length;
    const pending = companions.filter(c => c.status === ConnectionStatus.PENDING).length + invitations.length;
    const totalTrips = companions.reduce((sum, c) => sum + c.sharedTrips, 0);

    const companionsWithScore = companions.filter(c => c.aiPersonalNotes?.compatibilityScore);
    const avgCompatibility = companionsWithScore.length > 0
      ? Math.round(companionsWithScore.reduce((sum, c) => sum + (c.aiPersonalNotes?.compatibilityScore || 0), 0) / companionsWithScore.length)
      : 0;

    return {
      totalCompanions: companions.length,
      primaryTravelers,
      companions: companionUsers,
      connected,
      pending,
      totalTrips,
      avgCompatibility
    };
  }

  async createInvitation(senderId: string, createDto: CreateCompanionInvitationDto): Promise<CompanionInvitation> {
    // Validate sender exists
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new NotFoundException('Người gửi lời mời không tồn tại');
    }

    const invitation = new CompanionInvitation();
    invitation.senderId = senderId;
    invitation.type = createDto.type;
    if (createDto.message) {
      invitation.message = createDto.message;
    }

    // Handle different invitation types
    if (createDto.type === InvitationType.EMAIL) {
      if (!createDto.recipientEmail) {
        throw new BadRequestException('Email người nhận là bắt buộc cho loại lời mời này');
      }
      invitation.recipientEmail = createDto.recipientEmail;
      if (createDto.recipientName) {
        invitation.recipientName = createDto.recipientName;
      }
    } else if (createDto.type === InvitationType.USER_ID) {
      if (!createDto.recipientId) {
        throw new BadRequestException('ID người nhận là bắt buộc cho loại lời mời này');
      }

      const recipient = await this.userRepository.findOne({ where: { id: createDto.recipientId } });
      if (!recipient) {
        throw new NotFoundException('Người nhận không tồn tại');
      }

      // Check if already connected or invitation exists
      const existingConnection = await this.companionRepository.findOne({
        where: [
          { user: { id: senderId }, companion: { id: createDto.recipientId } },
          { user: { id: createDto.recipientId }, companion: { id: senderId } }
        ]
      });

      if (existingConnection) {
        throw new ConflictException('Đã có kết nối với người dùng này');
      }

      invitation.recipientId = createDto.recipientId;
    } else if (createDto.type === InvitationType.LINK) {
      invitation.inviteCode = this.generateInviteCode();
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    return await this.invitationRepository.save(invitation);
  }

  async connectByUserId(userId: string, connectDto: ConnectByUserIdDto): Promise<CompanionInvitation> {
    // Find user by custom user ID (not UUID)
    const recipient = await this.userRepository.findOne({ where: { email: connectDto.userId } }); // Assuming email as user ID for now
    if (!recipient) {
      throw new NotFoundException('Không tìm thấy người dùng với ID này');
    }

    return await this.createInvitation(userId, {
      type: InvitationType.USER_ID,
      recipientId: recipient.id,
      message: connectDto.message
    });
  }

  async acceptInvitation(invitationId: string, userId: string, acceptDto: AcceptInvitationDto): Promise<TravelCompanion> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['sender', 'recipient']
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Lời mời đã được xử lý');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Lời mời đã hết hạn');
    }

    // Create companion relationships for both users
    const companion1 = new TravelCompanion();
    companion1.user = { id: invitation.senderId } as UserProfile;
    companion1.companion = { id: userId } as UserProfile;
    companion1.relationship = acceptDto.relationship;
    companion1.status = ConnectionStatus.CONNECTED;
    companion1.role = UserRole.COMPANION;

    const companion2 = new TravelCompanion();
    companion2.user = { id: userId } as UserProfile;
    companion2.companion = { id: invitation.senderId } as UserProfile;
    companion2.relationship = acceptDto.relationship;
    companion2.status = ConnectionStatus.CONNECTED;
    companion2.role = UserRole.COMPANION;

    // Save both relationships
    await this.companionRepository.save([companion1, companion2]);

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();
    await this.invitationRepository.save(invitation);

    // Get user names for notifications
    const accepter = await this.userRepository.findOne({ where: { id: userId } });
    const sender = await this.userRepository.findOne({ where: { id: invitation.senderId } });

    // Send notification about new companion to both users to refresh their companion lists
    this.notificationGateway.sendNotificationToUser(invitation.senderId, {
      type: 'invitation_accepted',
      title: 'Lời mời được chấp nhận',
      message: `${accepter?.firstName} ${accepter?.lastName} đã chấp nhận lời mời kết nối`,
      data: { refreshCompanions: true }
    });

    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'invitation_accepted',
      title: 'Danh sách đồng hành đã cập nhật',
      message: `${sender?.firstName} ${sender?.lastName} đã được thêm vào danh sách đồng hành`,
      data: { refreshCompanions: true }
    });

    console.log(`✅ Travel companion relationship created between ${invitation.senderId} and ${userId}`);

    return companion2;
  }

  async declineInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    invitation.status = InvitationStatus.DECLINED;
    invitation.respondedAt = new Date();
    await this.invitationRepository.save(invitation);
  }

  async getPendingInvitations(userId: string): Promise<CompanionInvitation[]> {
    // Ensure user profile exists
    await this.ensureUserProfile(userId);

    const invitations = await this.invitationRepository.find({
      where: [
        { senderId: userId, status: InvitationStatus.PENDING },
        { recipientId: userId, status: InvitationStatus.PENDING }
      ],
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' }
    });

    // Ensure sender and recipient profiles are up to date
    for (const invitation of invitations) {
      if (invitation.sender) {
        await this.ensureUserProfile(invitation.sender.id);
      }
      if (invitation.recipient) {
        await this.ensureUserProfile(invitation.recipient.id);
      }
    }

    // Reload invitations to get updated profile data
    return await this.invitationRepository.find({
      where: [
        { senderId: userId, status: InvitationStatus.PENDING },
        { recipientId: userId, status: InvitationStatus.PENDING }
      ],
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateCompanion(userId: string, companionId: string, updateDto: UpdateCompanionDto): Promise<TravelCompanion> {
    const companion = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId } }
    });

    if (!companion) {
      throw new NotFoundException('Người đồng hành không tồn tại');
    }

    if (updateDto.relationship) {
      companion.relationship = updateDto.relationship;
    }

    if (updateDto.foodPreferences || updateDto.mobilityLevel || updateDto.travelHabits || updateDto.compatibilityScore !== undefined) {
      const currentNotes = companion.aiPersonalNotes || {
        foodPreferences: [],
        mobilityLevel: 'medium_walking' as any,
        travelHabits: []
      };

      companion.aiPersonalNotes = {
        ...currentNotes,
        ...(updateDto.foodPreferences && { foodPreferences: updateDto.foodPreferences }),
        ...(updateDto.mobilityLevel && { mobilityLevel: updateDto.mobilityLevel }),
        ...(updateDto.travelHabits && { travelHabits: updateDto.travelHabits }),
        ...(updateDto.compatibilityScore !== undefined && { compatibilityScore: updateDto.compatibilityScore })
      };
    }

    return await this.companionRepository.save(companion);
  }

  async updateTravelPreferences(userId: string, companionId: string, preferencesDto: UpdateTravelPreferencesDto): Promise<TravelCompanion> {
    const companion = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId } }
    });

    if (!companion) {
      throw new NotFoundException('Người đồng hành không tồn tại');
    }

    const currentPreferences = companion.travelPreferences || {
      foodStyle: [],
      activityLevel: 'medium' as any,
      budgetRange: ''
    };

    companion.travelPreferences = {
      ...currentPreferences,
      ...preferencesDto
    };

    return await this.companionRepository.save(companion);
  }

  async blockCompanion(userId: string, companionId: string): Promise<void> {
    const companion = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId } }
    });

    if (!companion) {
      throw new NotFoundException('Người đồng hành không tồn tại');
    }

    companion.status = ConnectionStatus.BLOCKED;
    await this.companionRepository.save(companion);
  }

  async unblockCompanion(userId: string, companionId: string): Promise<void> {
    const companion = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId } }
    });

    if (!companion) {
      throw new NotFoundException('Người đồng hành không tồn tại');
    }

    companion.status = ConnectionStatus.CONNECTED;
    await this.companionRepository.save(companion);
  }

  async getInvitationByCode(inviteCode: string): Promise<CompanionInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode },
      relations: ['sender']
    });

    if (!invitation) {
      throw new NotFoundException('Mã mời không tồn tại');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Mã mời đã hết hạn');
    }

    return invitation;
  }

  async incrementTripCount(userId: string, companionId: string): Promise<void> {
    const companion = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId } }
    });

    if (companion) {
      companion.sharedTrips += 1;
      companion.lastTripDate = new Date();
      await this.companionRepository.save(companion);
    }
  }

  // Connect by User Code
  async connectByUserCode(userId: string, userCode: string, relationship: RelationshipType, message?: string): Promise<CompanionInvitation> {
    const targetUser = await this.userCodeService.findUserByCode(userCode);
    if (!targetUser) {
      throw new NotFoundException('Mã người dùng không tồn tại hoặc đã hết hạn');
    }

    if (targetUser.id === userId) {
      throw new BadRequestException('Không thể kết nối với chính mình');
    }

    // Check if already connected
    const existingConnection = await this.companionRepository.findOne({
      where: [
        { user: { id: userId }, companion: { id: targetUser.id } },
        { user: { id: targetUser.id }, companion: { id: userId } }
      ]
    });

    if (existingConnection) {
      throw new ConflictException('Đã kết nối với người dùng này');
    }

    // Check for pending invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: [
        { senderId: userId, recipientId: targetUser.id, status: InvitationStatus.PENDING },
        { senderId: targetUser.id, recipientId: userId, status: InvitationStatus.PENDING }
      ]
    });

    if (existingInvitation) {
      throw new ConflictException('Đã có lời mời đang chờ xử lý');
    }

    // Create invitation
    const invitation = this.invitationRepository.create({
      senderId: userId,
      recipientId: targetUser.id,
      type: InvitationType.USER_ID,
      status: InvitationStatus.PENDING,
      message: message || `Xin chào! Tôi muốn kết nối làm người đồng hành du lịch.`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Create notification for recipient
    const sender = await this.userRepository.findOne({ where: { id: userId } });
    await this.notificationService.createNotification(
      targetUser.id,
      NotificationType.COMPANION_INVITATION,
      'Lời mời kết nối mới',
      `${sender?.firstName} ${sender?.lastName} muốn kết nối làm người đồng hành du lịch`,
      { invitationId: savedInvitation.id, senderName: `${sender?.firstName} ${sender?.lastName}` },
      savedInvitation.id
    );

    // Send real-time notification
    this.notificationGateway.sendNotificationToUser(targetUser.id, {
      id: savedInvitation.id,
      type: 'companion_invitation',
      title: 'Lời mời kết nối mới',
      message: `${sender?.firstName} ${sender?.lastName} muốn kết nối làm người đồng hành du lịch`,
      sender: {
        id: sender?.id,
        firstName: sender?.firstName,
        lastName: sender?.lastName,
        email: sender?.email
      },
      createdAt: new Date().toISOString()
    });

    // Also send real-time update to sender about invitation sent
    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'invitation_sent',
      recipientId: targetUser.id,
      recipientName: `${targetUser.firstName} ${targetUser.lastName}`,
      invitationId: savedInvitation.id,
      message: 'Đã gửi lời mời thành công'
    });

    return savedInvitation;
  }

  // Generate invite link
  async generateInviteLink(userId: string, relationship: RelationshipType, message?: string, tripId?: string): Promise<{ inviteCode: string; inviteLink: string }> {
    const inviteCode = this.generateInviteCode();

    const invitation = this.invitationRepository.create({
      senderId: userId,
      type: InvitationType.LINK,
      status: InvitationStatus.PENDING,
      message: message || 'Mời bạn tham gia làm người đồng hành du lịch',
      inviteCode,
      tripId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await this.invitationRepository.save(invitation);

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${inviteCode}`;

    return { inviteCode, inviteLink };
  }

  // Accept invite by code
  async acceptInviteByCode(userId: string, inviteCode: string, relationship: RelationshipType): Promise<TravelCompanion> {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteCode, status: InvitationStatus.PENDING },
      relations: ['sender']
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại hoặc đã hết hạn');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Lời mời đã hết hạn');
    }

    if (invitation.senderId === userId) {
      throw new BadRequestException('Không thể chấp nhận lời mời của chính mình');
    }

    // Check if already connected
    const existingConnection = await this.companionRepository.findOne({
      where: [
        { user: { id: userId }, companion: { id: invitation.senderId } },
        { user: { id: invitation.senderId }, companion: { id: userId } }
      ]
    });

    if (existingConnection) {
      throw new ConflictException('Đã kết nối với người dùng này');
    }

    // Create companion relationships (bidirectional)
    const companion1 = this.companionRepository.create({
      user: { id: userId } as UserProfile,
      companion: { id: invitation.senderId } as UserProfile,
      relationship,
      status: ConnectionStatus.CONNECTED,
      role: UserRole.COMPANION,
      connectionDate: new Date(),
      sharedTrips: 0
    });

    const companion2 = this.companionRepository.create({
      user: { id: invitation.senderId } as UserProfile,
      companion: { id: userId } as UserProfile,
      relationship,
      status: ConnectionStatus.CONNECTED,
      role: UserRole.COMPANION,
      connectionDate: new Date(),
      sharedTrips: 0
    });

    await this.companionRepository.save([companion1, companion2]);

    // Update invitation
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();
    await this.invitationRepository.save(invitation);

    // Create notification for sender
    const recipient = await this.userRepository.findOne({ where: { id: userId } });
    await this.notificationService.createNotification(
      invitation.senderId,
      NotificationType.COMPANION_ACCEPTED,
      'Lời mời được chấp nhận',
      `${recipient?.firstName} ${recipient?.lastName} đã chấp nhận lời mời kết nối`,
      { companionId: userId, companionName: `${recipient?.firstName} ${recipient?.lastName}` },
      companion1.id
    );

    // Send real-time notification to sender about acceptance
    this.notificationGateway.sendNotificationToUser(invitation.senderId, {
      id: companion1.id,
      type: 'companion_accepted',
      title: 'Lời mời được chấp nhận',
      message: `${recipient?.firstName} ${recipient?.lastName} đã chấp nhận lời mời kết nối`,
      recipientId: userId,
      recipientName: `${recipient?.firstName} ${recipient?.lastName}`,
      createdAt: new Date().toISOString()
    });

    // Send real-time update to both users for companion list refresh
    this.notificationGateway.broadcastInvitationAccepted([invitation.senderId, userId], {
      type: 'invitation_accepted',
      senderId: invitation.senderId,
      recipientId: userId,
      companionshipId: companion1.id,
      message: `Kết nối thành công với ${recipient?.firstName} ${recipient?.lastName}`
    });

    return companion1;
  }

  // Invite companion to trip
  async inviteToTrip(userId: string, companionId: string, tripId: string, message?: string): Promise<CompanionInvitation> {
    // Check if they are connected
    const connection = await this.companionRepository.findOne({
      where: { user: { id: userId }, companion: { id: companionId }, status: ConnectionStatus.CONNECTED }
    });

    if (!connection) {
      throw new BadRequestException('Chưa kết nối với người dùng này');
    }

    // Check for existing trip invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        senderId: userId,
        recipientId: companionId,
        tripId,
        status: InvitationStatus.PENDING
      }
    });

    if (existingInvitation) {
      throw new ConflictException('Đã gửi lời mời cho chuyến đi này');
    }

    // Create trip invitation
    const invitation = this.invitationRepository.create({
      senderId: userId,
      recipientId: companionId,
      type: InvitationType.SYSTEM,
      status: InvitationStatus.PENDING,
      message: message || 'Mời bạn tham gia chuyến đi',
      tripId,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days for trip invites
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Create notification
    const sender = await this.userRepository.findOne({ where: { id: userId } });
    await this.notificationService.createNotification(
      companionId,
      NotificationType.TRIP_INVITATION,
      'Lời mời tham gia chuyến đi',
      `${sender?.firstName} ${sender?.lastName} mời bạn tham gia chuyến đi`,
      {
        invitationId: savedInvitation.id,
        tripId,
        senderName: `${sender?.firstName} ${sender?.lastName}`
      },
      savedInvitation.id
    );

    return savedInvitation;
  }

  // Accept trip invitation
  async acceptTripInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        recipientId: userId,
        status: InvitationStatus.PENDING
      },
      relations: ['sender']
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Lời mời đã hết hạn');
    }

    if (!invitation.tripId) {
      throw new BadRequestException('Lời mời không hợp lệ');
    }

    // Update invitation
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();
    await this.invitationRepository.save(invitation);

    // Create notification for sender
    const recipient = await this.userRepository.findOne({ where: { id: userId } });
    await this.notificationService.createNotification(
      invitation.senderId,
      NotificationType.TRIP_ACCEPTED,
      'Lời mời chuyến đi được chấp nhận',
      `${recipient?.firstName} ${recipient?.lastName} đã chấp nhận tham gia chuyến đi`,
      {
        tripId: invitation.tripId,
        companionId: userId,
        companionName: `${recipient?.firstName} ${recipient?.lastName}`
      },
      invitation.tripId
    );

    // TODO: Add companion to trip in trip service
  }

  // Helper method to ensure user profile exists and is up to date
  private async ensureUserProfile(userId: string): Promise<UserProfile> {
    let userProfile = await this.userRepository.findOne({ where: { id: userId } });

    if (!userProfile) {
      // User doesn't exist in user-service, create profile from auth-service
      console.log(`📝 User ${userId} not found in user-service, creating profile...`);

      // Get user info directly from database (auth-service tables)
      let authUser: any = null;
      try {
        const authUserQuery = `
          SELECT id, email, "firstName", "lastName" 
          FROM users 
          WHERE id = $1
        `;
        const result = await this.userRepository.query(authUserQuery, [userId]);

        if (result && result.length > 0) {
          authUser = result[0];
          console.log(`✅ Got user info from auth database:`, authUser);
        } else {
          console.log(`⚠️ User not found in auth database`);
        }
      } catch (error) {
        console.log(`⚠️ Error fetching user from auth database:`, error instanceof Error ? error.message : String(error));
      }

      try {
        userProfile = this.userRepository.create({
          id: userId,
          email: authUser?.email || `temp_${userId.slice(0, 8)}@example.com`,
          firstName: authUser?.firstName || 'User',
          lastName: authUser?.lastName || '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await this.userRepository.save(userProfile);
        console.log(`✅ Created user profile for ${userId}`);
      } catch (error: any) {
        if (error.code === '23505') {
          // User was created by another request, try multiple times with exponential backoff
          console.log(`⚠️ Duplicate key detected for user ${userId}, retrying fetch...`);

          let attempts = 0;
          const maxAttempts = 5;

          while (attempts < maxAttempts && !userProfile) {
            attempts++;
            const delay = Math.min(100 * Math.pow(2, attempts - 1), 1000); // Exponential backoff, max 1s
            await new Promise(resolve => setTimeout(resolve, delay));

            userProfile = await this.userRepository.findOne({ where: { id: userId } });

            if (userProfile) {
              console.log(`✅ Found existing user profile for ${userId} after ${attempts} attempts`);
              break;
            } else {
              console.log(`⚠️ User ${userId} still not found, attempt ${attempts}/${maxAttempts}`);
            }
          }

          if (!userProfile) {
            console.error(`❌ Failed to find user profile for ${userId} after ${maxAttempts} attempts`);
            throw new Error(`Unable to find or create user profile for ${userId}`);
          }
        } else {
          console.error(`❌ Error creating user profile for ${userId}:`, error);
          throw error;
        }
      }
    } else if (userProfile.firstName === 'User' && userProfile.email.includes('temp_')) {
      // User profile exists but has default values, try to update from auth-service
      try {
        const authUserQuery = `
          SELECT id, email, "firstName", "lastName" 
          FROM users 
          WHERE id = $1
        `;
        const result = await this.userRepository.query(authUserQuery, [userId]);

        if (result && result.length > 0) {
          const authUser = result[0];
          if (authUser.firstName !== 'User' || !authUser.email.includes('temp_')) {
            console.log(`🔄 Updating user profile ${userId} with auth data:`, authUser);
            await this.userRepository.update(userId, {
              firstName: authUser.firstName,
              lastName: authUser.lastName,
              email: authUser.email,
              updatedAt: new Date()
            });
            // Refresh the userProfile object
            userProfile = await this.userRepository.findOne({ where: { id: userId } });
          }
        }
      } catch (error) {
        console.log(`⚠️ Error updating user profile from auth:`, error instanceof Error ? error.message : String(error));
      }
    }

    return userProfile!;
  }
  // Get user's personal code
  async getUserCode(userId: string): Promise<string> {
    // Ensure user profile exists and is up to date
    await this.ensureUserProfile(userId);

    let userCode = await this.userCodeService.getUserCode(userId);

    if (!userCode) {
      userCode = await this.userCodeService.generateUserCode(userId);
    }

    return userCode.code;
  }

  async removeCompanion(userId: string, companionId: string): Promise<void> {
    // Find the companion relationship where user is involved
    const companionRelation = await this.companionRepository.findOne({
      where: [
        { userId: userId, companionId: companionId },
        { userId: companionId, companionId: userId }
      ],
      relations: ['user', 'companion']
    });

    if (!companionRelation) {
      throw new NotFoundException('Không tìm thấy mối quan hệ đồng hành');
    }

    // Check if the requesting user is part of this relationship
    if (companionRelation.userId !== userId && companionRelation.companionId !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa mối quan hệ này');
    }

    // Find and remove both directional relationships
    const relationshipsToRemove = await this.companionRepository.find({
      where: [
        { userId: userId, companionId: companionId },
        { userId: companionId, companionId: userId }
      ]
    });

    if (relationshipsToRemove.length === 0) {
      throw new NotFoundException('Không tìm thấy mối quan hệ để xóa');
    }

    // Get user names for notifications
    const requestingUser = await this.userRepository.findOne({ where: { id: userId } });
    const companionUser = await this.userRepository.findOne({ where: { id: companionId } });

    // Remove all relationships
    await this.companionRepository.remove(relationshipsToRemove);

    // Emit WebSocket events to notify both users
    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'companion_removed',
      title: 'Người đồng hành đã được xóa',
      message: `Bạn đã xóa ${companionUser?.firstName} ${companionUser?.lastName} khỏi danh sách đồng hành`,
      data: {
        removedCompanionId: companionId,
        removedCompanionName: `${companionUser?.firstName} ${companionUser?.lastName}`
      }
    });

    this.notificationGateway.sendNotificationToUser(companionId, {
      type: 'companion_removed',
      title: 'Đã bị xóa khỏi danh sách đồng hành',
      message: `${requestingUser?.firstName} ${requestingUser?.lastName} đã xóa bạn khỏi danh sách đồng hành`,
      data: {
        removedByUserId: userId,
        removedByUserName: `${requestingUser?.firstName} ${requestingUser?.lastName}`
      }
    });

    console.log(`✅ Travel companion relationship removed between ${userId} and ${companionId}`);
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }
}