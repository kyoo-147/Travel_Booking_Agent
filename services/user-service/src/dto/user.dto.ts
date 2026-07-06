import { IsEmail, IsOptional, IsString, IsDateString, IsObject, IsBoolean, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelStyle, HotelClass, TransportPreference } from '../entities/travel-preference.entity';

export class NotificationPreferencesDto {
  @ApiProperty()
  @IsBoolean()
  email: boolean;

  @ApiProperty()
  @IsBoolean()
  sms: boolean;

  @ApiProperty()
  @IsBoolean()
  push: boolean;
}

export class UserPreferencesDto {
  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsObject()
  notifications: NotificationPreferencesDto;
}

export class CreateUserProfileDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defaultBudgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defaultBudgetMax?: number;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defaultBudgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  defaultBudgetMax?: number;
}

export class CreateTravelPreferenceDto {
  @ApiProperty()
  @IsString()
  userProfileId: string;

  @ApiProperty({ enum: TravelStyle })
  @IsEnum(TravelStyle)
  travelStyle: TravelStyle;

  @ApiProperty({ enum: HotelClass })
  @IsEnum(HotelClass)
  preferredHotelClass: HotelClass;

  @ApiProperty({ enum: TransportPreference })
  @IsEnum(TransportPreference)
  preferredTransport: TransportPreference;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredAirlines?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibilityNeeds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}