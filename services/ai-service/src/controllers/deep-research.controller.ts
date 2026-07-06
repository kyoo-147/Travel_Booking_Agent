import { Request, Response } from 'express';
import { DeepResearchService } from '../services/deep-research.service';

// Initialize Deep Research Service
const deepResearchService = new DeepResearchService();

/**
 * Non-streaming deep research endpoint
 */
export const deepResearch = async (req: Request, res: Response) => {
  try {
    const { query, userId, sessionId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    // Pass userId and sessionId for memory integration
    const result = await deepResearchService.search(query, userId, sessionId);

    res.json({
      success: result.success,
      data: {
        content: result.content,
        thinkingContent: result.thinkingContent,
        sources: result.sources,
        searchQueries: result.searchQueries,
        memoriesUsed: result.memoriesUsed,
      },
      error: result.error,
    });

  } catch (error) {
    console.error('Deep research controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Streaming deep research endpoint using Server-Sent Events (SSE)
 * Streams thinking + content + sources in real-time
 */
export const deepResearchStream = async (req: Request, res: Response) => {
  try {
    const { query, userId, sessionId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    // Set headers for SSE (Server-Sent Events)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    try {
      // Pass userId and sessionId for memory integration
      const stream = deepResearchService.searchWithStream(query, userId, sessionId);

      for await (const event of stream) {
        // Send each event to client
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }

    } catch (streamError) {
      console.error('Deep research stream error:', streamError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: streamError instanceof Error ? streamError.message : 'Stream error'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Deep research stream controller error:', error);

    // If headers not sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`);
      res.end();
    }
  }
};