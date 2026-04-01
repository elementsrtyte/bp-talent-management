import { KeyRound, Moon, Sun } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { BlueprintLogo } from "@/components/BlueprintLogo";
import { GridBackground } from "@/components/GridBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function AuthUpdatePasswordPage() {
  const { updatePassword, signOut, user } = useSupabaseAuth();

  const passId = useId();
  const confirmId = useId();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof localStorage === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return true;
  });

  useEffect(() => {
    applyThemeClass(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
      if (err) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col">
      <GridBackground />
      <header className="border-b border-border relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BlueprintLogo className="shrink-0 text-foreground" />
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Set new password
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0 border-border"
          >
            {isDark ? (
              <Sun className="size-5" strokeWidth={1.25} aria-hidden />
            ) : (
              <Moon className="size-5" strokeWidth={1.25} aria-hidden />
            )}
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          {user?.email ? (
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="text-foreground font-medium">{user.email}</span>
              . Choose a new password.
            </p>
          ) : null}

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

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={submitting}
          >
            <KeyRound className="size-4" aria-hidden />
            Update password
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => void signOut()}
          >
            Cancel and sign out
          </Button>
        </form>
      </main>
    </div>
  );
}
