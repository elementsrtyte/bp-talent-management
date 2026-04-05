import { supabase } from "@/lib/supabase";

/** Base URL for the talent API (no trailing slash). Empty defaults to `/api` (Vite dev proxy or same-origin gateway). */
export function getApiBase(): string {
  const v = import.meta.env.VITE_API_URL as string | undefined;
  if (v === undefined || v === null || String(v).trim() === "") {
    return "/api";
  }
  return String(v).replace(/\/$/, "");
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);
  if (init?.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j.error === "string" && j.error) message = j.error;
    } catch {
      /* use text */
    }
    throw new Error(message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return undefined as T;
  return res.json() as Promise<T>;
}

/** POST multipart (e.g. resume upload); do not set Content-Type (browser sets boundary). */
export async function apiPostFormData(
  path: string,
  formData: FormData,
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j.error === "string" && j.error) message = j.error;
    } catch {
      /* use text */
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
}
