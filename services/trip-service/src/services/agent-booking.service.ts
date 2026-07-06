import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { TripStatus } from '../types';
import { BookingConversation } from '../entities/booking-conversation.entity';
import { CreateTripFromBookingDto, ConversationResponseDto } from '../dto/agent-booking.dto';

@Injectable()
export class AgentBookingService {
    constructor(
        @InjectRepository(Trip)
        private tripRepository: Repository<Trip>,
        @InjectRepository(BookingConversation)
        private conversationRepository: Repository<BookingConversation>,
    ) { }

    /**
     * Create Trip from AI Agent booking
     * Called by AI Service khi booking hoàn thành
     */
    async createTripFromBooking(dto: CreateTripFromBookingDto): Promise<{ trip: Trip; conversation: BookingConversation }> {
        const { sessionId, userId, bookingData } = dto;

        // Check if session already processed (prevent duplicate)
        const existing = await this.conversationRepository.findOne({
            where: { sessionId }
        });

        if (existing) {
            throw new ConflictException(`Session ${sessionId} already processed`);
        }

        // Validate state
        if (bookingData.state !== 'CONFIRMED' && bookingData.state !== 'CANCELLED') {
            throw new BadRequestException('State must be CONFIRMED or CANCELLED');
        }

        // Parse dates
        const startDate = new Date(bookingData.tripDetails.checkInDate);
        const endDate = new Date(bookingData.tripDetails.checkOutDate);

        if (startDate >= endDate) {
            throw new BadRequestException('Check-in date must be before check-out date');
        }

        // Calculate trip duration and budget
        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const avgBudget = (bookingData.tripDetails.budgetMinPerNight + bookingData.tripDetails.budgetMaxPerNight) / 2;

        // 🆕 NEW: Use totalTripBudget if provided, otherwise calculate from per-night budget
        const totalBudget = bookingData.tripDetails.totalTripBudget || (avgBudget * nights);

        // Parse destination
        const destination = this.parseDestination(bookingData.tripDetails.destination);

        // Create Trip entity
        const trip = this.tripRepository.create({
            userId,
            name: `${destination.city} - ${bookingData.hotelContact.name}`,
            status: bookingData.state === 'CONFIRMED' ? TripStatus.CONFIRMED : TripStatus.CANCELLED,
            startDate,
            endDate,
            destination: {
                country: destination.country,
                city: destination.city,
                coordinates: { lat: 0, lng: 0 } // TODO: Geocode later
            },
            participants: bookingData.tripDetails.numberOfGuests,
            budget: {
                total: totalBudget,
                currency: bookingData.paymentInfo?.currency || 'VND',
                breakdown: {
                    accommodation: bookingData.paymentInfo?.amount || totalBudget,
                    flights: 0,
                    activities: 0,
                    food: 0,
                    transport: 0,
                    other: 0
                }
            },
            preferences: {
                pace: 'moderate',
                interests: this.extractInterests(bookingData.tripDetails.mustHaveAmenities),
                mustSee: [],
                avoidances: []
            },
            source: 'agent_booking'
        });

        const savedTrip = await this.tripRepository.save(trip);

        // Create BookingConversation entity
        const conversation = this.conversationRepository.create({
            tripId: savedTrip.id,
            sessionId,
            hotelContact: bookingData.hotelContact,
            bookingRequest: {
                userContact: bookingData.userContact,
                tripDetails: bookingData.tripDetails
            },
            messages: bookingData.messages || [],
            agentActions: bookingData.agentActions || [],
            paymentInfo: bookingData.paymentInfo || null,
            state: bookingData.state,
            completedAt: new Date(bookingData.completedAt)
        });

        const savedConversation = await this.conversationRepository.save(conversation);

        // Update trip with conversation reference
        savedTrip.agent_booking_id = savedConversation.id;
        await this.tripRepository.save(savedTrip);

        return { trip: savedTrip, conversation: savedConversation };
    }

    /**
     * Get conversation by tripId
     */
    async getConversation(tripId: string): Promise<ConversationResponseDto> {
        const conversation = await this.conversationRepository.findOne({
            where: { tripId }
        });

        if (!conversation) {
            throw new NotFoundException(`No conversation found for trip ${tripId}`);
        }

        // Calculate duration
        const started = new Date(conversation.createdAt);
        const completed = conversation.completedAt ? new Date(conversation.completedAt) : new Date();
        const duration = Math.floor((completed.getTime() - started.getTime()) / 1000);

        return {
            conversationId: conversation.id,
            sessionId: conversation.sessionId,
            messages: conversation.messages,
            agentActions: conversation.agentActions,
            hotelContact: conversation.hotelContact,
            state: conversation.state,
            timeline: {
                started: conversation.createdAt.toISOString(),
                completed: conversation.completedAt?.toISOString() || new Date().toISOString(),
                duration
            }
        };
    }

    /**
     * Update conversation state
     */
    async updateConversationState(sessionId: string, state: string): Promise<void> {
        const conversation = await this.conversationRepository.findOne({
            where: { sessionId }
        });

        if (!conversation) {
            throw new NotFoundException(`Conversation not found for session ${sessionId}`);
        }

        conversation.state = state;
        conversation.updatedAt = new Date();

        await this.conversationRepository.save(conversation);
    }

    /**
     * Helper: Parse destination string
     */
    private parseDestination(dest: string): { city: string; country: string } {
        const parts = dest.split(',').map(s => s.trim());

        if (parts.length >= 2) {
            return { city: parts[0], country: parts[1] };
        }

        // Default to Vietnam
        return { city: dest, country: 'Việt Nam' };
    }

    /**
     * Helper: Extract interests from amenities
     */
    private extractInterests(amenities: Record<string, boolean>): string[] {
        const mapping: Record<string, string> = {
            swimmingPool: 'Leisure',
            seaView: 'Nature',
            breakfastIncluded: 'Food',
            wifi: 'Technology',
            airConditioner: 'Comfort'
        };

        return Object.entries(amenities)
            .filter(([key, value]) => value && mapping[key])
            .map(([key]) => mapping[key]);
    }
}
