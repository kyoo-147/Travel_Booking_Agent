import axios from "axios";
import { createEmbedding } from "./embeddings";

const CHROMA_API = process.env.CHROMA_URL || "http://localhost:8000";
const DEFAULT_COLLECTION = process.env.CHROMA_COLLECTION || "booking_context";
const MEMORY_COLLECTION = "user_memory";

// Cache collection IDs by name (supports multiple collections)
const collectionIdCache: Map<string, string> = new Map();

export interface SearchResult {
    text: string;
    metadata: Record<string, any>;
    distance: number;
}

/**
 * Get or create a collection by name
 * @param collectionName - Name of the collection (defaults to booking_context)
 * @returns Collection ID
 */
async function getOrCreateCollection(collectionName: string = DEFAULT_COLLECTION): Promise<string> {
    // Check cache first
    const cachedId = collectionIdCache.get(collectionName);
    if (cachedId) {
        return cachedId;
    }

    try {
        console.log(`[VectorDB] Initializing collection '${collectionName}'...`);

        // List existing collections
        const listResponse = await axios.get(`${CHROMA_API}/api/v1/collections`);
        const collections = listResponse.data || [];

        // Find collection by name
        const existing = collections.find((c: any) => c.name === collectionName);

        let collectionId: string;

        if (existing) {
            collectionId = existing.id;
            console.log(`[VectorDB] Collection '${collectionName}' already exists with ID: ${collectionId}`);
        } else {
            // Collection doesn't exist, create it
            const description = collectionName === MEMORY_COLLECTION
                ? "User memory embeddings for RAG + Memory system"
                : "Booking context embeddings for RAG pipeline";

            const createResponse = await axios.post(`${CHROMA_API}/api/v1/collections`, {
                name: collectionName,
                metadata: { description }
            });
            collectionId = createResponse.data.id;
            console.log(`[VectorDB] Created collection '${collectionName}' with ID: ${collectionId}`);
        }

        // Cache the ID
        collectionIdCache.set(collectionName, collectionId);
        return collectionId;

    } catch (error) {
        console.error(`[VectorDB] Failed to initialize collection '${collectionName}':`, error);
        throw error;
    }
}

/**
 * Initialize default Chroma collection (backward compatible)
 */
export async function initializeCollection(): Promise<void> {
    await getOrCreateCollection(DEFAULT_COLLECTION);
}

/**
 * Initialize memory collection
 */
export async function initializeMemoryCollection(): Promise<void> {
    await getOrCreateCollection(MEMORY_COLLECTION);
}

/**
 * Add document with embedding to Chroma
 * @param id - Document ID
 * @param text - Text content to embed
 * @param metadata - Metadata to store with document
 * @param collectionName - Optional collection name (defaults to booking_context)
 */
export async function addDocumentToChroma(
    id: string,
    text: string,
    metadata: Record<string, any>,
    collectionName: string = DEFAULT_COLLECTION
): Promise<void> {
    try {
        const collectionId = await getOrCreateCollection(collectionName);
        const vector = await createEmbedding(text);

        await axios.post(`${CHROMA_API}/api/v1/collections/${collectionId}/add`, {
            ids: [id],
            embeddings: [vector],
            metadatas: [metadata],
            documents: [text],
        });

        console.log(`[VectorDB] Added document to '${collectionName}': ${id}`);
    } catch (error) {
        console.error(`[VectorDB] Failed to add document to '${collectionName}':`, error);
        throw error;
    }
}

/**
 * Semantic search in Chroma
 * @param query - Search query
 * @param topK - Number of results to return
 * @param filter - Optional metadata filter
 * @param collectionName - Optional collection name (defaults to booking_context)
 */
export async function searchChroma(
    query: string,
    topK = 5,
    filter?: Record<string, any>,
    collectionName: string = DEFAULT_COLLECTION
): Promise<SearchResult[]> {
    try {
        const collectionId = await getOrCreateCollection(collectionName);
        const qVec = await createEmbedding(query);

        const payload: any = {
            query_embeddings: [qVec],
            n_results: topK,
        };

        if (filter) {
            payload.where = filter;
        }

        const res = await axios.post(
            `${CHROMA_API}/api/v1/collections/${collectionId}/query`,
            payload
        );

        const documents = res.data.documents?.[0] || [];
        const metadatas = res.data.metadatas?.[0] || [];
        const distances = res.data.distances?.[0] || [];

        const results: SearchResult[] = documents.map((text: string, i: number) => ({
            text,
            metadata: metadatas[i],
            distance: distances[i],
        }));

        console.log(`[VectorDB] Search in '${collectionName}' returned ${results.length} results`);
        return results;
    } catch (error) {
        console.error(`[VectorDB] Search in '${collectionName}' failed:`, error);
        throw error;
    }
}

/**
 * Delete a collection (for testing/cleanup)
 * @param collectionName - Optional collection name (defaults to booking_context)
 */
export async function deleteCollection(collectionName: string = DEFAULT_COLLECTION): Promise<void> {
    try {
        const collectionId = await getOrCreateCollection(collectionName);
        await axios.delete(`${CHROMA_API}/api/v1/collections/${collectionId}`);
        collectionIdCache.delete(collectionName);
        console.log(`[VectorDB] Deleted collection '${collectionName}'`);
    } catch (error) {
        console.error(`[VectorDB] Failed to delete collection '${collectionName}':`, error);
        throw error;
    }
}

/**
 * Get collection info
 * @param collectionName - Optional collection name (defaults to booking_context)
 */
export async function getCollectionInfo(collectionName: string = DEFAULT_COLLECTION): Promise<any> {
    try {
        const collectionId = await getOrCreateCollection(collectionName);
        const response = await axios.get(`${CHROMA_API}/api/v1/collections/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error(`[VectorDB] Failed to get collection info for '${collectionName}':`, error);
        throw error;
    }
}

// Export collection names for use in other modules
export const COLLECTIONS = {
    BOOKING: DEFAULT_COLLECTION,
    MEMORY: MEMORY_COLLECTION,
} as const;
