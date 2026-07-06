import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TravelCompanionService } from '../services/travel-companion.service';
import { CreateCompanionInvitationDto, AcceptInvitationDto, UpdateCompanionDto, ConnectByUserIdDto, UpdateTravelPreferencesDto } from '../dto/travel-companion.dto';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from '../entities/user-profile.entity';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('travel-companions')
@Controller('travel-companions')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
export class TravelCompanionController {
  constructor(
    private readonly companionService: TravelCompanionService,
    @InjectRepository(UserProfile)
    private readonly userRepository: Repository<UserProfile>
  ) {}

  private async getUserId(req: AuthenticatedRequest): Promise<string> {
    const userIdFromHeader = req.headers['user-id'] as string;
    let userId: string;
    
    if (userIdFromHeader) {
      console.log('🎯 Using user ID from header:', userIdFromHeader);
      userId = userIdFromHeader;
    } else if (req.user?.id) {
      console.log('🔐 Using user ID from JWT token:', req.user.id);
      userId = req.user.id;
    } else {
      console.error('❌ No user identification found in request');
      throw new UnauthorizedException('User not authenticated');
    }
    
    return userId;
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người đồng hành' })
  @ApiResponse({ status: 200, description: 'Danh sách người đồng hành' })
  async getCompanions(@Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return await this.companionService.getUserCompanions(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê người đồng hành' })
  @ApiResponse({ status: 200, description: 'Thống kê người đồng hành' })
  async getStats(@Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return await this.companionService.getCompanionStats(userId);
  }

  @Post('invitations')
  @ApiOperation({ summary: 'Tạo lời mời kết bạn đồng hành' })
  @ApiResponse({ status: 201, description: 'Lời mời đã được tạo' })
  async createInvitation(@Body() createDto: CreateCompanionInvitationDto, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return await this.companionService.createInvitation(userId, createDto);
  }

  @Post('connect-by-id')
  @ApiOperation({ summary: 'Kết nối qua User ID' })
  @ApiResponse({ status: 201, description: 'Lời mời kết nối đã được gửi' })
  async connectByUserId(@Body() connectDto: ConnectByUserIdDto, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return await this.companionService.connectByUserId(userId, connectDto);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'Lấy danh sách lời mời chờ xử lý' })
  @ApiResponse({ status: 200, description: 'Danh sách lời mời' })
  async getPendingInvitations(@Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return await this.companionService.getPendingInvitations(userId);
  }

  @Get('invitations/code/:code')
  @ApiOperation({ summary: 'Lấy thông tin lời mời qua mã' })
  @ApiParam({ name: 'code', description: 'Mã lời mời' })
  @ApiResponse({ status: 200, description: 'Thông tin lời mời' })
  async getInvitationByCode(@Param('code') code: string) {
    return await this.companionService.getInvitationByCode(code);
  }

  @Post('invitations/:id/accept')
  @ApiOperation({ summary: 'Chấp nhận lời mời' })
  @ApiParam({ name: 'id', description: 'ID lời mời' })
  @ApiResponse({ status: 200, description: 'Lời mời đã được chấp nhận' })
  async acceptInvitation(
    @Param('id') invitationId: string,
    @Body() acceptDto: AcceptInvitationDto,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = await this.getUserId(req);
    return await this.companionService.acceptInvitation(invitationId, userId, acceptDto);
  }

  @Post('invitations/:id/decline')
  @ApiOperation({ summary: 'Từ chối lời mời' })
  @ApiParam({ name: 'id', description: 'ID lời mời' })
  @ApiResponse({ status: 200, description: 'Lời mời đã bị từ chối' })
  async declineInvitation(@Param('id') invitationId: string, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    await this.companionService.declineInvitation(invitationId, userId);
    return { message: 'Đã từ chối lời mời' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người đồng hành' })
  @ApiParam({ name: 'id', description: 'ID người đồng hành' })
  @ApiResponse({ status: 200, description: 'Thông tin đã được cập nhật' })
  async updateCompanion(
    @Param('id') companionId: string,
    @Body() updateDto: UpdateCompanionDto,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = await this.getUserId(req);
    return await this.companionService.updateCompanion(userId, companionId, updateDto);
  }

  @Put(':id/travel-preferences')
  @ApiOperation({ summary: 'Cập nhật sở thích du lịch của người đồng hành' })
  @ApiParam({ name: 'id', description: 'ID người đồng hành' })
  @ApiResponse({ status: 200, description: 'Sở thích du lịch đã được cập nhật' })
  async updateTravelPreferences(
    @Param('id') companionId: string,
    @Body() preferencesDto: UpdateTravelPreferencesDto,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = await this.getUserId(req);
    return await this.companionService.updateTravelPreferences(userId, companionId, preferencesDto);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Chặn người đồng hành' })
  @ApiParam({ name: 'id', description: 'ID người đồng hành' })
  @ApiResponse({ status: 200, description: 'Đã chặn người đồng hành' })
  async blockCompanion(@Param('id') companionId: string, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    await this.companionService.blockCompanion(userId, companionId);
    return { message: 'Đã chặn người đồng hành' };
  }

  @Post(':id/unblock')
  @ApiOperation({ summary: 'Bỏ chặn người đồng hành' })
  @ApiParam({ name: 'id', description: 'ID người đồng hành' })
  @ApiResponse({ status: 200, description: 'Đã bỏ chặn người đồng hành' })
  async unblockCompanion(@Param('id') companionId: string, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    await this.companionService.unblockCompanion(userId, companionId);
    return { message: 'Đã bỏ chặn người đồng hành' };
  }

  @Post(':id/increment-trips')
  @ApiOperation({ summary: 'Tăng số chuyến đi chung' })
  @ApiParam({ name: 'id', description: 'ID người đồng hành' })
  @ApiResponse({ status: 200, description: 'Đã cập nhật số chuyến đi' })
  async incrementTripCount(@Param('id') companionId: string, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    await this.companionService.incrementTripCount(userId, companionId);
    return { message: 'Đã cập nhật số chuyến đi' };
  }

  @Post('connect-by-code')
  @ApiOperation({ summary: 'Kết nối bằng mã người dùng' })
  @ApiResponse({ status: 201, description: 'Đã gửi lời mời kết nối' })
  async connectByCode(@Body() data: { userCode: string; relationship: string; message?: string }, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return this.companionService.connectByUserCode(userId, data.userCode, data.relationship as any, data.message);
  }

  @Post('generate-invite-link')
  @ApiOperation({ summary: 'Tạo link mời' })
  @ApiResponse({ status: 201, description: 'Đã tạo link mời' })
  async generateInviteLink(@Body() data: { relationship: string; message?: string; tripId?: string }, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return this.companionService.generateInviteLink(userId, data.relationship as any, data.message, data.tripId);
  }

  @Post('accept-invite/:code')
  @ApiOperation({ summary: 'Chấp nhận lời mời bằng mã' })
  @ApiParam({ name: 'code', description: 'Mã lời mời' })
  @ApiResponse({ status: 200, description: 'Đã chấp nhận lời mời' })
  async acceptInviteByCode(@Param('code') code: string, @Body() data: { relationship: string }, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return this.companionService.acceptInviteByCode(userId, code, data.relationship as any);
  }

  @Post('invite-to-trip')
  @ApiOperation({ summary: 'Mời người đồng hành tham gia chuyến đi' })
  @ApiResponse({ status: 201, description: 'Đã gửi lời mời tham gia chuyến đi' })
  async inviteToTrip(@Body() data: { companionId: string; tripId: string; message?: string }, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    return this.companionService.inviteToTrip(userId, data.companionId, data.tripId, data.message);
  }

  @Put('accept-trip-invitation/:id')
  @ApiOperation({ summary: 'Chấp nhận lời mời tham gia chuyến đi' })
  @ApiParam({ name: 'id', description: 'ID lời mời' })
  @ApiResponse({ status: 200, description: 'Đã chấp nhận lời mời tham gia chuyến đi' })
  async acceptTripInvitation(@Param('id') invitationId: string, @Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    await this.companionService.acceptTripInvitation(invitationId, userId);
    return { message: 'Đã chấp nhận lời mời tham gia chuyến đi' };
  }

  @Get('my-code')
  @ApiOperation({ summary: 'Lấy mã cá nhân của tôi' })
  @ApiResponse({ status: 200, description: 'Mã cá nhân' })
  async getMyCode(@Req() req: AuthenticatedRequest) {
    const userId = await this.getUserId(req);
    const code = await this.companionService.getUserCode(userId);
    return { code };
  }

  @Delete(':companionId')
  @ApiOperation({ summary: 'Xóa người đồng hành' })
  @ApiParam({ name: 'companionId', description: 'ID của mối quan hệ companion' })
  @ApiResponse({ status: 200, description: 'Đã xóa người đồng hành thành công' })
  async removeCompanion(
    @Req() req: AuthenticatedRequest,
    @Param('companionId') companionId: string
  ) {
    const userId = await this.getUserId(req);
    await this.companionService.removeCompanion(userId, companionId);
    return { message: 'Đã xóa người đồng hành thành công' };
  }
}