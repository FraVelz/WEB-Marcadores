/**
 * Datos de ejemplo para modo demo (sin credenciales Supabase).
 * Solo datos genéricos de demostración — nunca datos personales del usuario.
 * Permite probar la UI localmente sin configurar Supabase.
 */

export type DemoFolder = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
};

export type DemoBookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  folder_id: string | null;
  tags?: string[];
  created_at?: string;
};

export const DEMO_FOLDERS: DemoFolder[] = [
  // Pocas carpetas de ejemplo — datos genéricos de desarrollo web
  { id: "f1", parent_id: null, name: "Documentación", sort_order: 0 },
  { id: "f2", parent_id: null, name: "Frameworks", sort_order: 1 },
  { id: "f3", parent_id: null, name: "Herramientas", sort_order: 2 },
  { id: "f4", parent_id: "f2", name: "Frontend", sort_order: 0 },
  { id: "f5", parent_id: "f2", name: "Backend", sort_order: 1 },
];

export const DEMO_BOOKMARKS: DemoBookmark[] = [
  {
    id: "demo-1",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Documentación web estándar",
    folder_id: "f1",
    tags: ["documentación", "web"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "React",
    url: "https://react.dev",
    description: "Biblioteca JavaScript para interfaces",
    folder_id: "f4",
    tags: ["react", "frontend", "javascript"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Next.js",
    url: "https://nextjs.org",
    description: "Framework React para producción",
    folder_id: "f4",
    tags: ["react", "framework", "web"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    folder_id: "f4",
    tags: ["css", "frontend"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    title: "Supabase",
    url: "https://supabase.com",
    description: "Backend as a Service",
    folder_id: "f5",
    tags: ["backend", "database", "auth"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-6",
    title: "GitHub",
    url: "https://github.com",
    description: "Plataforma de desarrollo colaborativo",
    folder_id: "f3",
    tags: ["git", "herramientas"],
    created_at: new Date().toISOString(),
  },
];

export const DEMO_TAGS = ["documentación", "web", "react", "frontend", "javascript", "framework", "css", "backend", "database", "auth", "git", "herramientas"];

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "" || key === "") return true;
  // Con Supabase configurado: si el usuario eligió demo (cookie), usar modo demo
  if (typeof document !== "undefined" && document.cookie.includes("demo_session=true")) return true;
  return false;
}
