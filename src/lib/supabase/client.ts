import { createBrowserClient } from "@supabase/ssr"

const DEMO_URL = "https://demo.supabase.co"
const DEMO_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5OTk5OTk5OTl9.placeholder"

type BrowserClient = ReturnType<typeof createBrowserClient>

/** Una instancia por carga del módulo en el navegador (pestaña); evita recrear el cliente cada render. */
let browserClient: BrowserClient | undefined

/**
 * Cliente Supabase para el navegador. Usar solo desde código cliente ("use client", hooks);
 * está basado en `createBrowserClient` de @supabase/ssr.
 */
export function createClient(): BrowserClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEMO_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEMO_KEY

  browserClient = createBrowserClient(url, key)

  return browserClient
}
