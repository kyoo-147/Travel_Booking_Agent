export interface SSEEvent {
  id?: string;
  event?: string;
  data?: string;
  retry?: number;
}

export interface ParsedEvent {
  [key: string]: any;
  _event?: string;
}

/**
 * Parse a single SSE event line
 */
function parseSSELine(line: string): Partial<SSEEvent> {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return {};
  
  const field = line.slice(0, colonIndex);
  const value = line.slice(colonIndex + 1).trim();
  
  switch (field) {
    case 'id':
      return { id: value };
    case 'event':
      return { event: value };
    case 'data':
      return { data: value };
    case 'retry':
      return { retry: parseInt(value, 10) };
    default:
      return {};
  }
}

/**
 * Parse SSE text into structured events
 */
function parseSSEText(text: string): SSEEvent[] {
  const lines = text.split('\n');
  const events: SSEEvent[] = [];
  let currentEvent: SSEEvent = {};
  
  for (const line of lines) {
    if (line.trim() === '') {
      // Empty line signals end of event
      if (Object.keys(currentEvent).length > 0) {
        events.push(currentEvent);
        currentEvent = {};
      }
    } else if (line.startsWith(':')) {
      // Comment line, ignore
      continue;
    } else {
      const parsed = parseSSELine(line);
      Object.assign(currentEvent, parsed);
    }
  }
  
  // Add final event if present
  if (Object.keys(currentEvent).length > 0) {
    events.push(currentEvent);
  }
  
  return events;
}

/**
 * Parse JSON data from SSE event, handling multiple formats
 */
function parseEventData(data: string): ParsedEvent | null {
  if (!data) return null;
  
  // Handle special markers
  if (data === '[DONE]') {
    return { _event: 'done' };
  }
  
  try {
    return JSON.parse(data);
  } catch (error) {
    // If not valid JSON, return as raw text
    return { _event: 'raw', raw: data };
  }
}

/**
 * Generator that yields parsed JSON events from SSE stream
 */
export async function* sseJsonEvents(
  url: string,
  headers: Record<string, string>,
  payload: any,
  timeout = 30000
): AsyncIterable<ParsedEvent> {
  const axios = require('axios');
  
  try {
    const response = await axios({
      method: 'POST',
      url,
      headers,
      data: payload,
      responseType: 'stream',
      timeout
    });
    
    let buffer = '';
    
    for await (const chunk of response.data) {
      buffer += chunk.toString();
      
      // Process complete lines
      while (buffer.includes('\n\n')) {
        const eventEndIndex = buffer.indexOf('\n\n');
        const eventText = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);
        
        const events = parseSSEText(eventText);
        
        for (const event of events) {
          if (event.data) {
            const parsed = parseEventData(event.data);
            if (parsed) {
              yield parsed;
            }
          }
        }
      }
    }
    
    // Process any remaining buffer
    if (buffer.trim()) {
      const events = parseSSEText(buffer);
      for (const event of events) {
        if (event.data) {
          const parsed = parseEventData(event.data);
          if (parsed) {
            yield parsed;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('SSE stream error:', error);
    throw error;
  }
}