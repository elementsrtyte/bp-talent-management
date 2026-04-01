/**
 * Emergency local bypass when Supabase email / login is unavailable (e.g. rate limits).
 * Set `VITE_BYPASS_AUTH=true` in `.env.local` only. Remove before any production deploy.
 *
 * Roster and static features work; Supabase-backed comments/resumes still need a real session.
 */
const raw = import.meta.env.VITE_BYPASS_AUTH?.trim().toLowerCase();

export const authBypassEnabled = raw === "true" || raw === "1";

if (import.meta.env.DEV && authBypassEnabled) {
  console.warn(
    "[bp-talent-management] VITE_BYPASS_AUTH is set — login is skipped. Turn it off when you can sign in again.",
  );
}
