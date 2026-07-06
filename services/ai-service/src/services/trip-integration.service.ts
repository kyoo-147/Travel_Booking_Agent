import axios from 'axios';
import { sessionStore } from '../rag/sessionStore';

/**
 * Trip Integration Service
 * Connects AI Service to Trip Service
 * Saves completed bookings to Trip database
 */
export class TripIntegrationService {
    private tripServiceBaseUrl: string;

    constructor() {
        this.tripServiceBaseUrl = process.env.TRIP_SERVICE_URL || 'http://localhost:3003';
    }

    /**
     * Save completed booking to Trip Service
     * Called when BookingState reaches CONFIRMED
     */
    async saveTripAfterBooking(sessionId: string): Promise<{ tripId: string; conversationId: string } | null> {
        try {
            console.log(`[TripIntegration] Saving trip for session ${sessionId}...`);

            // Get session data
            const session = sessionStore.getSession(sessionId);
            if (!session) {
                console.error(`[TripIntegration] Session ${sessionId} not found`);
                return null;
            }

            // Validate session state
            if (session.state !== 'CONFIRMED' && session.state !== 'CANCELLED') {
                console.warn(`[TripIntegration] Session ${sessionId} not in final state (${session.state})`);
                return null;
            }

            // Extract payment info from context or history
            const paymentInfo = this.extractPaymentInfo(session);

            // Build payload
            const payload = {
                sessionId,
                userId: session.userId,
                bookingData: {
                    userContact: session.context.userContact,
                    hotelContact: session.context.hotelContact || {
                        name: session.context.tripDetails?.hotelName || 'Unknown Hotel',
                        zaloPhone: session.context.tripDetails?.hotelContactPhone || '',
                        zaloUserId: session.context.hotelContact?.zaloUserId
                    },
                    tripDetails: session.context.tripDetails,
                    messages: session.history,
                    agentActions: session.context.agentActions || [],
                    paymentInfo,
                    completedAt: new Date().toISOString(),
                    state: session.state
                }
            };

            console.log(`[TripIntegration] Payload prepared for session ${sessionId}`);

            // Call Trip Service API
            const response = await axios.post(
                `${this.tripServiceBaseUrl}/api/trips/agent-bookings/from-booking`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (response.data.success) {
                console.log(`[TripIntegration] ✅ Trip created successfully:`, {
                    tripId: response.data.tripId,
                    conversationId: response.data.bookingConversationId
                });

                return {
                    tripId: response.data.tripId,
                    conversationId: response.data.bookingConversationId
                };
            }

            console.warn(`[TripIntegration] Unexpected response:`, response.data);
            return null;

        } catch (error: any) {
            console.error(`[TripIntegration] ❌ Failed to save trip for session ${sessionId}:`, {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Don't throw - booking already succeeded from user perspective
            // Log to dead letter queue or retry later
            await this.saveToDeadLetterQueue(sessionId, error);

            return null;
        }
    }

    /**
     * Extract payment info from session context or history
     * Priority: paymentInfo > agent actions > hotel messages > form budget
     */
    private extractPaymentInfo(session: any): any {
        // 1. Try to find payment info in context (best source)
        if (session.context.paymentInfo) {
            return session.context.paymentInfo;
        }

        // 2. Try to extract from agent actions
        const paymentAction = session.context.agentActions?.find(
            (action: any) => action.paymentRequest
        );

        if (paymentAction?.paymentRequest) {
            return {
                amount: paymentAction.paymentRequest.amount,
                currency: paymentAction.paymentRequest.currency || 'VND',
                method: paymentAction.paymentRequest.method || 'bank_transfer',
                confirmedAt: new Date().toISOString()
            };
        }

        // 3. NEW: Try to extract ACTUAL price from hotel messages in history
        const priceFromHistory = this.extractPriceFromHistory(session.history);
        const tripDetails = session.context.tripDetails;

        if (priceFromHistory && tripDetails) {
            const nights = this.calculateNights(tripDetails.checkInDate, tripDetails.checkOutDate);
            console.log(`[TripIntegration] 💰 Extracted price from history: ${priceFromHistory}/night × ${nights} nights`);

            return {
                amount: priceFromHistory * nights,
                pricePerNight: priceFromHistory,
                nights,
                currency: 'VND',
                method: 'bank_transfer',
                confirmedAt: new Date().toISOString(),
                source: 'hotel_message'
            };
        }

        // 4. Fallback: calculate from trip details (form input - not recommended)
        if (tripDetails) {
            const avgBudget = (tripDetails.budgetMinPerNight + tripDetails.budgetMaxPerNight) / 2;
            const nights = this.calculateNights(tripDetails.checkInDate, tripDetails.checkOutDate);

            console.warn(`[TripIntegration] ⚠️ Using form budget as fallback: ${avgBudget}/night`);

            return {
                amount: avgBudget * nights,
                pricePerNight: avgBudget,
                nights,
                currency: 'VND',
                method: 'bank_transfer',
                confirmedAt: new Date().toISOString(),
                source: 'form_budget_fallback'
            };
        }

        return null;
    }

    /**
     * Extract price per night from conversation history
     * Looks for patterns like "600k", "500.000", "1tr", etc.
     */
    private extractPriceFromHistory(history: any[]): number | null {
        if (!history || history.length === 0) return null;

        // Look for hotel messages (role === 'assistant' with sender === 'hotel')
        for (const msg of history) {
            // Skip non-hotel messages
            if (msg.role !== 'assistant') continue;

            const content = msg.content?.toLowerCase() || '';

            // Pattern 1: "600k", "500k/đêm", etc.
            const kPattern = /(\d+)\s*k\s*(\/\s*đêm)?/i;
            const kMatch = content.match(kPattern);
            if (kMatch) {
                const price = parseInt(kMatch[1]) * 1000;
                console.log(`[TripIntegration] Found price pattern '${kMatch[0]}' → ${price} VND`);
                return price;
            }

            // Pattern 2: "1tr", "1.5tr", "2 triệu"
            const trPattern = /(\d+(?:\.\d+)?)\s*(tr|triệu)\s*(\/\s*đêm)?/i;
            const trMatch = content.match(trPattern);
            if (trMatch) {
                const price = parseFloat(trMatch[1]) * 1000000;
                console.log(`[TripIntegration] Found price pattern '${trMatch[0]}' → ${price} VND`);
                return price;
            }

            // Pattern 3: "500.000", "1.200.000" (with dots)
            const dotPattern = /(\d{1,3}(?:\.\d{3})+)\s*(đ|vnd|vnđ)?\s*(\/\s*đêm)?/i;
            const dotMatch = content.match(dotPattern);
            if (dotMatch) {
                const price = parseInt(dotMatch[1].replace(/\./g, ''));
                console.log(`[TripIntegration] Found price pattern '${dotMatch[0]}' → ${price} VND`);
                return price;
            }

            // Pattern 4: "giá là 600000", "phòng 800000"
            const numPattern = /giá\s*(?:là|:)?\s*(\d{5,})\s*(đ|vnd)?/i;
            const numMatch = content.match(numPattern);
            if (numMatch) {
                const price = parseInt(numMatch[1]);
                console.log(`[TripIntegration] Found price pattern '${numMatch[0]}' → ${price} VND`);
                return price;
            }
        }

        return null;
    }

    /**
     * Calculate number of nights
     */
    private calculateNights(checkIn: string, checkOut: string): number {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Save failed requests to dead letter queue for manual processing
     */
    private async saveToDeadLetterQueue(sessionId: string, error: any): Promise<void> {
        // TODO: Implement actual DLQ (Redis, Database, or File)
        const dlqEntry = {
            sessionId,
            failedAt: new Date().toISOString(),
            error: {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            },
            retryCount: 0
        };

        console.error(`[TripIntegration] DLQ Entry:`, JSON.stringify(dlqEntry, null, 2));

        // For MVP: just log to console
        // In production: save to Redis list or database table
    }

    /**
     * Retry failed trip saves from DLQ
     */
    async retryFromDeadLetterQueue(): Promise<void> {
        // TODO: Implement DLQ retry logic
        console.log('[TripIntegration] DLQ retry not implemented yet');
    }
}

// Singleton instance
export const tripIntegrationService = new TripIntegrationService();
