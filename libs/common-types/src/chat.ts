export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages?: ChatMessage[];
    // Metadata for AI context
    metadata?: {
        tripId?: string;
        context?: string;
        [key: string]: any;
    };
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    // Metadata for AI tools, thoughts, etc.
    metadata?: {
        toolCalls?: any[];
        toolResults?: any[];
        thoughts?: string[];
        [key: string]: any;
    };
}

export interface CreateChatSessionRequest {
    title?: string;
    initialMessage?: string;
    metadata?: Record<string, any>;
}

export interface CreateChatMessageRequest {
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
}
