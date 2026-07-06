import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Trip } from './trip.entity';

/**
 * BookingConversation Entity
 * Lưu trữ lịch sử chat giữa AI Agent và khách sạn qua Zalo
 * Được tạo tự động khi AI Service hoàn thành booking
 */
@Entity('booking_conversations')
export class BookingConversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Link to trip (created after conversation completes)
    @Column({ nullable: true })
    @Index()
    tripId: string;

    @ManyToOne(() => Trip, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tripId' })
    trip: Trip;

    // Session tracking from AI Service
    @Column({ unique: true })
    @Index()
    sessionId: string; // Maps to AI Service session

    @Column({ nullable: true })
    aiServiceSessionId: string; // Optional backup reference

    // Zalo conversation tracking
    @Column({ nullable: true })
    zaloAccountId: string; // User's Zalo account

    @Column({ nullable: true })
    zaloConversationId: string; // Hotel's Zalo conversation ID

    // Hotel contact information
    @Column({ type: 'jsonb' })
    hotelContact: {
        name: string;
        zaloPhone: string;
        zaloUserId?: string;
    };

    // Original booking request from form (complete snapshot)
    @Column({ type: 'jsonb' })
    bookingRequest: {
        userContact: {
            displayName?: string;
            contactPhone: string;
            contactEmail: string;
            communicationStyle: string;
            preferredLanguage: string;
        };
        tripDetails: {
            destination: string;
            checkInDate: string;
            checkOutDate: string;
            numberOfGuests: number;
            numberOfRooms: number;
            budgetMinPerNight: number;
            budgetMaxPerNight: number;
            accommodationType: string;
            urgencyLevel: string;
            mustHaveAmenities: Record<string, boolean>;
            preferredAmenities?: Record<string, boolean>;
            note?: string;
        };
    };

    // Conversation messages (full chat history)
    @Column({ type: 'jsonb', default: '[]' })
    messages: Array<{
        role: 'user' | 'assistant'; // user = agent, assistant = hotel
        content: string;
        timestamp: string;
    }>;

    // Agent actions (AI decisions history)
    @Column({ type: 'jsonb', default: '[]' })
    agentActions: Array<{
        intent: string;
        thought_process: string;
        messageDraft: string;
        stateSuggestion: string;
        timestamp: string;
        requiresUserConfirmation: boolean;
        paymentRequest?: any;
    }>;

    // Payment information (if booking confirmed)
    @Column({ type: 'jsonb', nullable: true })
    paymentInfo: {
        amount: number;
        currency: string;
        confirmedAt: string;
        method: string;
    } | null;

    // FSM State (matches AI Service BookingState enum)
    @Column({ default: 'INPUT_READY' })
    @Index()
    state: string; // INPUT_READY, CONTACTING_HOTEL, NEGOTIATING, WAITING_USER_CONFIRM_PAYMENT, CONFIRMED, CANCELLED

    // Legacy metadata (keep for compatibility)
    @Column('jsonb', { nullable: true })
    metadata: any;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;
}

