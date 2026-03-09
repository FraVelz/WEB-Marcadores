/**
 * Datos de ejemplo para modo demo (sin credenciales Supabase).
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
  { id: "f1", parent_id: null, name: "Desarrollo", sort_order: 0 },
  { id: "f2", parent_id: null, name: "Herramientas", sort_order: 1 },
  { id: "f3", parent_id: null, name: "Documentación", sort_order: 2 },
  { id: "f4", parent_id: "f1", name: "Frontend", sort_order: 0 },
  { id: "f5", parent_id: "f1", name: "Backend", sort_order: 1 },
  { id: "f6", parent_id: "f2", name: "Control de versiones", sort_order: 0 },
  { id: "f7", parent_id: "f3", name: "Web", sort_order: 0 },
];

export const DEMO_BOOKMARKS: DemoBookmark[] = [
  {
    id: "demo-1",
    title: "Next.js",
    url: "https://nextjs.org",
    description: "Framework React para producción",
    folder_id: "f4",
    tags: ["web", "react", "framework"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Supabase",
    url: "https://supabase.com",
    description: "Backend as a Service",
    folder_id: "f5",
    tags: ["backend", "database", "auth"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    folder_id: "f4",
    tags: ["css", "web"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    title: "GitHub",
    url: "https://github.com",
    folder_id: "f6",
    tags: ["herramientas", "git"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Documentación web",
    folder_id: "f7",
    tags: ["documentación", "web"],
    created_at: new Date().toISOString(),
  },
];

export const DEMO_TAGS = ["web", "react", "framework", "backend", "database", "auth", "css", "herramientas", "git", "documentación"];

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url === "" || key === "";
}
