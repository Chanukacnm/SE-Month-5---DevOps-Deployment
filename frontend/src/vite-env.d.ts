/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL. Defaults to same-origin `/api`. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
