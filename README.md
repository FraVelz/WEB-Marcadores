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
- `src/data/bookmarks/` — Un JSON por carpeta (`apps.json`, `learning.json`, etc.)
  - `index.json` — Índice con lista de carpetas y allLinks
- `scripts/parse-bookmarks.js` — Parsea el HTML → `src/data/bookmarks/`
- `scripts/generate-docs.js` — Lee desde `bookmarks/` y genera MDX
- `scripts/split-bookmarks.js` — Migración: divide `bookmarks.json` en carpetas
- `src/content/docs/` — Documentación Starlight
- `src/components/` — Componentes reutilizables

### Mapeo de secciones

El generador reorganiza y renombra secciones para mejor navegación:

| Original | Nuevo |
|----------|-------|
| Perfiles-Git-Web | Portfolios |
| Desarrollo-WEB | Desarrollo Web |
| User Interface | Diseño UI |
| Others | Utilidades |
| herrramientas | Herramientas |
| shorcuts | Atajos |

Edita `FOLDER_MAP` en `scripts/generate-docs.js` para personalizar.
