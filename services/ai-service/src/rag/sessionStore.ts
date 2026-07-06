import { BookingState } from "../types/agent.types";

export interface SessionData {
    sessionId: string;
    userId: string;
    state: BookingState;
    context: any; // BookingContext
    history: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

/**
 * In-memory session store (MVP)
 * TODO: Replace with Redis for production
 */
class SessionStore {
    private sessions: Map<string, SessionData> = new Map();

    /**
     * Save or update session
     */
    saveSession(sessionId: string, data: Partial<SessionData>): SessionData {
        const existing = this.sessions.get(sessionId);

        const sessionData: SessionData = {
            sessionId,
            userId: data.userId || existing?.userId || '',
            state: data.state || existing?.state || BookingState.INPUT_READY,
            context: data.context || existing?.context || {},
            history: data.history || existing?.history || [],
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.sessions.set(sessionId, sessionData);
        console.log(`[SessionStore] Saved session ${sessionId}`);
        return sessionData;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): SessionData | null {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`[SessionStore] Session ${sessionId} not found`);
            return null;
        }
        return session;
    }

    /**
     * Update session state (FSM transition)
     */
    updateSessionState(sessionId: string, newState: BookingState): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.state = newState;
            session.updatedAt = new Date().toISOString();
            this.sessions.set(sessionId, session);
            console.log(`[SessionStore] Updated session ${sessionId} state to ${newState}`);
        }
    }

    /**
     * Add message to history
     */
    addMessageToHistory(
        sessionId: string,
        role: 'user' | 'assistant',
        content: string
    ): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.history.push({
                role,
                content,
                timestamp: new Date().toISOString(),
            });
            session.updatedAt = new Date().toISOString();
            this.sessions.set(sessionId, session);
        }
    }

    /**
     * Delete session
     */
    deleteSession(sessionId: string): boolean {
        const deleted = this.sessions.delete(sessionId);
        if (deleted) {
            console.log(`[SessionStore] Deleted session ${sessionId}`);
        }
        return deleted;
    }

    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): SessionData[] {
        const userSessions: SessionData[] = [];
        this.sessions.forEach((session) => {
            if (session.userId === userId) {
                userSessions.push(session);
            }
        });
        return userSessions;
    }

    /**
     * Set hotel mapping for a session (Phase 4)
     * Store hotel phone in session context for reverse lookup
     */
    setHotelMapping(sessionId: string, hotelPhone: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Store hotel phone in context metadata
            session.context = session.context || {};
            session.context.hotelPhone = hotelPhone;
            session.updatedAt = new Date().toISOString();
            this.sessions.set(sessionId, session);
            console.log(`[SessionStore] Mapped session ${sessionId} to hotel ${hotelPhone}`);
        }
    }

    /**
     * Find session by hotel contact (Phase 4)
     * Used by webhook to identify which session a hotel reply belongs to
     * Can search by either phone number or Zalo UID
     * 
     * FIXED: Now finds the MOST RECENT ACTIVE session instead of first match
     * This prevents old sessions from "stealing" hotel replies
     */
    findSessionByHotel(accountId: string, hotelIdentifier: string): string | null {
        let bestMatch: { sessionId: string; updatedAt: string } | null = null;

        for (const [sessionId, session] of this.sessions.entries()) {
            // Skip completed/cancelled sessions - they shouldn't receive new messages
            if (session.state === 'CONFIRMED' || session.state === 'CANCELLED') {
                continue;
            }

            const sessionHotelPhone =
                session.context?.hotelContact?.zaloPhone ||
                session.context?.tripDetails?.hotelContactPhone ||
                session.context?.hotelPhone;

            const sessionHotelUid = session.context?.hotelContact?.zaloUserId;

            // Match by either phone OR UID
            if (sessionHotelPhone === hotelIdentifier || sessionHotelUid === hotelIdentifier) {
                // Keep track of the most recent session
                if (!bestMatch || session.updatedAt > bestMatch.updatedAt) {
                    bestMatch = { sessionId, updatedAt: session.updatedAt };
                }
            }
        }

        if (bestMatch) {
            console.log(`[SessionStore] ✅ Found best session ${bestMatch.sessionId} for hotel ${hotelIdentifier} (State: ${this.sessions.get(bestMatch.sessionId)?.state})`);
            return bestMatch.sessionId;
        }

        console.warn(`[SessionStore] ⚠️ No active session found for hotel ${hotelIdentifier}`);
        return null;
    }
}

// Singleton instance
export const sessionStore = new SessionStore();
