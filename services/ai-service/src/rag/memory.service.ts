/**
 * Memory Service for RAG + Memory System
 * Purpose: CRUD operations for user memories in ChromaDB
 */

import { v4 as uuidv4 } from 'uuid';
import {
    addDocumentToChroma,
    searchChroma,
    COLLECTIONS,
    initializeMemoryCollection
} from './vectorDb';
import {
    UserMemory,
    MemoryType,
    MemorySource,
    MemoryMetadata,
    MemoryRetrievalResult,
    StoreMemoryOptions,
    RetrieveMemoryOptions,
    FormattedMemoryContext,
} from './memory.types';

/**
 * Memory Service - singleton for managing user memories
 */
class MemoryService {
    private initialized = false;

    /**
     * Ensure memory collection is initialized
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await initializeMemoryCollection();
            this.initialized = true;
        }
    }

    /**
     * Store a new memory
     */
    async storeMemory(options: StoreMemoryOptions): Promise<UserMemory> {
        await this.ensureInitialized();

        const memory: UserMemory = {
            id: `mem_${uuidv4()}`,
            userId: options.userId,
            type: options.type,
            content: options.content,
            metadata: {
                source: options.source,
                query: options.query,
                sessionId: options.sessionId,
                keywords: options.keywords || [],
                importance: options.importance || 'medium',
            },
            createdAt: new Date().toISOString(),
        };

        // Prepare metadata for ChromaDB (flatten for filtering)
        const chromaMetadata: Record<string, any> = {
            userId: memory.userId,
            type: memory.type,
            source: memory.metadata.source,
            createdAt: memory.createdAt,
            importance: memory.metadata.importance,
        };

        // Add optional fields if present
        if (memory.metadata.query) {
            chromaMetadata.query = memory.metadata.query;
        }
        if (memory.metadata.sessionId) {
            chromaMetadata.sessionId = memory.metadata.sessionId;
        }
        if (memory.metadata.keywords && memory.metadata.keywords.length > 0) {
            chromaMetadata.keywords = memory.metadata.keywords.join(',');
        }

        await addDocumentToChroma(
            memory.id,
            memory.content,
            chromaMetadata,
            COLLECTIONS.MEMORY
        );

        console.log(`[MemoryService] Stored memory: ${memory.id} for user ${memory.userId}`);
        return memory;
    }

    /**
     * Retrieve relevant memories for a user based on query
     */
    async retrieveRelevantMemories(options: RetrieveMemoryOptions): Promise<MemoryRetrievalResult[]> {
        await this.ensureInitialized();

        const { userId, query, topK = 5, minSimilarity = 0.3 } = options;

        // Build filter for userId (required)
        const filter: Record<string, any> = { userId };

        // Note: Chroma requires specific filter format for multiple conditions
        // For MVP, we'll filter by userId only and do additional filtering in JS

        try {
            const results = await searchChroma(
                query,
                topK * 2, // Fetch more to allow for filtering
                filter,
                COLLECTIONS.MEMORY
            );

            // Convert distance to similarity (ChromaDB returns L2 distance)
            // Lower distance = higher similarity
            const memoriesWithSimilarity: MemoryRetrievalResult[] = results
                .map(result => {
                    // Convert L2 distance to similarity score (0-1)
                    // Using exponential decay: similarity = e^(-distance)
                    const similarity = Math.exp(-result.distance);

                    const memory: UserMemory = {
                        id: result.metadata.id || 'unknown',
                        userId: result.metadata.userId,
                        type: result.metadata.type as MemoryType,
                        content: result.text,
                        metadata: {
                            source: result.metadata.source as MemorySource,
                            query: result.metadata.query,
                            sessionId: result.metadata.sessionId,
                            keywords: result.metadata.keywords?.split(',') || [],
                            importance: result.metadata.importance,
                        },
                        createdAt: result.metadata.createdAt,
                    };

                    return { memory, similarity };
                })
                // Filter by minimum similarity
                .filter(r => r.similarity >= minSimilarity)
                // Filter by types if specified
                .filter(r => {
                    if (options.types && options.types.length > 0) {
                        return options.types.includes(r.memory.type);
                    }
                    return true;
                })
                // Filter by sources if specified
                .filter(r => {
                    if (options.sources && options.sources.length > 0) {
                        return options.sources.includes(r.memory.metadata.source);
                    }
                    return true;
                })
                // Sort by similarity (highest first)
                .sort((a, b) => b.similarity - a.similarity)
                // Take top K
                .slice(0, topK);

            console.log(`[MemoryService] Retrieved ${memoriesWithSimilarity.length} memories for user ${userId}`);
            return memoriesWithSimilarity;

        } catch (error: any) {
            console.error('[MemoryService] Failed to retrieve memories:', error.message);
            return [];
        }
    }

    /**
     * Format memories into a prompt-injectable context string
     */
    formatMemoriesForPrompt(memories: MemoryRetrievalResult[]): FormattedMemoryContext {
        if (memories.length === 0) {
            return {
                hasMemories: false,
                formattedText: '',
                memoriesUsed: 0,
            };
        }

        const formattedItems = memories.map((m, index) => {
            const typeEmoji = this.getTypeEmoji(m.memory.type);
            const date = new Date(m.memory.createdAt).toLocaleDateString('vi-VN');
            const sourceLabel = this.getSourceLabel(m.memory.metadata.source);

            return `${index + 1}. ${typeEmoji} [${sourceLabel}] (${date})\n   ${m.memory.content}`;
        });

        const formattedText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 THÔNG TIN TỪ LỊCH SỬ (USER MEMORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formattedItems.join('\n\n')}

⚠️ SỬ DỤNG MEMORY:
- Dùng để cá nhân hóa câu trả lời
- Nói tự nhiên: "Theo như lần trước bạn tìm..." hoặc "Bạn có đề cập..."
- Không nói "theo database" hay "hệ thống ghi nhận"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        return {
            hasMemories: true,
            formattedText,
            memoriesUsed: memories.length,
        };
    }

    /**
     * Extract key information from a conversation and store as memory
     * This is a simplified extraction - can be enhanced with LLM summarization
     */
    async extractAndStoreFromConversation(
        userId: string,
        sessionId: string,
        query: string,
        response: string,
        source: MemorySource
    ): Promise<UserMemory | null> {
        // Simple heuristic: only store if query is substantive (> 10 chars)
        if (query.length < 10) {
            return null;
        }

        // Create a summary combining query and key response points
        // For MVP, we'll store query + short response summary
        const responseSummary = response.length > 200
            ? response.substring(0, 200) + '...'
            : response;

        const content = `Tìm kiếm: "${query}" → Kết quả: ${responseSummary}`;

        // Extract simple keywords from query
        const keywords = this.extractKeywords(query);

        return await this.storeMemory({
            userId,
            type: source === 'deep_research' ? 'research' : 'search_history',
            content,
            source,
            query,
            sessionId,
            keywords,
            importance: 'medium',
        });
    }

    /**
     * Store user preference
     */
    async storePreference(
        userId: string,
        preference: string,
        source: MemorySource,
        sessionId?: string
    ): Promise<UserMemory> {
        return await this.storeMemory({
            userId,
            type: 'preference',
            content: preference,
            source,
            sessionId,
            importance: 'high', // Preferences are typically high importance
        });
    }

    // ===== Helper Methods =====

    private getTypeEmoji(type: MemoryType): string {
        const emojis: Record<MemoryType, string> = {
            preference: '⭐',
            search_history: '🔍',
            research: '📖',
            conversation: '💬',
        };
        return emojis[type] || '📌';
    }

    private getSourceLabel(source: MemorySource): string {
        const labels: Record<MemorySource, string> = {
            web_search: 'Tìm kiếm',
            deep_research: 'Nghiên cứu sâu',
            chat: 'Hội thoại',
        };
        return labels[source] || source;
    }

    private extractKeywords(text: string): string[] {
        // Simple keyword extraction (split by spaces, filter short words)
        return text
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(word => word.length > 3)
            .filter(word => !['này', 'của', 'cho', 'với', 'trong', 'trên', 'dưới'].includes(word))
            .slice(0, 5);
    }
}

// Export singleton instance
export const memoryService = new MemoryService();
