import { createContext } from "react";

import type { AuthError, Session, User } from "@supabase/supabase-js";

export type SupabaseAuthContextValue = {
  configured: boolean;
  initializing: boolean;
  session: Session | null;
  user: User | null;
  /** Recovery link from email: user must set a new password before using the app. */
  isPasswordRecovery: boolean;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ error: AuthError | null }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ error: AuthError | null }>;
};

export const SupabaseAuthContext =
  createContext<SupabaseAuthContextValue | null>(null);
