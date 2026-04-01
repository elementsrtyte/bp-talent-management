/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_ROSTER_WEBHOOK?: string;
  /** Set to `"true"` only for `npm run capture:readme` — blurs surnames in the build. */
  readonly VITE_SCREENGRAB_PRIVACY?: string;
  /** Supabase project URL (Settings → API). When set with VITE_SUPABASE_PUBLISHABLE_KEY, login is required. */
  readonly VITE_SUPABASE_URL?: string;
  /**
   * Supabase **publishable** key (`sb_publishable_…`, Settings → API).
   * Replaces the legacy JWT anon key; see https://supabase.com/docs/guides/api/api-keys
   */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /**
   * If `"true"` or `"1"`, skip Supabase login (local emergency only). Never ship public builds with this set.
   */
  readonly VITE_BYPASS_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
