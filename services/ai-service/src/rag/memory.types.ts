/**
 * Memory Types for RAG + Memory System
 * Purpose: TypeScript definitions for user memory storage and retrieval
 */

/**
 * Type of memory being stored
 */
export type MemoryType =
    | 'preference'       // User preferences (e.g., likes sea view, budget range)
    | 'search_history'   // Past search queries and summaries
    | 'research'         // Deep research findings
    | 'conversation';    // Key conversation points

/**
 * Source of the memory
 */
export type MemorySource =
    | 'web_search'       // From WebSearchService
    | 'deep_research'    // From DeepResearchService
    | 'chat';            // From general chat

/**
 * Main memory document structure
 */
export interface UserMemory {
    id: string;                  // Unique ID for the memory
    userId: string;              // Owner of the memory
    type: MemoryType;            // Type of memory
    content: string;             // Text content (will be embedded)
    metadata: MemoryMetadata;    // Additional metadata
    createdAt: string;           // ISO timestamp
}

/**
 * Metadata attached to each memory
 */
export interface MemoryMetadata {
    source: MemorySource;        // Where this memory came from
    query?: string;              // Original user query (if applicable)
    sessionId?: string;          // Session that generated this memory
    keywords?: string[];         // Extracted keywords for filtering
    importance?: 'low' | 'medium' | 'high';  // Importance level
}

/**
 * Result of memory retrieval
 */
export interface MemoryRetrievalResult {
    memory: UserMemory;
    similarity: number;          // 0-1, higher = more similar
}

/**
 * Options for storing memory
 */
export interface StoreMemoryOptions {
    userId: string;
    type: MemoryType;
    content: string;
    source: MemorySource;
    query?: string;
    sessionId?: string;
    keywords?: string[];
    importance?: 'low' | 'medium' | 'high';
}

/**
 * Options for retrieving memory
 */
export interface RetrieveMemoryOptions {
    userId: string;
    query: string;
    topK?: number;               // Number of memories to retrieve (default: 5)
    types?: MemoryType[];        // Filter by memory types
    sources?: MemorySource[];    // Filter by sources
    minSimilarity?: number;      // Minimum similarity threshold (0-1)
}

/**
 * Formatted memory context for prompt injection
 */
export interface FormattedMemoryContext {
    hasMemories: boolean;
    formattedText: string;       // Ready to inject into prompt
    memoriesUsed: number;        // Number of memories included
}
