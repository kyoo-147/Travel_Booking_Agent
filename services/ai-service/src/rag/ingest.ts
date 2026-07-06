/**
 * @deprecated This file is deprecated and no longer used.
 * Booking agent now operates independently without RAG/ChromaDB.
 * Memory system is handled by memory.service.ts for Web Search, Deep Research, and General Chat.
 */

import { chunkBookingContext, BookingContext } from "./chunker";
import { addDocumentToChroma, initializeCollection } from "./vectorDb";

/**
 * Ingest user booking context into Chroma Vector DB
 * @deprecated No longer used - booking agent operates without RAG
 */
export async function ingestUserContext(
    userId: string,
    sessionId: string,
    contextJson: BookingContext
): Promise<number> {
    try {
        console.log(`[Ingest] Starting ingestion for session ${sessionId}`);

        // Ensure collection exists
        await initializeCollection();

        // Chunk the context
        const chunks = chunkBookingContext(contextJson);

        // Store each chunk
        const timestamp = new Date().toISOString();
        let storedCount = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const docId = `${sessionId}-${chunk.chunkType}-${i}`;

            await addDocumentToChroma(docId, chunk.text, {
                userId,
                sessionId,
                chunkType: chunk.chunkType,
                timestamp,
            });
            storedCount++;
        }

        console.log(`[Ingest] Stored ${storedCount} chunks for session ${sessionId}`);
        return storedCount;
    } catch (error: any) {
        console.error('[Ingest] Failed:', error.message);
        throw error;
    }
}
