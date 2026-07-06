import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { TravelPreference } from '../entities/travel-preference.entity';
import { TravelHistory } from '../entities/travel-history.entity';
import { CreateUserProfileDto, UpdateUserProfileDto, CreateTravelPreferenceDto } from '../dto/user.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(TravelPreference)
    private travelPreferenceRepository: Repository<TravelPreference>,
    @InjectRepository(TravelHistory)
    private travelHistoryRepository: Repository<TravelHistory>,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    // Check if user already exists
    const existingUser = await this.userProfileRepository.findOne({
      where: { email: createUserProfileDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User profile already exists');
    }

    const userProfile = this.userProfileRepository.create(createUserProfileDto);
    return this.userProfileRepository.save(userProfile);
  }

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.find({
      relations: ['travelPreferences'],
      where: { isActive: true }
    });
  }

  async findOne(id: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOne({
      where: { id, isActive: true },
      relations: ['travelPreferences']
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return userProfile;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    return this.userProfileRepository.findOne({
      where: { email, isActive: true },
      relations: ['travelPreferences']
    });
  }

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const userProfile = await this.findOne(id);
    
    Object.assign(userProfile, updateUserProfileDto);
    return this.userProfileRepository.save(userProfile);
  }

  async remove(id: string): Promise<void> {
    const userProfile = await this.findOne(id);
    userProfile.isActive = false;
    await this.userProfileRepository.save(userProfile);
  }

  // Travel Preferences
  async createTravelPreference(createTravelPreferenceDto: CreateTravelPreferenceDto): Promise<TravelPreference> {
    // Verify user exists
    await this.findOne(createTravelPreferenceDto.userProfileId);

    const travelPreference = this.travelPreferenceRepository.create(createTravelPreferenceDto);
    return this.travelPreferenceRepository.save(travelPreference);
  }

  async getTravelPreferences(userProfileId: string): Promise<TravelPreference[]> {
    await this.findOne(userProfileId); // Verify user exists
    
    return this.travelPreferenceRepository.find({
      where: { userProfileId }
    });
  }

  async updateTravelPreference(id: string, updateData: Partial<CreateTravelPreferenceDto>): Promise<TravelPreference> {
    const preference = await this.travelPreferenceRepository.findOne({ where: { id } });
    
    if (!preference) {
      throw new NotFoundException('Travel preference not found');
    }

    Object.assign(preference, updateData);
    return this.travelPreferenceRepository.save(preference);
  }

  // Travel History
  async getTravelHistory(userProfileId: string): Promise<TravelHistory[]> {
    await this.findOne(userProfileId); // Verify user exists
    
    return this.travelHistoryRepository.find({
      where: { userProfileId },
      order: { startDate: 'DESC' }
    });
  }

  async addTravelHistory(historyData: Partial<TravelHistory>): Promise<TravelHistory> {
    const history = this.travelHistoryRepository.create(historyData);
    return this.travelHistoryRepository.save(history);
  }
}