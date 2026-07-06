/// &lt;reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_TRIP_API_BASE_URL: string
  readonly VITE_USER_API_BASE_URL: string
  readonly VITE_AI_SERVICE_URL: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_ENDPOINT: string
  readonly VITE_MODEL_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}