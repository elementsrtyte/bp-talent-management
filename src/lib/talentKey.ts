import type { Talent } from "@/types/talent";

/**
 * Stable key for linking roster rows to Supabase rows across refreshes.
 * Prefer email; fall back to name + LinkedIn when email is missing.
 */
export function stableTalentKey(
  t: Pick<Talent, "email" | "name" | "linkedInHref">,
): string {
  const email = t.email.trim().toLowerCase();
  if (email.length > 0) {
    return `email:${email}`;
  }
  const name = t.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 240);
  const li = t.linkedInHref.trim().slice(0, 240);
  return `name:${name}|li:${li}`;
}

/** Folder segment derived from talent_key (hex, filesystem-safe). */
export function talentKeyToPathSegment(talentKey: string): string {
  const bytes = new TextEncoder().encode(talentKey);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const UNSAFE_FILE = /[^a-zA-Z0-9._-]+/g;

export function sanitizeResumeFileName(original: string): string {
  const base = original.replace(UNSAFE_FILE, "_").slice(0, 180);
  return base.length > 0 ? base : "resume";
}
