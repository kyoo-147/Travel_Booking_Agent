import { Router, Request, Response } from 'express';
import { bookingOrchestrator } from '../services/booking-orchestrator';
import { sessionStore } from '../rag/sessionStore';

const router = Router();

/**
 * POST /api/booking/webhook/zalo
 * Receives messages from Zalo (hotel replies)
 * 
 * Request body format:
 * {
 *   accountId: string,      // User's Zalo account ID
 *   fromUserId: string,     // Hotel's Zalo user ID
 *   fromPhone: string,      // Hotel's phone number
 *   message: string,        // Hotel's reply message
 *   timestamp: string       // ISO timestamp
 * }
 */
router.post('/webhook/zalo', async (req: Request, res: Response) => {
    try {
        const { accountId, fromUserId, fromPhone, message, timestamp } = req.body;

        console.log(`[Webhook] ✉️ Received Zalo message`);
        console.log(`[Webhook] From: ${fromPhone || fromUserId}`);
        console.log(`[Webhook] Message: "${message}"`);

        // Validate required fields
        if (!accountId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: accountId, message'
            });
        }

        const hotelIdentifier = fromPhone || fromUserId;
        if (!hotelIdentifier) {
            return res.status(400).json({
                success: false,
                error: 'Missing hotel identifier (fromPhone or fromUserId)'
            });
        }

        // Find active session for this hotel contact
        const sessionId = sessionStore.findSessionByHotel(accountId, hotelIdentifier);

        if (!sessionId) {
            console.warn(`[Webhook] ⚠️ No active session found for hotel ${hotelIdentifier}`);
            return res.json({
                success: false,
                reason: 'no_active_session',
                message: 'No active booking session found for this hotel contact'
            });
        }

        console.log(`[Webhook] ✅ Found session: ${sessionId}`);

        // Get session to retrieve conversation history
        const session = sessionStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Add hotel's message to conversation history
        const hotelMessage = {
            role: 'assistant' as const, // Hotel is 'assistant' from agent's perspective
            content: message,
            timestamp: timestamp || new Date().toISOString()
        };

        // Update session history
        session.history = session.history || [];
        session.history.push(hotelMessage);
        sessionStore.saveSession(sessionId, session);

        console.log(`[Webhook] 📝 Added hotel message to session history`);

        // ✅ Emit hotel message to frontend
        if (session.userId) {
            try {
                const axios = require('axios');
                await axios.post('http://localhost:3002/api/notifications/emit-booking-payment', {
                    userId: session.userId,
                    sessionId,
                    agentResponse: {
                        id: Date.now().toString(),
                        type: 'hotel_message',
                        content: message,
                        sender: 'hotel',
                        timestamp: timestamp || new Date().toISOString()
                    }
                }, { timeout: 2000 });
                console.log(`[Webhook] ✅ Hotel message sent to frontend`);
            } catch (err: any) {
                console.error('[Webhook] Failed to emit hotel message:', err.message);
            }
        }

        console.log(`[Webhook] 🤖 Triggering agent to process hotel reply...`);

        // Trigger agent to process hotel's reply and decide next action
        const agentResult = await bookingOrchestrator.handleBookingRequest(
            sessionId,
            null, // No new booking request, just continuing conversation
            session.history
        );

        console.log(`[Webhook] ✅ Agent processed hotel reply`);
        console.log(`[Webhook] Agent response:`, agentResult);

        // ✅ Emit agent response to frontend
        if (session.userId && agentResult) {
            try {
                const axios = require('axios');
                await axios.post('http://localhost:3002/api/notifications/emit-booking-payment', {
                    userId: session.userId,
                    sessionId,
                    agentResponse: {
                        ...agentResult,
                        sender: 'agent' // Agent represents user, so display on right
                    }
                }, { timeout: 2000 });
                console.log(`[Webhook] ✅ Agent response sent to frontend`);
            } catch (err: any) {
                console.error('[Webhook] Failed to emit agent response:', err.message);
            }
        }

        res.json({
            success: true,
            sessionId,
            agentResponse: agentResult,
            message: 'Hotel reply processed and agent responded'
        });

    } catch (error: any) {
        console.error('[Webhook] ❌ Error processing Zalo webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * POST /api/booking/webhook/zalo/test
 * Test endpoint to simulate hotel reply
 */
router.post('/webhook/zalo/test', async (req: Request, res: Response) => {
    try {
        const { sessionId, hotelMessage } = req.body;

        if (!sessionId || !hotelMessage) {
            return res.status(400).json({
                success: false,
                error: 'Missing sessionId or hotelMessage'
            });
        }

        console.log(`[Webhook Test] Simulating hotel reply for session: ${sessionId}`);

        const session = sessionStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Add simulated hotel message
        session.history = session.history || [];
        session.history.push({
            role: 'assistant',
            content: hotelMessage,
            timestamp: new Date().toISOString()
        });
        sessionStore.saveSession(sessionId, session);

        // Trigger agent
        const agentResult = await bookingOrchestrator.handleBookingRequest(
            sessionId,
            null,
            session.history
        );

        res.json({
            success: true,
            sessionId,
            agentResponse: agentResult
        });

    } catch (error: any) {
        console.error('[Webhook Test] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
