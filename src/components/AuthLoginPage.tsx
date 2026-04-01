import { LogIn, Moon, Sun } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { BlueprintLogo } from "@/components/BlueprintLogo";
import { GridBackground } from "@/components/GridBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { cn } from "@/lib/utils";

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
}

type Mode = "sign-in" | "sign-up";

/** Matches “no public sign-ups” in Supabase; flip to true if you ever open registration. */
const PUBLIC_SIGN_UP_ENABLED = false;

export function AuthLoginPage() {
  const { signInWithPassword, requestPasswordReset } = useSupabaseAuth();

  const emailId = useId();
  const passwordId = useId();
  const resetEmailId = useId();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);

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

  useEffect(() => {
    if (!PUBLIC_SIGN_UP_ENABLED && mode === "sign-up") {
      setMode("sign-in");
    }
  }, [mode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "sign-up" && PUBLIC_SIGN_UP_ENABLED) {
        return;
      }
      const { error: err } = await signInWithPassword(email, password);
      if (err) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setResetting(true);
    try {
      const { error: err } = await requestPasswordReset(resetEmail);
      if (err) {
        setError(err.message);
        return;
      }
      setInfo("If an account exists for that email, a reset link was sent.");
      setShowReset(false);
    } finally {
      setResetting(false);
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
              Sign in
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
        <div className="w-full max-w-sm space-y-6">
          <div
            className="flex rounded-lg border border-border bg-card p-1 gap-1"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "sign-in"}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "sign-in"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setMode("sign-in");
                setError(null);
                setInfo(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={PUBLIC_SIGN_UP_ENABLED && mode === "sign-up"}
              aria-disabled={!PUBLIC_SIGN_UP_ENABLED}
              disabled={!PUBLIC_SIGN_UP_ENABLED}
              title={
                PUBLIC_SIGN_UP_ENABLED
                  ? undefined
                  : "New accounts are invite-only."
              }
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                PUBLIC_SIGN_UP_ENABLED &&
                  mode === "sign-up" &&
                  "bg-background text-foreground shadow-sm",
                PUBLIC_SIGN_UP_ENABLED &&
                  mode !== "sign-up" &&
                  "text-muted-foreground hover:text-foreground",
                !PUBLIC_SIGN_UP_ENABLED &&
                  "cursor-not-allowed text-muted-foreground opacity-45",
              )}
              onClick={() => {
                if (!PUBLIC_SIGN_UP_ENABLED) return;
                setMode("sign-up");
                setError(null);
                setInfo(null);
              }}
            >
              Create account
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <label
                htmlFor={emailId}
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                className="border border-border bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Input
                id={passwordId}
                type="password"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={6}
                className="border border-border bg-input-background"
              />
            </div>
            {mode === "sign-in" ? (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                onClick={() => {
                  setShowReset((s) => !s);
                  setError(null);
                  setInfo(null);
                  setResetEmail(email);
                }}
              >
                Forgot password?
              </button>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-muted-foreground" role="status">
                {info}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting}
            >
              <LogIn className="size-4" aria-hidden />
              Sign in
            </Button>
          </form>

          {showReset && mode === "sign-in" ? (
            <form
              onSubmit={handleReset}
              className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                We will email you a link to reset your password.
              </p>
              <div className="space-y-2">
                <label
                  htmlFor={resetEmailId}
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id={resetEmailId}
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(ev) => setResetEmail(ev.target.value)}
                  required
                  className="border border-border bg-input-background"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={resetting}>
                  Send link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReset(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </main>
    </div>
  );
}
