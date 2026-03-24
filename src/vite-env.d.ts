/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_ROSTER_WEBHOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
