# Marcadores

Gestor de marcadores y favoritos con Next.js y Supabase. Organiza tus enlaces en carpetas, usa atajos y explora tu colección con una interfaz oscura tipo explorador.

![Interfaz principal](public/screenshot.png)

## Versión demo

Puedes probar la aplicación **sin iniciar sesión**:

- **Local:** ejecuta `pnpm dev` sin configurar `.env.local` — verás el botón "Probar demo" en la página de login.
- **En línea:** accede a `/demo` para ir directamente a la interfaz principal (requiere `NEXT_PUBLIC_DEMO_MODE=true` en el despliegue).

La demo muestra carpetas de ejemplo (Documentación, Frameworks, Herramientas) con enlaces genéricos de desarrollo web (MDN, React, Next.js, etc.). Los cambios se guardan en memoria durante la sesión.

## Uso

```bash
pnpm install
pnpm dev
```

Sin `.env.local` o sin credenciales Supabase: usa modo demo (datos en memoria).

## Scripts

- `pnpm run dev` — Servidor de desarrollo
- `pnpm run fetch:bookmarks` — Exporta marcadores a stdout (ej: `> bookmarks.json`)
- `pnpm run descriptions:generate` — Genera descripciones y tags con OpenAI para marcadores sin descripción
- `pnpm run db:create-table` — Crea tabla en Supabase (requiere migración)
- `pnpm run db:sql` — Imprime SQL para crear tabla

## Estructura

- `src/app/` — Rutas Next.js (login, marcadores, atajos, perfil, demo)
- `src/components/` — BookmarkModal, TagAutocomplete, DashboardShell, etc.
- `src/lib/demo-data.ts` — Datos de ejemplo para modo demo

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena las credenciales de Supabase.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (para Open Graph al compartir) |
| `NEXT_PUBLIC_DEMO_MODE` | `true` para forzar modo demo en producción |

## Documentación

- [English](README.en.md)
