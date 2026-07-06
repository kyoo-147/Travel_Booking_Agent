import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// RAG ingest removed - booking agent operates independently
// import { ingestUserContext } from '../rag/ingest';
// import { queryAgentWithRAG } from '../rag/ragQuery';
import { sessionStore } from '../rag/sessionStore';
import { AzureAIService } from '../services/azure-ai.service';
import { BookingState } from '../types/agent.types';

const router = Router();
const azureAIService = new AzureAIService(
    process.env.ENDPOINT || 'https://models.github.ai/inference',
    process.env.GITHUB_TOKEN || '',
    process.env.MODEL_NAME || 'openai/gpt-4o-mini'
);

/**
 * POST /api/booking/context
 * Ingest user booking context into RAG pipeline
 */
router.post('/context', async (req: Request, res: Response) => {
    try {
        const { userId, sessionId, context } = req.body;

        if (!userId || !context) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, context'
            });
        }

        // Generate sessionId if not provided
        const finalSessionId = sessionId || `session_${uuidv4()}`;

        console.log(`[API /context] Saving context for session ${finalSessionId}`);

        // RAG ingest removed - save session directly without ChromaDB
        // const chunksStored = await ingestUserContext(userId, finalSessionId, context);

        // Save session
        sessionStore.saveSession(finalSessionId, {
            userId,
            state: BookingState.INPUT_READY,
            context,
            history: []
        });

        res.json({
            success: true,
            sessionId: finalSessionId,
            message: 'Context đã được lưu',
            data: {
                // chunksStored removed - no longer using RAG
                sessionState: 'READY'
            }
        });
    } catch (error: any) {
        console.error('[API /context] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to ingest context'
        });
    }
});

/**
 * POST /api/booking/query
 * Query agent with RAG pipeline
 */
router.post('/query', async (req: Request, res: Response) => {
    try {
        const { sessionId, userId, message, history } = req.body;

        if (!sessionId || !userId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionId, userId, message'
            });
        }

        console.log(`[API /query] Query from session ${sessionId}: "${message}"`);

        // ✅ NEW APPROACH: Use orchestrator directly (it includes RAG internally)
        // This ensures actions (like Zalo messaging) are executed
        const { bookingOrchestrator } = require('../services/booking-orchestrator');

        const result = await bookingOrchestrator.handleBookingRequest(
            sessionId,
            null, // No new booking request, just processing message
            history || []
        );

        console.log(`[API /query] Orchestrator result:`, result);

        // Extract action info for frontend (orchestrator returns execution result)
        // We need to return friendly mappings
        res.json({
            success: true,
            data: {
                // Frontend expects these fields
                message: result.content || result.messageDraft,
                requiresUserApproval: result.type === 'booking_payment_request',
                paymentInfo: result.data || null,
                // Include raw result for debugging
                rawResult: result
            }
        });
    } catch (error: any) {
        console.error('[API /query] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to query agent'
        });
    }
});

/**
 * GET /api/booking/session/:sessionId
 * Get session state
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = sessionStore.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        console.error('[API /session] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get session'
        });
    }
});

/**
 * POST /api/booking/confirm-payment
 * User confirms or rejects payment
 */
router.post('/confirm-payment', async (req: Request, res: Response) => {
    try {
        const { sessionId, approved } = req.body;

        if (!sessionId || approved === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionId, approved'
            });
        }

        const session = sessionStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        if (approved) {
            // User approved payment
            sessionStore.updateSessionState(sessionId, BookingState.CONFIRMED);
            sessionStore.addMessageToHistory(
                sessionId,
                'user',
                'Đồng ý điều kiện thanh toán'
            );

            res.json({
                success: true,
                message: 'Payment confirmed, booking will proceed'
            });
        } else {
            // User rejected payment
            sessionStore.updateSessionState(sessionId, BookingState.CANCELLED);
            sessionStore.addMessageToHistory(
                sessionId,
                'user',
                'Từ chối điều kiện thanh toán'
            );

            res.json({
                success: true,
                message: 'Payment rejected, booking cancelled'
            });
        }
    } catch (error: any) {
        console.error('[API /confirm-payment] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to confirm payment'
        });
    }
});

export default router;
