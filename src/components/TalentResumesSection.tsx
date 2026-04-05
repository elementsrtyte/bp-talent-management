import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { apiFetchJson, apiPostFormData } from "@/lib/apiClient";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { stableTalentKey } from "@/lib/talentKey";
import { cn } from "@/lib/utils";
import type { Talent } from "@/types/talent";

const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ResumeRow = {
  id: string;
  talent_key: string;
  storage_path: string;
  file_name: string;
  content_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

function formatSize(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploaded(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function TalentResumesSection({ talent }: { talent: Talent }) {
  const { user } = useSupabaseAuth();
  const talentKey = stableTalentKey(talent);
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<ResumeRow[]>(
        `/talents/${encodeURIComponent(talentKey)}/resumes`,
      );
      setRows(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resumes");
      setRows([]);
    }
    setLoading(false);
  }, [talentKey, user]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase || !user) return;

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    try {
      await apiPostFormData(
        `/talents/${encodeURIComponent(talentKey)}/resumes`,
        fd,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUploading(false);
      return;
    }

    setUploading(false);
    void load();
  }

  async function handleDownload(row: ResumeRow) {
    try {
      const { signedUrl } = await apiFetchJson<{ signedUrl: string }>(
        `/resumes/${encodeURIComponent(row.id)}/download`,
      );
      if (signedUrl) {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
        return;
      }
    } catch {
      /* fall through */
    }
    setError("Could not create download link.");
  }

  async function handleDelete(row: ResumeRow) {
    if (!supabase || !user || row.uploaded_by !== user.id) return;
    setError(null);
    try {
      await apiFetchJson(`/resumes/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      return;
    }
    void load();
  }

  if (!isSupabaseConfigured || !user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p
          className="text-xs text-muted-foreground uppercase tracking-wide"
          style={{ fontFamily: "var(--font-saans-semimono)" }}
        >
          Resumes
        </p>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          onChange={(ev) => void handleFileChange(ev)}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-4" aria-hidden />
          )}
          Upload
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        PDF or Word, up to 10 MB (per Supabase bucket limit). Files are private;
        teammates get a time-limited download link.
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading resumes…
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resumes uploaded.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const mine = r.uploaded_by === user.id;
            return (
              <li
                key={r.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border border-border bg-card/50 px-3 py-2",
                )}
              >
                <div className="min-w-0 flex items-start gap-2">
                  <FileText
                    className="size-4 shrink-0 mt-0.5 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.file_name}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-saans-semimono)" }}
                    >
                      {formatUploaded(r.uploaded_at)}
                      {r.file_size ? ` · ${formatSize(r.file_size)}` : ""}
                      {mine ? " · You" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Download ${r.file_name}`}
                    onClick={() => void handleDownload(r)}
                  >
                    <Download className="size-4" />
                  </Button>
                  {mine ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete resume"
                      onClick={() => void handleDelete(r)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
