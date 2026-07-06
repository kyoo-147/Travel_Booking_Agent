import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserProfileService } from '../services/user-profile.service';
import { CreateUserProfileDto, UpdateUserProfileDto, CreateTravelPreferenceDto } from '../dto/user.dto';

@ApiTags('user-profiles')
@Controller('api/v1/users')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, description: 'User profile created successfully' })
  @ApiResponse({ status: 409, description: 'User profile already exists' })
  async create(@Body(ValidationPipe) createUserProfileDto: CreateUserProfileDto) {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiResponse({ status: 200, description: 'Retrieved all user profiles' })
  async findAll() {
    return this.userProfileService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'User profile found' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async findOne(@Param('id') id: string) {
    return this.userProfileService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user profile by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ status: 200, description: 'User profile found' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async findByEmail(@Param('email') email: string) {
    const user = await this.userProfileService.findByEmail(email);
    if (!user) {
      return { message: 'User not found' };
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async update(@Param('id') id: string, @Body(ValidationPipe) updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'User profile deleted' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async remove(@Param('id') id: string) {
    await this.userProfileService.remove(id);
    return { message: 'User profile deleted successfully' };
  }

  // Travel Preferences endpoints
  @Post(':id/preferences')
  @ApiOperation({ summary: 'Create travel preferences for user' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 201, description: 'Travel preferences created' })
  async createTravelPreferences(@Param('id') id: string, @Body(ValidationPipe) createTravelPreferenceDto: CreateTravelPreferenceDto) {
    createTravelPreferenceDto.userProfileId = id;
    return this.userProfileService.createTravelPreference(createTravelPreferenceDto);
  }

  @Get(':id/preferences')
  @ApiOperation({ summary: 'Get travel preferences for user' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'Travel preferences retrieved' })
  async getTravelPreferences(@Param('id') id: string) {
    return this.userProfileService.getTravelPreferences(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get travel history for user' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'Travel history retrieved' })
  async getTravelHistory(@Param('id') id: string) {
    return this.userProfileService.getTravelHistory(id);
  }
}