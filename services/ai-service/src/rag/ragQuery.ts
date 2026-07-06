/**
 * @deprecated This file is deprecated and no longer used.
 * Booking agent now operates independently without RAG/ChromaDB.
 * Memory system is handled by memory.service.ts for Web Search, Deep Research, and General Chat.
 */

import { searchChroma } from "./vectorDb";
import { sessionStore } from "./sessionStore";
import { AzureAIService } from "../services/azure-ai.service";
import { AgentAction, BookingState } from "../types/agent.types";
import { TRAVELER_AGENT_PROMPT } from "../prompts/traveler-agent.prompt";

export interface RetrievedContext {
    text: string;
    metadata: {
        userId: string;
        sessionId: string;
        chunkType: string;
        timestamp: string;
    };
    similarity: number;
}

/**
 * Query RAG (Chroma) for relevant context based on user message
 * Returns top-K most relevant chunks
 * @deprecated No longer used - booking agent operates without RAG
 */
export async function retrieveRelevantContext(
    userId: string,
    currentSessionId: string,
    query: string,
    topK: number = 5
): Promise<RetrievedContext[]> {
    try {
        console.log(`[RAGQuery] Retrieving context for user ${userId}, query: "${query.substring(0, 50)}..."`);

        // Use searchChroma instead of vectorDb.query
        const results = await searchChroma(query, topK, { userId });

        console.log(`[RAGQuery] Retrieved ${results.length} chunks`);

        // Map results to RetrievedContext format
        const retrievedContexts: RetrievedContext[] = results
            .filter(r => r.metadata.sessionId !== currentSessionId) // Skip current session
            .map((r, i) => ({
                text: r.text,
                metadata: r.metadata as any,
                similarity: 1 - r.distance // Convert distance to similarity (lower distance = higher similarity)
            }));

        return retrievedContexts;
    } catch (error: any) {
        console.error('[RAGQuery] Retrieval failed:', error.message);
        return [];
    }
}

/**
 * Format retrieved RAG contexts for injection into prompt
 * @deprecated No longer used
 */
export function formatRAGContextForPrompt(contexts: RetrievedContext[]): string {
    if (contexts.length === 0) {
        return '';
    }

    const formattedChunks = contexts.map((ctx, i) => {
        const chunkType = ctx.metadata.chunkType || 'unknown';
        const timestamp = new Date(ctx.metadata.timestamp).toLocaleDateString('vi-VN');

        return `[${i + 1}] ${chunkType.toUpperCase()} (${timestamp}):\n${ctx.text}`;
    }).join('\n\n');

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 THÔNG TIN TỪ LỊCH SỬ (RAG MEMORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Các thông tin liên quan từ lịch sử đặt phòng và sở thích của người dùng:

${formattedChunks}

⚠️ QUY TẮC SỬ DỤNG RAG MEMORY:
- CHỈ dùng làm THAM KHẢO, KHÔNG phải sự thật tuyệt đối
- Nếu mâu thuẫn với JSON form input PHIÊN HIỆN TẠI → ƯU TIÊN form input
- KHÔNG nói "theo lịch sử", "hệ thống ghi nhận"
- Dùng tự nhiên như: "mình thường chọn...", "mình ưu tiên..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

const RAG_TOP_K = parseInt(process.env.RAG_TOP_K || '5');

/**
 * Query agent with RAG pipeline
 * @deprecated No longer used - booking agent operates without RAG
 */
export async function queryAgentWithRAG(
    sessionId: string,
    userId: string,
    userMessage: string,
    azureAIService: AzureAIService
): Promise<{
    action: AgentAction;
    sessionState: BookingState;
    retrievedContext: string[];
}> {
    try {
        console.log(`[RAGQuery] Querying agent for session ${sessionId}`);

        // 1. Get session data
        const session = sessionStore.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // 2. Semantic search in Chroma
        const searchResults = await searchChroma(
            userMessage,
            RAG_TOP_K,
            { sessionId } // Filter by session
        );

        const retrievedContext = searchResults.map(r => r.text);
        console.log(`[RAGQuery] Retrieved ${retrievedContext.length} context chunks`);

        // 3. Build prompt with 4 layers
        const systemPrompt = buildRAGPrompt(
            session.context,
            retrievedContext,
            session.history
        );

        // 4. Call AI
        const response = await azureAIService.generateChatResponse(
            [
                ...session.history.map(h => ({
                    role: h.role,
                    content: h.content
                })),
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            'vi',
            systemPrompt
        );

        // 5. Parse AI response
        let action: AgentAction;
        try {
            const cleanContent = response.content.replace(/```json\n?|```/g, '').trim();
            action = JSON.parse(cleanContent);
            console.log(`[RAGQuery] AI Action:`, action.intent);
        } catch (e) {
            console.error('[RAGQuery] Failed to parse AI JSON', e);
            throw new Error('Agent response parsing failed');
        }

        // 6. Update session state
        sessionStore.updateSessionState(sessionId, action.stateSuggestion);
        sessionStore.addMessageToHistory(sessionId, 'user', userMessage);
        if (action.messageDraft) {
            sessionStore.addMessageToHistory(sessionId, 'assistant', action.messageDraft);
        }

        return {
            action,
            sessionState: action.stateSuggestion,
            retrievedContext,
        };
    } catch (error) {
        console.error('[RAGQuery] Query failed:', error);
        throw error;
    }
}

/**
 * Build prompt with 4 layers: System + State + Memory + Message
 * @deprecated No longer used
 */
function buildRAGPrompt(
    sessionContext: any,
    retrievedChunks: string[],
    history: Array<{ role: string; content: string }>
): string {
    // Extract user info safely
    const user = sessionContext?.userContact || {};

    // Base system prompt
    let prompt = TRAVELER_AGENT_PROMPT
        .replace('{{displayName}}', user.displayName || 'Bạn')
        .replace('{{communicationStyle}}', user.communicationStyle || 'neutral')
        .replace('{{ageRange}}', user.ageRange || 'adult')
        .replace('{{travelExperience}}', user.travelExperience || 'traveler');

    // Add 4 layers
    prompt += `

================================================================
LAYER 1: SESSION STATE (Structured Data)
================================================================
${JSON.stringify(sessionContext, null, 2)}

================================================================
LAYER 2: RETRIEVED MEMORY (Semantic Search Results from Vector DB)
================================================================
${retrievedChunks.length > 0 ? retrievedChunks.map((c, i) => `${i + 1}. ${c}`).join('\n') : '(No relevant context found)'}

================================================================
LAYER 3: CONVERSATION HISTORY
================================================================
${history.length > 0 ? history.map(h => `${h.role}: ${h.content}`).join('\n') : '(No previous conversation)'}

================================================================
🚨 CRITICAL INSTRUCTIONS 🚨
================================================================
- DO NOT ask for information that is ALREADY in "RETRIEVED MEMORY" or "SESSION STATE"
- If destination, dates, budget are in the context → SKIP asking, move to next step
- Use RETRIEVED MEMORY to understand full context
- Respond in JSON format following AgentAction schema
================================================================
`;

    return prompt;
}
