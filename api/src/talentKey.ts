/** Hex-encode UTF-8 for storage path segment (matches web app). */
export function talentKeyToPathSegment(talentKey: string): string {
  const bytes = new TextEncoder().encode(talentKey);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const UNSAFE_FILE = /[^a-zA-Z0-9._-]+/g;

export function sanitizeResumeFileName(original: string): string {
  const base = original.replace(UNSAFE_FILE, "_").slice(0, 180);
  return base.length > 0 ? base : "resume";
}
