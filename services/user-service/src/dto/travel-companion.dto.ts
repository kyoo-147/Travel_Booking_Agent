import { IsEnum, IsString, IsOptional, IsArray, IsNumber, IsDateString, IsUUID, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationshipType, MobilityLevel } from '../entities/travel-companion.entity';
import { InvitationType } from '../entities/companion-invitation.entity';

export class CreateCompanionInvitationDto {
  @ApiProperty({ enum: InvitationType, description: 'Loại lời mời' })
  @IsEnum(InvitationType)
  type: InvitationType;

  @ApiPropertyOptional({ description: 'Email người nhận lời mời' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'ID người dùng nhận lời mời' })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'Tên người nhận lời mời' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName?: string;

  @ApiPropertyOptional({ description: 'Tin nhắn kèm theo lời mời' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ enum: RelationshipType, description: 'Loại mối quan hệ' })
  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  @ApiPropertyOptional({ description: 'Tin nhắn phản hồi' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  responseMessage?: string;
}

export class UpdateCompanionDto {
  @ApiPropertyOptional({ enum: RelationshipType, description: 'Loại mối quan hệ' })
  @IsOptional()
  @IsEnum(RelationshipType)
  relationship?: RelationshipType;

  @ApiPropertyOptional({ description: 'Sở thích ẩm thực' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodPreferences?: string[];

  @ApiPropertyOptional({ enum: MobilityLevel, description: 'Mức độ di chuyển' })
  @IsOptional()
  @IsEnum(MobilityLevel)
  mobilityLevel?: MobilityLevel;

  @ApiPropertyOptional({ description: 'Thói quen du lịch' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelHabits?: string[];

  @ApiPropertyOptional({ description: 'Điểm tương thích (0-100)' })
  @IsOptional()
  @IsNumber()
  compatibilityScore?: number;
}

export class ConnectByUserIdDto {
  @ApiProperty({ description: 'ID người dùng cần kết nối' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  userId: string;

  @ApiProperty({ enum: RelationshipType, description: 'Loại mối quan hệ' })
  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  @ApiPropertyOptional({ description: 'Tin nhắn kèm theo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateTravelPreferencesDto {
  @ApiPropertyOptional({ description: 'Phong cách ẩm thực' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodStyle?: string[];

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], description: 'Mức độ hoạt động' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  activityLevel?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'Khoảng ngân sách' })
  @IsOptional()
  @IsString()
  budgetRange?: string;
}