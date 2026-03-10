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
  // Raíz (14 carpetas visibles en la vista principal)
  { id: "f1", parent_id: null, name: "Aprendizaje", sort_order: 0 },
  { id: "f2", parent_id: null, name: "Compras", sort_order: 1 },
  { id: "f3", parent_id: null, name: "Desarrollo", sort_order: 2 },
  { id: "f4", parent_id: null, name: "Diseño", sort_order: 3 },
  { id: "f5", parent_id: null, name: "Entretenimiento", sort_order: 4 },
  { id: "f6", parent_id: null, name: "General", sort_order: 5 },
  { id: "f7", parent_id: null, name: "Herramientas", sort_order: 6 },
  { id: "f8", parent_id: null, name: "Multimedia", sort_order: 7 },
  { id: "f9", parent_id: null, name: "Portfolios", sort_order: 8 },
  { id: "f10", parent_id: null, name: "Productividad", sort_order: 9 },
  { id: "f11", parent_id: null, name: "Redes", sort_order: 10 },
  { id: "f12", parent_id: null, name: "Referencia", sort_order: 11 },
  { id: "f13", parent_id: null, name: "Seguridad", sort_order: 12 },
  { id: "f14", parent_id: null, name: "mi-carpeta", sort_order: 13 },
  // Subcarpetas
  { id: "f15", parent_id: "f2", name: "E-commerce", sort_order: 0 },
  { id: "f16", parent_id: "f3", name: "Componentes", sort_order: 0 },
  { id: "f17", parent_id: "f3", name: "Estilos", sort_order: 1 },
  { id: "f18", parent_id: "f3", name: "Frontend", sort_order: 2 },
  { id: "f19", parent_id: "f3", name: "Git", sort_order: 3 },
  { id: "f20", parent_id: "f3", name: "Hosting", sort_order: 4 },
  { id: "f21", parent_id: "f3", name: "Librerías", sort_order: 5 },
  { id: "f22", parent_id: "f3", name: "Multimedia", sort_order: 6 },
  { id: "f23", parent_id: "f3", name: "Web", sort_order: 7 },
  { id: "f24", parent_id: "f4", name: "Animación", sort_order: 0 },
  { id: "f25", parent_id: "f4", name: "Iconos", sort_order: 1 },
  { id: "f26", parent_id: "f4", name: "Inspiración", sort_order: 2 },
  { id: "f27", parent_id: "f4", name: "Layout", sort_order: 3 },
  { id: "f28", parent_id: "f4", name: "SVG/Fondos", sort_order: 4 },
  { id: "f29", parent_id: "f5", name: "Video", sort_order: 0 },
  { id: "f30", parent_id: "f6", name: "Otros", sort_order: 0 },
  { id: "f31", parent_id: "f6", name: "Utilidades", sort_order: 1 },
  { id: "f32", parent_id: "f7", name: "Desarrollo", sort_order: 0 },
  { id: "f33", parent_id: "f7", name: "IA", sort_order: 1 },
  { id: "f34", parent_id: "f8", name: "Edición", sort_order: 0 },
];

export const DEMO_BOOKMARKS: DemoBookmark[] = [
  {
    id: "demo-1",
    title: "Next.js",
    url: "https://nextjs.org",
    description: "Framework React para producción",
    folder_id: "f18",
    tags: ["web", "react", "framework"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Supabase",
    url: "https://supabase.com",
    description: "Backend as a Service",
    folder_id: "f32",
    tags: ["backend", "database", "auth"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    folder_id: "f18",
    tags: ["css", "web"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    title: "GitHub",
    url: "https://github.com",
    folder_id: "f19",
    tags: ["herramientas", "git"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Documentación web",
    folder_id: "f23",
    tags: ["documentación", "web"],
    created_at: new Date().toISOString(),
  },
];

export const DEMO_TAGS = ["web", "react", "framework", "backend", "database", "auth", "css", "herramientas", "git", "documentación"];

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url === "" || key === "";
}
