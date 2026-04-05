import { KeyRound, Loader2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type Props = {
  /** Called after a successful update (e.g. close sheet). */
  onSuccess?: () => void;
};

export function ChangePasswordForm({ onSuccess }: Props) {
  const { updatePassword } = useSupabaseAuth();

  const passId = useId();
  const confirmId = useId();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err.message);
        return;
      }
      setPassword("");
      setConfirm("");
      setError(null);
      setSuccess(true);
      window.setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 900);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Use a strong password you don&apos;t reuse elsewhere.
      </p>

      <div className="space-y-2">
        <label
          htmlFor={passId}
          className="text-sm font-medium text-foreground"
        >
          New password
        </label>
        <Input
          id={passId}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          minLength={6}
          className="border border-border bg-input-background"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor={confirmId}
          className="text-sm font-medium text-foreground"
        >
          Confirm new password
        </label>
        <Input
          id={confirmId}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
          required
          minLength={6}
          className="border border-border bg-input-background"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-chart-2" role="status">
          Password updated.
        </p>
      ) : null}

      <Button type="submit" className="w-full gap-2" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="size-4" aria-hidden />
        )}
        Update password
      </Button>
    </form>
  );
}
