import type { SupabaseClient } from "@supabase/supabase-js"

import { getAuthRedirectUrl } from "./get-auth-redirect-url"

export type AuthEmailResult =
  | { ok: true; needsEmailConfirmation: boolean }
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
    if (type === "login") {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) {
        return { ok: false, kind: "auth", message: authErr.message }
      }
      return { ok: true, needsEmailConfirmation: false }
    }

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    })

    if (authErr) {
      return { ok: false, kind: "auth", message: authErr.message }
    }

    const needsEmailConfirmation = !data.session
    return { ok: true, needsEmailConfirmation }
  } catch {
    return { ok: false, kind: "unexpected" }
  }
}
