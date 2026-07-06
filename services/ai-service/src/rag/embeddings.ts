/**
 * Embeddings module using local transformer model
 * Uses @xenova/transformers directly for better Windows compatibility
 */

let embeddingPipeline: any = null;
let isInitializing = false;
let lastError: string | null = null;

/**
 * Initialize the embedding pipeline lazily
 */
async function initPipeline() {
    if (embeddingPipeline) return embeddingPipeline;

    if (isInitializing) {
        // Wait for initialization to complete
        let waited = 0;
        while (isInitializing && waited < 60000) {
            await new Promise(resolve => setTimeout(resolve, 500));
            waited += 500;
        }
        if (embeddingPipeline) return embeddingPipeline;
        throw new Error(lastError || 'Embedding pipeline initialization timed out');
    }

    isInitializing = true;
    lastError = null;

    try {
        console.log('[Embeddings] Starting pipeline initialization...');
        console.log('[Embeddings] This may take a minute on first run (downloading model)...');

        // Dynamic import of @xenova/transformers
        let transformersModule: any;
        try {
            // @ts-ignore
            transformersModule = await import('@xenova/transformers');
            console.log('[Embeddings] @xenova/transformers loaded successfully');
        } catch (importError: any) {
            lastError = `Failed to import @xenova/transformers: ${importError?.message || importError}`;
            console.error('[Embeddings]', lastError);
            throw new Error(lastError);
        }

        const pipeline = transformersModule.pipeline || transformersModule.default?.pipeline;

        if (!pipeline) {
            lastError = 'Could not find pipeline function in @xenova/transformers';
            console.error('[Embeddings]', lastError);
            throw new Error(lastError);
        }

        console.log('[Embeddings] Creating feature-extraction pipeline...');

        // Create feature-extraction pipeline
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true,
        });

        console.log('[Embeddings] ✅ Pipeline initialized successfully!');
        return embeddingPipeline;
    } catch (error: any) {
        lastError = error?.message || String(error);
        console.error('[Embeddings] ❌ Failed to initialize pipeline:', lastError);
        // Reset so we can retry
        embeddingPipeline = null;
        throw error;
    } finally {
        isInitializing = false;
    }
}

/**
 * Create embedding vector from text using local OSS model
 * Model: Xenova/all-MiniLM-L6-v2 (384 dimensions)
 * Runs locally, no API key required
 */
export async function createEmbedding(text: string): Promise<number[]> {
    try {
        const extractor = await initPipeline();

        // Run feature extraction
        const output = await extractor(text, { pooling: 'mean', normalize: true });

        // Convert to array
        const vector: number[] = Array.from(output.data);

        console.log(`[Embeddings] Created embedding (${text.substring(0, 30)}...), dim: ${vector.length}`);
        return vector;
    } catch (error: any) {
        console.error('[Embeddings] Failed to create embedding:', error?.message || error);
        throw new Error(`Embedding creation failed: ${error?.message || error}`);
    }
}

/**
 * Check if embeddings are available
 */
export async function checkEmbeddingsHealth(): Promise<boolean> {
    try {
        const testVector = await createEmbedding('test');
        return testVector.length === 384;
    } catch {
        return false;
    }
}
