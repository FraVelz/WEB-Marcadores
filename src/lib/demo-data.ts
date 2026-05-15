/**
 * Datos de ejemplo para modo demo (sin credenciales Supabase).
 * Solo datos genéricos de demostración — nunca datos personales del usuario.
 * Permite probar la UI localmente sin configurar Supabase.
 */

export type DemoFolder = {
  id: string
  parent_id: string | null
  name: string
  sort_order: number
}

export type DemoBookmark = {
  id: string
  title: string
  url: string
  description?: string
  folder_id: string | null
  tags?: string[]
  created_at?: string
  updated_at?: string
  is_favorite?: boolean
  archived_at?: string | null
  opened_at?: string | null
  open_count?: number
}

export type DemoWorkspace = {
  id: string
  name: string
  sort_order: number
}

export const DEMO_WORKSPACES: DemoWorkspace[] = [
  { id: "demo-ws-personal", name: "Personal", sort_order: 0 },
  { id: "demo-ws-design", name: "Diseño UI", sort_order: 1 },
  { id: "demo-ws-dev", name: "Programación", sort_order: 2 },
]

export const DEMO_FOLDERS: DemoFolder[] = [
  // Pocas carpetas de ejemplo — datos genéricos de desarrollo web
  { id: "f1", parent_id: null, name: "Documentación", sort_order: 0 },
  { id: "f2", parent_id: null, name: "Frameworks", sort_order: 1 },
  { id: "f3", parent_id: null, name: "Herramientas", sort_order: 2 },
  { id: "f4", parent_id: "f2", name: "Frontend", sort_order: 0 },
  { id: "f5", parent_id: "f2", name: "Backend", sort_order: 1 },
]

const DEMO_NOW = Date.now()

export const DEMO_BOOKMARKS: DemoBookmark[] = [
  {
    id: "demo-1",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Documentación web estándar",
    folder_id: "f1",
    tags: ["documentación", "web"],
    created_at: new Date(DEMO_NOW - 86400000 * 200).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 2).toISOString(),
    is_favorite: true,
    archived_at: null,
    opened_at: new Date(DEMO_NOW - 86400000 * 5).toISOString(),
    open_count: 12,
  },
  {
    id: "demo-2",
    title: "React",
    url: "https://react.dev",
    description: "Biblioteca JavaScript para interfaces",
    folder_id: "f4",
    tags: ["react", "frontend", "javascript"],
    created_at: new Date(DEMO_NOW - 86400000 * 120).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 1).toISOString(),
    is_favorite: true,
    archived_at: null,
    opened_at: new Date(DEMO_NOW - 86400000 * 1).toISOString(),
    open_count: 40,
  },
  {
    id: "demo-3",
    title: "Next.js",
    url: "https://nextjs.org",
    description: "Framework React para producción",
    folder_id: "f4",
    tags: ["react", "framework", "web"],
    created_at: new Date(DEMO_NOW - 86400000 * 90).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 3).toISOString(),
    is_favorite: false,
    archived_at: null,
    opened_at: new Date(DEMO_NOW - 86400000 * 100).toISOString(),
    open_count: 3,
  },
  {
    id: "demo-4",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    folder_id: "f4",
    tags: ["css", "frontend"],
    created_at: new Date(DEMO_NOW - 86400000 * 30).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 4).toISOString(),
    is_favorite: false,
    archived_at: null,
    opened_at: null,
    open_count: 0,
  },
  {
    id: "demo-5",
    title: "Supabase",
    url: "https://supabase.com/?utm_source=test",
    description: "Backend as a Service",
    folder_id: "f5",
    tags: ["backend", "database", "auth"],
    created_at: new Date(DEMO_NOW - 86400000 * 15).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 5).toISOString(),
    is_favorite: false,
    archived_at: null,
    opened_at: new Date(DEMO_NOW - 86400000 * 20).toISOString(),
    open_count: 1,
  },
  {
    id: "demo-6",
    title: "GitHub",
    url: "https://github.com",
    description: "Plataforma de desarrollo colaborativo",
    folder_id: "f3",
    tags: [],
    created_at: new Date(DEMO_NOW - 86400000 * 10).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 6).toISOString(),
    is_favorite: false,
    archived_at: null,
    opened_at: null,
    open_count: 0,
  },
  {
    id: "demo-7-dupe",
    title: "Supabase dup",
    url: "https://supabase.com",
    description: "Posible duplicado de Supabase sin UTM",
    folder_id: "f5",
    tags: ["backend"],
    created_at: new Date(DEMO_NOW - 86400000 * 40).toISOString(),
    updated_at: new Date(DEMO_NOW - 86400000 * 7).toISOString(),
    is_favorite: false,
    archived_at: null,
    opened_at: null,
    open_count: 0,
  },
]

export const DEMO_TAGS = [
  "documentación",
  "web",
  "react",
  "frontend",
  "javascript",
  "framework",
  "css",
  "backend",
  "database",
  "auth",
  "git",
  "herramientas",
]

/** Serializa cookies de `cookies()` (App Router) para pasarlas a `isDemoMode`. */
export function cookieHeaderFromRequestCookies(cookieStore: { getAll(): { name: string; value: string }[] }): string {
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")
}

/**
 * Modo demo: env forzado, Supabase ausente, o cookie `demo_session=true`.
 * En Server Components, pasa `cookieHeaderFromRequestCookies(await cookies())`.
 * Sin argumento en el servidor: la rama de cookie es false (no hay `document`).
 */
export function isDemoMode(cookieHeader?: string): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === "" || key === "") return true
  if (cookieHeader !== undefined) {
    return cookieHeader.includes("demo_session=true")
  }

  if (typeof document !== "undefined") {
    return document.cookie.includes("demo_session=true")
  }

  return false
}
