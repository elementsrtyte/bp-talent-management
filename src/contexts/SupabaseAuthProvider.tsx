import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import {
  SupabaseAuthContext,
  type SupabaseAuthContextValue,
} from "./supabase-auth-context";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function urlLooksLikePasswordRecovery(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    if (hashParams.get("type") === "recovery") return true;
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("type") === "recovery";
  } catch {
    return false;
  }
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured;
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(() => Boolean(supabase));
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(
    urlLooksLikePasswordRecovery,
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const handleAuthEvent = (event: AuthChangeEvent, s: Session | null) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
      if (event === "USER_UPDATED") {
        setIsPasswordRecovery(false);
      }
      if (event === "SIGNED_OUT") {
        setIsPasswordRecovery(false);
      }
      setSession(s);
      setInitializing(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      handleAuthEvent(event, s);
    });

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession((prev) => prev ?? s ?? null);
      setInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      return supabase!.auth.signInWithPassword({ email, password });
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      return supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
    },
    [],
  );

  const signOut = useCallback(() => supabase!.auth.signOut(), []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    if (!error) {
      setIsPasswordRecovery(false);
    }
    return { error };
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      configured,
      initializing,
      session,
      user: session?.user ?? null,
      isPasswordRecovery,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      requestPasswordReset,
      updatePassword,
    }),
    [
      configured,
      initializing,
      session,
      isPasswordRecovery,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      requestPasswordReset,
      updatePassword,
    ],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
