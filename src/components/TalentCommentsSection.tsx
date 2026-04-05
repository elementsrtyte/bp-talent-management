import { Loader2, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { apiFetchJson } from "@/lib/apiClient";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { stableTalentKey } from "@/lib/talentKey";
import { cn } from "@/lib/utils";
import type { Talent } from "@/types/talent";

type CommentRow = {
  id: string;
  talent_key: string;
  user_id: string;
  body: string;
  created_at: string;
};

function formatCommentTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function TalentCommentsSection({ talent }: { talent: Talent }) {
  const { user } = useSupabaseAuth();
  const talentKey = stableTalentKey(talent);

  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<CommentRow[]>(
        `/talents/${encodeURIComponent(talentKey)}/comments`,
      );
      setRows(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comments");
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      await apiFetchJson(`/talents/${encodeURIComponent(talentKey)}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: text }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post comment");
      setSending(false);
      return;
    }
    setSending(false);
    setBody("");
    void load();
  }

  async function handleDelete(id: string) {
    if (!supabase || !user) return;
    try {
      await apiFetchJson(`/comments/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      return;
    }
    void load();
  }

  if (!isSupabaseConfigured || !user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p
        className="text-xs text-muted-foreground uppercase tracking-wide"
        style={{ fontFamily: "var(--font-saans-semimono)" }}
      >
        Internal notes
      </p>
      <p className="text-[11px] text-muted-foreground">
        Comments are stored via the app API and shared with signed-in teammates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          maxLength={10000}
          className="resize-y min-h-[72px]"
          disabled={sending}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="gap-2"
            disabled={sending || !body.trim()}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Post
          </Button>
        </div>
      </form>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading comments…
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const mine = c.user_id === user.id;
            return (
              <li
                key={c.id}
                className={cn(
                  "rounded-md border border-border bg-card/50 p-3 text-sm",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-saans-semimono)" }}
                  >
                    {formatCommentTime(c.created_at)}
                    {" · "}
                    <span className="text-foreground/80">
                      {mine ? "You" : "Team member"}
                    </span>
                  </span>
                  {mine ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Delete comment"
                      onClick={() => void handleDelete(c.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <p className="text-foreground whitespace-pre-wrap break-words">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
