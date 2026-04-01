import { useContext } from "react";

import { SupabaseAuthContext } from "@/contexts/supabase-auth-context";

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return ctx;
}
