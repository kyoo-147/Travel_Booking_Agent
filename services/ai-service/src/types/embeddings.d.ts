declare module '@themaximalist/embeddings.js' {
    interface EmbeddingOptions {
        service?: string;
        model?: string;
    }

    function embeddings(text: string, options?: EmbeddingOptions): Promise<number[]>;
    export default embeddings;
}
