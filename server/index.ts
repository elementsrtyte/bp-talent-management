import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";

import { requireAuth, type AuthedRequest } from "./auth";
import { getSupabaseAdminForRequest } from "./supabaseAdmin";
import {
  sanitizeResumeFileName,
  talentKeyToPathSegment,
} from "./talentKey";

function paramString(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s : "";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite loads .env* for the browser; Node does not — load the same files for the server.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const RESUMES_BUCKET = "resumes";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "128kb" }));

/** Railway / load balancers — not under /api. */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const api = express.Router();

api.get(
  "/talents/:talentKey/comments",
  requireAuth,
  async (req, res) => {
    const talentKey = decodeURIComponent(paramString(req.params.talentKey));
    const admin = getSupabaseAdminForRequest(res);
    if (!admin) return;
    const { data, error } = await admin
      .from("talent_comments")
      .select("id, talent_key, user_id, body, created_at")
      .eq("talent_key", talentKey)
      .order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data ?? []);
  },
);

api.post(
  "/talents/:talentKey/comments",
  requireAuth,
  async (req, res) => {
    const auth = req as AuthedRequest;
    const talentKey = decodeURIComponent(paramString(req.params.talentKey));
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
    if (!body || body.length > 10_000) {
      res.status(400).json({ error: "body required, max 10000 chars" });
      return;
    }
    const admin = getSupabaseAdminForRequest(res);
    if (!admin) return;
    const { error } = await admin.from("talent_comments").insert({
      talent_key: talentKey,
      user_id: auth.user.id,
      body,
    });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ ok: true });
  },
);

api.delete("/comments/:commentId", requireAuth, async (req, res) => {
  const commentId = paramString(req.params.commentId);
  const user = (req as AuthedRequest).user;
  const admin = getSupabaseAdminForRequest(res);
  if (!admin) return;
  const { error } = await admin
    .from("talent_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(204).send();
});

api.get(
  "/talents/:talentKey/resumes",
  requireAuth,
  async (req, res) => {
    const talentKey = decodeURIComponent(paramString(req.params.talentKey));
    const admin = getSupabaseAdminForRequest(res);
    if (!admin) return;
    const { data, error } = await admin
      .from("talent_resumes")
      .select(
        "id, talent_key, storage_path, file_name, content_type, file_size, uploaded_by, uploaded_at",
      )
      .eq("talent_key", talentKey)
      .order("uploaded_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data ?? []);
  },
);

api.post(
  "/talents/:talentKey/resumes",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    const auth = req as AuthedRequest;
    const talentKey = decodeURIComponent(paramString(req.params.talentKey));
    const file = req.file;
    if (!file?.buffer) {
      res.status(400).json({ error: "file required" });
      return;
    }
    const userId = auth.user.id;
    const segment = talentKeyToPathSegment(talentKey);
    const safeName = sanitizeResumeFileName(file.originalname);
    const objectId = randomUUID();
    const storagePath = `${userId}/${segment}/${objectId}_${safeName}`;

    const admin = getSupabaseAdminForRequest(res);
    if (!admin) return;
    const { error: upErr } = await admin.storage
      .from(RESUMES_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || undefined,
        upsert: false,
      });
    if (upErr) {
      res.status(500).json({ error: upErr.message });
      return;
    }

    const { error: insErr } = await admin.from("talent_resumes").insert({
      talent_key: talentKey,
      storage_path: storagePath,
      file_name: safeName,
      content_type: file.mimetype || null,
      file_size: file.size,
      uploaded_by: userId,
    });

    if (insErr) {
      await admin.storage.from(RESUMES_BUCKET).remove([storagePath]);
      res.status(500).json({ error: insErr.message });
      return;
    }

    res.status(201).json({ ok: true });
  },
);

api.get("/resumes/:resumeId/download", requireAuth, async (req, res) => {
  const resumeId = paramString(req.params.resumeId);
  const admin = getSupabaseAdminForRequest(res);
  if (!admin) return;
  const { data: row, error: qErr } = await admin
    .from("talent_resumes")
    .select("storage_path")
    .eq("id", resumeId)
    .maybeSingle();
  if (qErr || !row?.storage_path) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  const { data: signed, error: sErr } = await admin.storage
    .from(RESUMES_BUCKET)
    .createSignedUrl(row.storage_path, 3600);
  if (sErr || !signed?.signedUrl) {
    res.status(500).json({ error: sErr?.message ?? "Could not sign URL" });
    return;
  }
  res.json({ signedUrl: signed.signedUrl });
});

api.delete("/resumes/:resumeId", requireAuth, async (req, res) => {
  const resumeId = paramString(req.params.resumeId);
  const user = (req as AuthedRequest).user;
  const admin = getSupabaseAdminForRequest(res);
  if (!admin) return;
  const { data: row, error: qErr } = await admin
    .from("talent_resumes")
    .select("id, storage_path, uploaded_by")
    .eq("id", resumeId)
    .maybeSingle();
  if (qErr || !row) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  if (row.uploaded_by !== user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { error: stErr } = await admin.storage
    .from(RESUMES_BUCKET)
    .remove([row.storage_path]);
  if (stErr) {
    res.status(500).json({ error: stErr.message });
    return;
  }
  const { error: delErr } = await admin
    .from("talent_resumes")
    .delete()
    .eq("id", resumeId)
    .eq("uploaded_by", user.id);
  if (delErr) {
    res.status(500).json({ error: delErr.message });
    return;
  }
  res.status(204).send();
});

app.use("/api", api);

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const dist = path.resolve(__dirname, "../dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`server listening on ${port}`);
  if (isProd) {
    console.log("serving SPA from dist/");
  } else {
    console.log("API at /api/* — use Vite dev server (proxies /api here)");
  }
});
