import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, IsEnum, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '../types';

export class CreateTripDto {
  @ApiProperty({ description: 'User ID who creates the trip' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Trip name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Trip description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Trip start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Trip end date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Number of people', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiPropertyOptional({ description: 'Minimum budget' })
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Maximum budget' })
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Travel preferences' })
  @IsOptional()
  @IsObject()
  preferences?: any;
}

export class UpdateTripDto {
  @ApiPropertyOptional({ description: 'Trip name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Trip description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Trip status' })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @ApiPropertyOptional({ description: 'Trip start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Trip end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of people' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiPropertyOptional({ description: 'Minimum budget' })
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Maximum budget' })
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Travel preferences' })
  @IsOptional()
  @IsObject()
  preferences?: any;
  @ApiPropertyOptional({ description: 'Trip budget detailed' })
  @IsOptional()
  @IsObject()
  budget?: any;
}

export class CreateItineraryDto {
  @ApiProperty({ description: 'Trip ID' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Day index (0-based)' })
  @IsNumber()
  @Min(0)
  dayIndex: number;

  @ApiProperty({ description: 'Place ID or name' })
  @IsString()
  @IsNotEmpty()
  placeId: string;

  @ApiPropertyOptional({ description: 'Place name' })
  @IsOptional()
  @IsString()
  placeName?: string;

  @ApiPropertyOptional({ description: 'Start time' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Estimated cost' })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}