# Documentación del proyecto — Marcadores

Gestor de marcadores con **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4** y **Supabase** (auth + base de datos). Interfaz tipo explorador de archivos con atajos de teclado.

---

## Stack tecnológico

| Capa            | Tecnología                                |
| --------------- | ----------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack en dev) |
| UI              | React 19, Tailwind CSS 4                  |
| Backend / datos | Supabase (PostgreSQL, Auth, cliente JS)   |
| SSR cookies     | `@supabase/ssr`                           |

---

## Estructura de directorios

```
WEB-Marcadores/
├── docs/
│   └── DOCUMENTACION.md      # Este archivo
├── public/
│   ├── favicon.svg           # Favicon (referenciado en layout)
│   └── screenshot.png        # Captura para README / Open Graph
├── scripts/                  # Utilidades CLI (tsx + dotenv)
│   ├── create-bookmarks-table.ts
│   ├── fetch-bookmarks.ts
│   ├── generate-descriptions.ts
│   └── print-bookmarks-sql.ts
├── src/
│   ├── app/                  # Rutas y layouts Next.js
│   ├── components/         # Componentes compartidos
│   ├── contexts/           # React Context
│   ├── features/marcadores/  # Dominio “marcadores” (hooks + UI)
│   └── lib/                # Utilidades y cliente Supabase
├── .env.example
├── next.config.ts
├── package.json
└── vercel.json               # Config despliegue (si aplica)
```

---

## `src/app/` — Rutas

| Ruta             | Archivo                           | Descripción                                                      |
| ---------------- | --------------------------------- | ---------------------------------------------------------------- |
| `/`              | `page.tsx`                        | Login / registro (Supabase Auth)                                 |
| `/demo`          | `demo/page.tsx`                   | Redirección según modo demo (middleware suele interceptar antes) |
| `/marcadores`    | `(dashboard)/marcadores/page.tsx` | Vista principal: cuadrícula, carpetas, búsqueda                  |
| `/atajos`        | `(dashboard)/atajos/page.tsx`     | Lista de atajos de teclado                                       |
| `/perfil`        | `(dashboard)/perfil/page.tsx`     | Perfil de usuario (demo: email ficticio)                         |
| Layout raíz      | `layout.tsx`                      | Fuentes Geist, metadata SEO, Open Graph, `icons`                 |
| Layout dashboard | `(dashboard)/layout.tsx`          | `DashboardProvider` + `DashboardShell`                           |

El grupo `(dashboard)` agrupa rutas que comparten el shell (sidebar + área principal).

---

## `src/components/` — Componentes globales

| Componente                | Rol                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `DashboardShell.tsx`      | Layout: navegación (Marcadores / Atajos / Perfil), sidebar con árbol de carpetas en `/marcadores`, área principal enfocable |
| `ExplorerTree.tsx`        | Árbol jerárquico de carpetas (sidebar)                                                                                      |
| `BookmarkModal.tsx`       | Modal crear/editar marcador (título, URL, descripción, carpeta, tags)                                                       |
| `BookmarkDetailPanel.tsx` | Panel lateral de detalle de un marcador                                                                                     |
| `TagAutocomplete.tsx`     | Autocompletado de etiquetas                                                                                                 |
| `bookmark/*`              | Subformularios del modal y del panel de detalle                                                                             |

---

## `src/contexts/DashboardContext.tsx`

Estado compartido del dashboard:

- Referencias: `mainRef`, `sidebarRef` (foco teclado `n`)
- Búsqueda: **no** incluye `searchValue` (vive en la página de marcadores para rendimiento)
- `selectedFolderId`, `folders`, `allTags`, `refreshTags`, `refreshFolders`
- `setMainKeyDown` / `mainKeyDownRef`: atajos de la cuadrícula de marcadores

---

## `src/features/marcadores/` — Dominio marcadores

### Hooks

| Archivo                    | Función                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `useMarcadoresData.ts`     | Carga bookmarks + carpetas (Supabase o `demo-data`), filtro de búsqueda, `flatList`, breadcrumb |
| `useMarcadoresActions.ts`  | CRUD marcadores/carpetas, pegar, renombrar, eliminar carpeta, actualizar detalle                |
| `useMarcadoresKeyboard.ts` | Atajos: `a`, `Ctrl+A`, `r`, `dd`, navegación vim-like, cortar/pegar, etc.                       |
| `useMarcadoresEffects.ts`  | Efectos: índice seleccionado, scroll, `Ctrl+F`/`Ctrl+K` búsqueda, modal vs teclado              |

### Componentes

| Archivo                                     | Función                                                      |
| ------------------------------------------- | ------------------------------------------------------------ |
| `BookmarkGrid.tsx` / `BookmarkGridItem.tsx` | Cuadrícula de carpetas y enlaces, drag & drop                |
| `MarcadoresToolbar.tsx`                     | Barra: navegación, búsqueda, carpetas, selección             |
| `Toolbar*.tsx`                              | Secciones de la toolbar (búsqueda, botones, renombrar, etc.) |
| `MarcadoresBreadcrumb.tsx`                  | Migas de pan de carpetas                                     |
| `MarcadoresFooter.tsx`                      | Pie con ayuda de teclas                                      |
| `DemoBanner.tsx`                            | Aviso “datos de ejemplo” en modo demo                        |
| `DeleteConfirmBanner.tsx`                   | Confirmación al eliminar con `dd`                            |
| `PasteErrorBanner.tsx`                      | Errores de pegado (nombre duplicado, etc.)                   |

### Otros

- `types.ts` — Tipos `Bookmark`, `GridItem`, `CutItem`, `BreadcrumbPart`, etc.
- `utils.ts` — `buildFolderTree`, `getFolderPath`, `isFolderDescendant`, favicon helper

---

## `src/lib/`

| Archivo              | Función                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `supabase/client.ts` | Cliente browser + reexporta `isDemoMode`                                       |
| `demo-data.ts`       | Carpetas y marcadores de ejemplo; `isDemoMode()` (env + cookie `demo_session`) |
| `bookmark-utils.ts`  | Helpers para formularios de marcadores                                         |

---

## `src/middleware.ts`

- `/demo` → redirección a `/marcadores` + cookie `demo_session`
- Sin Supabase configurado o `NEXT_PUBLIC_DEMO_MODE=true` → sin exigir login
- Con Supabase: sesión válida; rutas `/marcadores`, `/atajos`, `/perfil` requieren usuario (salvo cookie demo)

---

## Modos de datos

1. **Producción con Supabase** — Tablas `bookmarks` y `folders`; auth por email.
2. **Demo implícita** — Sin URL/key de Supabase en env: datos en memoria (`demo-data.ts`).
3. **Demo con Supabase configurado** — Botón “Probar demo” o `/demo` → cookie `demo_session` → mismos datos de ejemplo sin tocar la cuenta real.

---

## Scripts (`scripts/`)

| Script                      | Uso                                                  |
| --------------------------- | ---------------------------------------------------- |
| `fetch-bookmarks.ts`        | Exportar marcadores (requiere `.env.local`)          |
| `create-bookmarks-table.ts` | Crear tablas vía Postgres (password en env)          |
| `print-bookmarks-sql.ts`    | Imprimir SQL de esquema                              |
| `generate-descriptions.ts`  | Rellenar descripciones/tags con OpenAI (keys en env) |

Ver `package.json` para comandos exactos (`pnpm run …`).

---

## Variables de entorno

Resumen; detalle en `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — App y middleware
- `NEXT_PUBLIC_SITE_URL` — URLs canónicas y Open Graph
- `NEXT_PUBLIC_DEMO_MODE` — Forzar modo demo en hosting
- `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Solo scripts de descripciones
- `SUPABASE_DB_PASSWORD` — Script `db:create-table`

---

## Convenciones útiles

- **Atajos**: documentados en `/atajos`; la lógica principal está en `useMarcadoresKeyboard` y `DashboardShell`.
- **Corte y pegado**: `Ctrl+X` / `Ctrl+V`; misma validación que arrastrar y soltar.
- **Favicon**: `public/favicon.svg` + `metadata.icons` en `layout.tsx` (no duplicar `app/favicon.ico` salvo que quieras ICO explícito).

---

## Documentación en otros idiomas

- [README principal (español)](../README.md)
- [README en inglés](../README.en.md)
