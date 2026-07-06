import { Request, Response } from 'express';
import { AzureAIService, ChatMessage } from '../services/azure-ai.service';

// Initialize Azure AI Service
const azureAIService = new AzureAIService(
  process.env.ENDPOINT || 'https://models.github.ai/inference',
  process.env.GITHUB_TOKEN || '',
  process.env.MODEL_NAME || 'openai/gpt-4o-mini'
);


import { BookingOrchestrator } from '../services/booking-orchestrator';
const bookingOrchestrator = new BookingOrchestrator(azureAIService);


// NLU Intent classification
export const classifyIntent = (text: string, language: string = 'en') => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') ||
    lowerText.includes('xin chào') || lowerText.includes('chào')) {
    return 'greeting';
  }

  if (lowerText.includes('trip') || lowerText.includes('plan') || lowerText.includes('vacation') ||
    lowerText.includes('chuyến đi') || lowerText.includes('kế hoạch') || lowerText.includes('du lịch')) {
    return 'trip_planning';
  }

  if (lowerText.includes('hotel') || lowerText.includes('accommodation') || lowerText.includes('stay') ||
    lowerText.includes('khách sạn') || lowerText.includes('nơi ở')) {
    return 'hotel_search';
  }

  if (lowerText.includes('flight') || lowerText.includes('airline') || lowerText.includes('fly') ||
    lowerText.includes('máy bay') || lowerText.includes('vé')) {
    return 'flight_search';
  }

  return 'default';
};

// Chat message endpoint
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', context } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Build conversation history
    const messages: ChatMessage[] = [];
    let bookingRequest = null;
    let history = [];
    let userId: string | undefined;
    let sessionId: string | undefined;

    // Handle Context (Object vs Array)
    console.log('[ChatController] Received Context:', JSON.stringify(context, null, 2));

    if (context) {
      if (Array.isArray(context)) {
        // Legacy support or direct API usage
        history = context;
        // Try to find bookingRequest in array if legacy format allowed mixed content (unlikely but safe)
        bookingRequest = context.find((c: any) => c.bookingRequest)?.bookingRequest;
      } else if (typeof context === 'object') {
        // Standard Frontend Contract: { userId, sessionId, conversationHistory, bookingRequest }
        history = context.conversationHistory || [];
        bookingRequest = context.bookingRequest;
        userId = context.userId;
        sessionId = context.sessionId;
      }
    }

    // Add previous messages from history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.sender === 'user' || msg.role === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.sender === 'assistant' || msg.role === 'assistant') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Check for Booking Agent Mode
    // 2. Active Ongoing Negotiation
    const effectiveSessionId = sessionId || 'default_session';
    const hasActiveBooking = bookingOrchestrator.hasActiveSession(effectiveSessionId);

    // Generate AI response
    let response;

    // Check for Booking Agent Mode
    if (bookingRequest || hasActiveBooking) {
      console.log('Using Booking Orchestrator for session', effectiveSessionId);
      response = await bookingOrchestrator.handleBookingRequest(
        effectiveSessionId,
        bookingRequest, // Might be undefined if in middle of convo, Orchestrator should handle that
        messages
      );
    } else {

      // Standard Chat with memory integration
      // Pass userId and sessionId for memory retrieval and storage
      response = await azureAIService.generateChatResponse(
        messages,
        language,
        undefined,  // No custom system prompt
        userId,     // For memory retrieval
        sessionId   // For memory storage
      );
    }


    res.json(response);

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process your message. Please try again.'
    });
  }
};

// Get quick actions
export const getQuickActions = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.query;

    const quickActions = language === 'vi' ? [
      {
        id: 'plan-trip',
        label: 'Lên kế hoạch chuyến đi mới',
        action: 'PLAN_TRIP'
      },
      {
        id: 'find-destination',
        label: 'Tìm điểm đến',
        action: 'FIND_DESTINATION'
      },
      {
        id: 'check-booking',
        label: 'Kiểm tra đặt phòng của tôi',
        action: 'CHECK_BOOKING'
      },
      {
        id: 'get-recommendations',
        label: 'Nhận gợi ý',
        action: 'GET_RECOMMENDATIONS'
      }
    ] : [
      {
        id: 'plan-trip',
        label: 'Plan a new trip',
        action: 'PLAN_TRIP'
      },
      {
        id: 'find-destination',
        label: 'Find destinations',
        action: 'FIND_DESTINATION'
      },
      {
        id: 'check-booking',
        label: 'Check my bookings',
        action: 'CHECK_BOOKING'
      },
      {
        id: 'get-recommendations',
        label: 'Get recommendations',
        action: 'GET_RECOMMENDATIONS'
      }
    ];

    res.json(quickActions);

  } catch (error) {
    console.error('Error getting quick actions:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Execute quick action
// Execute quick action
export const executeQuickAction = async (req: Request, res: Response) => {
  try {
    const { actionId, data, language = 'en' } = req.body;

    // Use Azure AI service to handle quick actions
    const response = await azureAIService.executeQuickAction(actionId, data, language);

    res.json(response);

  } catch (error) {
    console.error('Error executing quick action:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Classify intent endpoint
export const classifyIntentHandler = async (req: Request, res: Response) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intent = classifyIntent(message, language);

    // Simple logic for now, can be enhanced with Azure AI
    const mode = (intent === 'greeting' || intent === 'trip_planning') ? 'auto' : 'manual';

    res.json({
      success: true,
      data: {
        intent,
        mode,
        shouldAutoReply: mode === 'auto'
      }
    });

  } catch (error) {
    console.error('Error classifying intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};