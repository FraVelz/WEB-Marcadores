import { createServerClient } from "@supabase/ssr"

import { cookieHeaderFromRequestCookies, DEMO_SESSION_COOKIE } from "@/lib/demo-data"

type CookieStore = { getAll(): { name: string; value: string }[] }

/**
 * Modo demo del dashboard: la sesión Supabase confirmada tiene prioridad sobre demo_session.
 */
export async function resolveDashboardDemoMode(cookieStore: CookieStore): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === "" || key === "") return true

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email_confirmed_at) return false
  } catch {
    // Si Supabase no responde, caer al chequeo por cookie más abajo.
  }

  return cookieHeaderFromRequestCookies(cookieStore).includes(`${DEMO_SESSION_COOKIE}=true`)
}
