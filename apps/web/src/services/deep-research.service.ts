import axios from 'axios';

// Interface cho source với title và URI
interface SourceInfo {
  title: string;
  uri: string;
}

interface DeepResearchRequest {
  query: string;
  userId?: string;
  sessionId?: string;
}

interface DeepResearchResponse {
  content: string;
  thinkingContent: string;
  sources: SourceInfo[];
  searchQueries: string[];
  success: boolean;
  error?: string;
  memoriesUsed?: number;
}

// SSE Event types matching backend
export interface DeepResearchStreamEvent {
  type: 'connected' | 'start' | 'thinking' | 'search_query' | 'content' | 'sources' | 'done' | 'error' | 'memory';
  content?: string;
  sources?: SourceInfo[];
  searchQueries?: string[];
  error?: string;
  memoriesUsed?: number;
}

class DeepResearchService {
  private baseURL: string;

  constructor() {
    // Use Vite proxy in development, direct URL in production
    // @ts-expect-error - Vite injects import.meta.env at build time
    this.baseURL = import.meta.env.PROD ?
      // @ts-expect-error - Vite injects import.meta.env at build time
      (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3005') :
      ''; // Use relative URL for Vite proxy
  }

  async search(query: string, userId?: string, sessionId?: string): Promise<DeepResearchResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/v1/deep-research`,
        { query, userId, sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes timeout for deep research
        }
      );

      const backendResponse = response.data;
      if (backendResponse.success && backendResponse.data) {
        return {
          content: backendResponse.data.content || '',
          thinkingContent: backendResponse.data.thinkingContent || '',
          sources: backendResponse.data.sources || [],
          searchQueries: backendResponse.data.searchQueries || [],
          success: true,
          memoriesUsed: backendResponse.data.memoriesUsed || 0
        };
      } else {
        throw new Error(backendResponse.error || 'Deep research failed');
      }
    } catch (error) {
      console.error('Deep Research Service Error:', error);

      if (axios.isAxiosError(error)) {
        throw new Error(`Deep Research failed: ${error.response?.data?.message || error.message}`);
      }

      throw new Error('Deep Research service unavailable');
    }
  }

  /**
   * Stream deep research với parsed SSE events
   * Trả về AsyncGenerator để caller có thể iterate từng event
   */
  async *searchWithStreamParsed(query: string, userId?: string, sessionId?: string): AsyncGenerator<DeepResearchStreamEvent> {
    const response = await fetch(`${this.baseURL}/api/v1/deep-research/stream`, {
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
  private parseSSEBuffer(buffer: string): DeepResearchStreamEvent[] {
    const events: DeepResearchStreamEvent[] = [];
    const lines = buffer.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) {
            const event = JSON.parse(jsonStr) as DeepResearchStreamEvent;
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
}

export const deepResearchService = new DeepResearchService();
export type { DeepResearchResponse, DeepResearchRequest, SourceInfo };