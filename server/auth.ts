import type { User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";

import { getSupabaseAdminForRequest } from "./supabaseAdmin";

export type AuthedRequest = Request & { user: User };

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = h.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const admin = getSupabaseAdminForRequest(res);
  if (!admin) return;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  (req as AuthedRequest).user = data.user;
  next();
}
