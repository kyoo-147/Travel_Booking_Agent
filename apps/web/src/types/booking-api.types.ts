// API Type Definitions for Booking RAG Architecture
// These types define the contract between Frontend and Backend

// ============================================
// REQUEST TYPES
// ============================================

export interface BookingContextRequest {
    userId: string;
    sessionId?: string;
    context: {
        userContact: {
            displayName?: string;
            contactPhone: string;
            contactEmail: string;
            preferredLanguage: 'vi' | 'en';
            communicationStyle: 'casual' | 'neutral' | 'polite';
            ageRange?: '18-25' | '26-35' | '36-50' | '50+';
            travelExperience?: 'first_time' | 'occasional' | 'frequent';
            zaloAccountId?: string; // User's Zalo account ID (for sending messages)
        };
        hotelContact: {
            name: string;              // Hotel name
            zaloPhone: string;         // Hotel's Zalo phone number
            zaloUserId?: string;       // Hotel's Zalo user ID (optional, will be obtained after first contact)
        };
        tripDetails: {
            destination: string;
            hotelContactPhone: string; // Required - for agent to contact hotel owner
            checkInDate: string; // ISO 8601
            checkOutDate: string; // ISO 8601
            numberOfGuests: number;
            numberOfRooms: number;
            urgencyLevel: 'NORMAL' | 'URGENT';
            budgetMinPerNight: number;
            budgetMaxPerNight: number;
            accommodationType: 'hotel' | 'resort' | 'homestay' | 'any';
            paymentMethod: string;
            readyToBook: boolean;
            mustHaveAmenities: {
                wifi: boolean;
                airConditioner: boolean;
                privateBathroom: boolean;
            };
            preferredAmenities?: {
                swimmingPool: boolean;
                seaView: boolean;
                breakfastIncluded: boolean;
                parking: boolean;
                elevator: boolean;
                petFriendly: boolean;
            };
            note?: string;
        };
    };
}

export interface BookingQueryRequest {
    sessionId: string;
    userId: string;
    message: string; // SHORT trigger only
    history?: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
}

export interface PaymentConfirmRequest {
    sessionId: string;
    approved: boolean;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface BookingContextResponse {
    success: boolean;
    sessionId: string;
    message: string;
    data?: {
        chunksStored: number;
        sessionState: 'READY' | 'PROCESSING';
    };
}

export type BookingAction = 'SEND_MESSAGE' | 'WAIT_USER_CONFIRMATION' | 'COMPLETED' | 'ERROR';

export type BookingSessionState =
    | 'INPUT_READY'
    | 'CONTACTING_HOTEL'
    | 'NEGOTIATING'
    | 'WAITING_USER_CONFIRM_PAYMENT'
    | 'CONFIRMED'
    | 'CANCELLED';

export interface PaymentInfo {
    amount: number;
    currency: string;
    paymentType: 'deposit' | 'full_payment';
    description: string;
}

export interface BookingQueryResponse {
    success: boolean;
    data: {
        action: BookingAction;
        message?: string;
        requiresUserApproval?: boolean;
        paymentInfo?: PaymentInfo;
        sessionState: BookingSessionState;
        retrievedContext?: string[];
    };
    error?: string;
}

export interface SessionStateResponse {
    success: boolean;
    data: {
        sessionId: string;
        userId: string;
        state: BookingSessionState;
        context: BookingContextRequest['context'];
        history: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: string;
        }>;
        createdAt: string;
        updatedAt: string;
    };
}
