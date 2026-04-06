import type { Response } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (service role, not publishable)",
    );
  }
  client = createClient(url.trim(), key.trim());
  return client;
}

/** Like getSupabaseAdmin but responds 503 and returns null instead of throwing. */
export function getSupabaseAdminForRequest(res: Response): SupabaseClient | null {
  try {
    return getSupabaseAdmin();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Server configuration error";
    res.status(503).json({ error: msg });
    return null;
  }
}
