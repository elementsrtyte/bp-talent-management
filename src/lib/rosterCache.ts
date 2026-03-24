const STORAGE_KEY = "bp-talent-roster-cache-v1";

export type RosterCacheEnvelope = {
  /** ISO-8601 timestamp when the webhook response was stored. */
  updatedAt: string;
  /** Raw JSON body from the webhook (or normalized array) for re-parsing. */
  payload: unknown;
};

export function readRosterCache(): RosterCacheEnvelope | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.updatedAt !== "string" || !("payload" in o)) return null;
    return { updatedAt: o.updatedAt, payload: o.payload };
  } catch {
    return null;
  }
}

export function writeRosterCache(envelope: RosterCacheEnvelope): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.warn("Could not write roster cache", e);
  }
}
