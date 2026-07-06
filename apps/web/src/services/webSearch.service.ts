import axios from 'axios';

interface WebSearchRequest {
  query: string;
  userId?: string;
  sessionId?: string;
}

interface WebSearchResponse {
  content: string;
  sources: { title: string; uri: string }[];
  success: boolean;
  error?: string;
  memoriesUsed?: number;
}

// SSE Event types matching backend
interface WebSearchStreamEvent {
  type: 'connected' | 'content' | 'sources' | 'done' | 'error' | 'memory';
  content?: string;
  sources?: { title: string; uri: string }[];
  searchQueries?: string[];
  error?: string;
  memoriesUsed?: number;
}

class WebSearchService {
  private baseURL: string;

  constructor() {
    // Use Vite proxy in development, direct URL in production
    this.baseURL = import.meta.env.PROD ?
      (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3005') :
      ''; // Use relative URL for Vite proxy
  }

  async search(query: string, userId?: string, sessionId?: string): Promise<WebSearchResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/v1/web-search`,
        { query, userId, sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const backendResponse = response.data;
      if (backendResponse.success && backendResponse.data) {
        return {
          content: backendResponse.data.content || '',
          sources: backendResponse.data.sources || [],
          success: true,
          memoriesUsed: backendResponse.data.memoriesUsed || 0
        };
      } else {
        throw new Error(backendResponse.error || 'Web search failed');
      }
    } catch (error) {
      console.error('Web Search Service Error:', error);

      if (axios.isAxiosError(error)) {
        throw new Error(`Web Search failed: ${error.response?.data?.message || error.message}`);
      }

      throw new Error('Web Search service unavailable');
    }
  }

  /**
   * Stream search với parsed SSE events
   * Trả về AsyncGenerator để caller có thể iterate từng event
   */
  async *searchWithStreamParsed(query: string, userId?: string, sessionId?: string): AsyncGenerator<WebSearchStreamEvent> {
    const response = await fetch(`${this.baseURL}/api/v1/web-search/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, userId, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            const events = this.parseSSEBuffer(buffer);
            for (const event of events) {
              yield event;
            }
          }
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from buffer
        const events = this.parseSSEBuffer(buffer);

        // Keep incomplete event in buffer
        const lastDoubleNewline = buffer.lastIndexOf('\n\n');
        if (lastDoubleNewline !== -1) {
          buffer = buffer.slice(lastDoubleNewline + 2);
        }

        // Yield each parsed event
        for (const event of events) {
          yield event;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse SSE buffer thành các events hoàn chỉnh
   */
  private parseSSEBuffer(buffer: string): WebSearchStreamEvent[] {
    const events: WebSearchStreamEvent[] = [];
    const lines = buffer.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) {
            const event = JSON.parse(jsonStr) as WebSearchStreamEvent;
            events.push(event);
          }
        } catch (e) {
          // Incomplete JSON, will be processed in next chunk
          console.debug('Incomplete SSE event, waiting for more data');
        }
      }
    }

    return events;
  }

  /**
   * Legacy method - trả về ReadableStream raw
   * @deprecated Use searchWithStreamParsed instead
   */
  async searchWithStream(query: string, userId?: string, sessionId?: string): Promise<ReadableStream<string>> {
    const response = await fetch(`${this.baseURL}/api/v1/web-search/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, userId, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    return new ReadableStream({
      start(controller) {
        function pump(): Promise<void> {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            const text = new TextDecoder().decode(value);
            controller.enqueue(text);
            return pump();
          });
        }
        return pump();
      }
    });
  }
}

export const webSearchService = new WebSearchService();
export type { WebSearchResponse, WebSearchRequest, WebSearchStreamEvent };