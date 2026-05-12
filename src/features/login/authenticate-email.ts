import type { SupabaseClient } from "@supabase/supabase-js"

export type AuthEmailResult =
  | { ok: true }
  | { ok: false; kind: "auth"; message: string }
  | { ok: false; kind: "unexpected" }

export async function authenticateWithEmailPassword(args: {
  supabase: SupabaseClient
  type: "login" | "signup"
  email: string
  password: string
}): Promise<AuthEmailResult> {
  const { supabase, type, email, password } = args
  try {
    const action =
      type === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })
    const { error: authErr } = await action
    if (authErr) {
      return { ok: false, kind: "auth", message: authErr.message }
    }
    return { ok: true }
  } catch {
    return { ok: false, kind: "unexpected" }
  }
}
