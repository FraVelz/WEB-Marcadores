/**
 * Datos de ejemplo para modo demo (sin credenciales Supabase).
 * Permite probar la UI localmente sin configurar Supabase.
 */

export const DEMO_BOOKMARKS = [
  {
    id: "demo-1",
    title: "Next.js",
    url: "https://nextjs.org",
    description: "Framework React para producción",
    theme: "Desarrollo",
    subtheme: "Frontend",
    tags: ["web", "react", "framework"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Supabase",
    url: "https://supabase.com",
    description: "Backend as a Service",
    theme: "Desarrollo",
    subtheme: "Backend",
    tags: ["backend", "database", "auth"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    theme: "Desarrollo",
    subtheme: "Frontend",
    tags: ["css", "web"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    title: "GitHub",
    url: "https://github.com",
    theme: "Herramientas",
    subtheme: "Control de versiones",
    tags: ["herramientas", "git"],
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Documentación web",
    theme: "Documentación",
    subtheme: "Web",
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
