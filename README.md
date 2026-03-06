# Marcadores - Documentación

Web de documentación generada a partir de marcadores de Firefox, organizados por secciones. Incluye búsqueda por texto, modo claro/oscuro y conteo de enlaces en la navegación.

## Características

- Marcadores organizados jerárquicamente por categorías
- Modo claro y oscuro
- Búsqueda por texto (Ctrl+K / Cmd+K) con Pagefind
- Conteo de enlaces por sección en la barra lateral: `{n} - {nombre}`
- Iconos con carga diferida (lazy)
- Componentes reutilizables en `src/components/`

## Uso

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Regenerar documentación desde bookmarks.html
pnpm sync

# Build para producción
pnpm build
```

## Estructura

- `bookmarks.html` — Marcadores de Firefox (origen)
- `scripts/parse-bookmarks.js` — Parsea el HTML → `src/data/bookmarks.json`
- `scripts/generate-docs.js` — Genera MDX y `src/data/sidebar-nav.json`
- `src/content/docs/` — Documentación Starlight
- `src/components/` — Componentes reutilizables
