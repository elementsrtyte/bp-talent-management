/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_ROSTER_WEBHOOK?: string;
  /** Set to `"true"` only for `npm run capture:readme` — blurs surnames in the build. */
  readonly VITE_SCREENGRAB_PRIVACY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
