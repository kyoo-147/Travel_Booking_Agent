import { Request, Response } from 'express';
import { WebSearchService } from '../services/web-search.service';

const webSearchService = new WebSearchService();

/**
 * Non-streaming web search endpoint
 */
export const webSearch = async (req: Request, res: Response) => {
  try {
    const { query, userId, sessionId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    // Pass userId and sessionId for memory integration
    const result = await webSearchService.search(query, userId, sessionId);

    res.json({
      success: result.success,
      data: {
        content: result.content,
        sources: result.sources,
        searchQueries: result.searchQueries,
        memoriesUsed: result.memoriesUsed,
      },
      error: result.error,
    });

  } catch (error) {
    console.error('Web search controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Streaming web search endpoint using Server-Sent Events (SSE)
 * Streams text chunks to client in real-time
 */
export const webSearchStream = async (req: Request, res: Response) => {
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
      const stream = webSearchService.searchWithStream(query, userId, sessionId);

      for await (const event of stream) {
        // Send each event to client
        res.write(`data: ${JSON.stringify(event)}\n\n`);

        // Note: Express handles flushing automatically for SSE
      }

    } catch (streamError) {
      console.error('Web search stream error:', streamError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: streamError instanceof Error ? streamError.message : 'Stream error'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Web search stream controller error:', error);

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