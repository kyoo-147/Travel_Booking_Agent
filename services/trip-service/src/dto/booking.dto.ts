import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingType, BookingStatus } from '../types';

export class CreateBookingDto {
  @ApiProperty({ description: 'Trip ID' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Booking type', enum: BookingType })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({ description: 'Provider name' })
  @IsString()
  @IsNotEmpty()
  providerName: string;

  @ApiProperty({ description: 'Booking reference from provider' })
  @IsString()
  @IsNotEmpty()
  providerReference: string;

  @ApiPropertyOptional({ description: 'Service name/description' })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiPropertyOptional({ description: 'Booking amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Booking details (JSON)' })
  @IsOptional()
  bookingDetails?: any;

  @ApiPropertyOptional({ description: 'Confirmation data (JSON)' })
  @IsOptional()
  confirmationData?: any;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Booking status', enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Service name/description' })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiPropertyOptional({ description: 'Booking amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Booking details (JSON)' })
  @IsOptional()
  bookingDetails?: any;

  @ApiPropertyOptional({ description: 'Confirmation data (JSON)' })
  @IsOptional()
  confirmationData?: any;
}