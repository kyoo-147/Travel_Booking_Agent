// Global type declarations for third-party modules without types

declare module '@themaximalist/embeddings.js' {
    function embeddings(
        text: string,
        options: {
            service: string;
            model: string;
        }
    ): Promise<number[]>;

    export default embeddings;
}
