import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AgentBookingService } from '../services/agent-booking.service';
import {
    CreateTripFromBookingDto,
    CreateTripFromBookingResponseDto,
    ConversationResponseDto
} from '../dto/agent-booking.dto';

@ApiTags('agent-bookings')
@Controller('trips/agent-bookings')
export class AgentBookingController {
    constructor(private readonly agentBookingService: AgentBookingService) {}

    /**
     * Create Trip from AI Agent booking
     * Called by AI Service when booking is confirmed/cancelled
     */
    @Post('from-booking')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create trip from AI Agent booking session',
        description: 'Transforms AI booking session data into Trip and saves conversation history'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Trip and conversation created successfully',
        type: CreateTripFromBookingResponseDto
    })
    @ApiResponse({ status: 400, description: 'Invalid data or validation failed' })
    @ApiResponse({ status: 409, description: 'Session already processed (duplicate)' })
    async createFromBooking(
        @Body() dto: CreateTripFromBookingDto
    ): Promise<CreateTripFromBookingResponseDto> {
        try {
            const { trip, conversation } = await this.agentBookingService.createTripFromBooking(dto);

            return {
                success: true,
                tripId: trip.id,
                bookingConversationId: conversation.id,
                message: 'Trip created successfully from agent booking'
            };
        } catch (error: any) {
            if (error.status) {
                throw error; // Re-throw NestJS HTTP exceptions
            }
            throw new HttpException(
                error.message || 'Failed to create trip from booking',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get conversation history for a trip
     * Returns null if trip is not from agent booking
     */
    @Get(':tripId/conversation')
    @ApiOperation({ 
        summary: 'Get agent conversation for trip',
        description: 'Returns chat history, agent actions, and timeline for agent-booked trips'
    })
    @ApiParam({ name: 'tripId', description: 'Trip UUID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Conversation found',
        type: ConversationResponseDto
    })
    @ApiResponse({ status: 404, description: 'Trip not found or has no conversation' })
    async getConversation(
        @Param('tripId') tripId: string
    ): Promise<ConversationResponseDto> {
        return await this.agentBookingService.getConversation(tripId);
    }
}
