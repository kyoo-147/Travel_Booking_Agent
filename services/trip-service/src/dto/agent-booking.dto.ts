import { IsString, IsNotEmpty, IsObject, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating Trip from AI Agent booking
 * Called by AI Service when booking is complete
 */
export class CreateTripFromBookingDto {
    @ApiProperty({ description: 'AI Service session ID (unique)' })
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @ApiProperty({ description: 'User UUID' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Complete booking data from AI Service' })
    @IsObject()
    @IsNotEmpty()
    bookingData: {
        userContact: {
            displayName?: string;
            contactPhone: string;
            contactEmail: string;
            communicationStyle: string;
            preferredLanguage: string;
        };
        hotelContact: {
            name: string;
            zaloPhone: string;
            zaloUserId?: string;
        };
        tripDetails: {
            destination: string;
            checkInDate: string;
            checkOutDate: string;
            numberOfGuests: number;
            numberOfRooms: number;
            budgetMinPerNight: number;
            budgetMaxPerNight: number;
            totalTripBudget?: number; // 🆕 NEW: Total budget for entire trip
            accommodationType: string;
            urgencyLevel: string;
            mustHaveAmenities: Record<string, boolean>;
            preferredAmenities?: Record<string, boolean>;
            note?: string;
        };
        messages: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: string;
        }>;
        agentActions?: Array<{
            intent: string;
            thought_process: string;
            messageDraft: string;
            stateSuggestion: string;
            timestamp: string;
            requiresUserConfirmation: boolean;
            paymentRequest?: any;
        }>;
        paymentInfo?: {
            amount: number;
            currency: string;
            confirmedAt: string;
            method: string;
        };
        completedAt: string;
        state: 'CONFIRMED' | 'CANCELLED';
    };
}

/**
 * Response พื้นฐาC for conversation queries
 */
export class ConversationResponseDto {
    @ApiProperty()
    conversationId: string;

    @ApiProperty()
    sessionId: string;

    @ApiProperty()
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;

    @ApiProperty()
    agentActions: Array<any>;

    @ApiProperty()
    hotelContact: {
        name: string;
        zaloPhone: string;
        zaloUserId?: string;
    };

    @ApiProperty()
    state: string;

    @ApiProperty()
    timeline: {
        started: string;
        completed: string;
        duration: number; // in seconds
    };
}

/**
 * Response khi tạo trip từ booking
 */
export class CreateTripFromBookingResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    tripId: string;

    @ApiProperty()
    bookingConversationId: string;

    @ApiProperty()
    message: string;
}
