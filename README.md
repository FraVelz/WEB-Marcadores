# Marcadores

App de marcadores con Next.js y Supabase. Incluye modo demo (sin credenciales) para probar en local.

## Uso

```bash
pnpm install
pnpm dev
```

Sin `.env.local` o sin credenciales Supabase: usa modo demo (datos en memoria).

## Scripts

- `pnpm run classify:ai` — Clasifica con OpenAI (tema, subtema, tags). Requiere `OPENAI_API_KEY`
- `pnpm run fetch:bookmarks` — Exporta marcadores a stdout (redirigir a `bookmarks-export.json`)
- `pnpm run classify:apply` — Clasifica y aplica a Supabase (lee `bookmarks-export.json`)
- `pnpm run db:create-table` — Crea tabla en Supabase (requiere migración)
- `pnpm run db:sql` — Imprime SQL para crear tabla
- `pnpm run db:sql:section` — Imprime SQL para migrar section → tags
- `pnpm run db:sql:theme` — Imprime SQL para añadir theme y subtheme

## Estructura

- `src/app/` — Rutas Next.js (login, marcadores, atajos, perfil)
- `src/components/` — BookmarkModal, TagAutocomplete, etc.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena las credenciales de Supabase.
