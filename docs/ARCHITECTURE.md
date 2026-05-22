# Arquitectura — WEB-Marcadores

## Entry de Marcadores

```
MarcadoresPage.tsx
  └── useMarcadoresPage()     # hook público único (objetivo)
        ├── data              # bookmarks, folders, filtros
        ├── browseScope       # carpeta activa (simple o ventana escritorio)
        ├── uiScope           # estado de panel (global o por winId)
        ├── bookmarkModal     # abrir/cerrar modal unificado
        └── stacked | desktop
```

## Cuándo hay modo escritorio

`desktopWindowChrome === true` cuando **todas** se cumplen:

1. Viewport ≥ `md` (`useMatchMediaMd`)
2. Layout del workspace **no** es zones (`workspaceLayout`)
3. Preferencia `marcadores-view-mode === "escritorio"` (`useMarcadoresViewMode`)

Si no: vista **stacked** (explorador + grid integrados).

## Estado duplicado (antes del refactor)

| Concepto | Vista simple | Escritorio |
|----------|--------------|------------|
| UI del panel | `useMarcadoresPageUiState` | `deskUiByWin[winId]` |
| Carpeta activa | `selectedFolderId` (dashboard) | `deskFolderByWin[winId]` |
| Modal marcador | estado global del panel | mismo campos en ventana enfocada |

**Objetivo:** `LibraryPaneUiState` + `LibraryPaneUiScope` + `BrowseScope` — un solo modelo, dos backends.

## Carpetas `src/features/marcadores/`

| Carpeta | Rol |
|---------|-----|
| `core/` | Funciones puras (derivados, filtro escritorio, teclado) |
| `state/` | Tipos UI, scopes, modal, browse |
| `data/` | Supabase/demo, bootstrap de listas |
| `stacked/` | Chrome y slots vista simple |
| `desktop/` | Shell ventanas, persistencia, DnD |
| `components/` | Grid, árbol, toolbar compartidos |

## Apariencia global

1. Servidor: [`layout.tsx`](../src/app/layout.tsx) lee cookie → `className` + estilos en `<html>`
2. Cliente: [`appearance-init.js`](../public/appearance-init.js) — tema `system` + tapiz
3. React: [`AppAppearanceProvider`](../src/contexts/AppAppearanceContext.tsx)

Cookie: `marcadores_app_appearance_v1`. Tapiz: `localStorage` `marcadores_app_wallpaper_v1`.

## Checklist manual de regresión

Repetir al cerrar cada fase del refactor.

### Global

- [ ] Tema claro / oscuro / sistema persiste tras recargar
- [ ] Selección de texto legible (::selection)
- [ ] `/demo` carga sin auth

### Vista simple (modo «simple» o viewport estrecho)

- [ ] Navegar carpetas y breadcrumb
- [ ] Buscar por título, URL, etiqueta
- [ ] Crear / editar / eliminar marcador (modal)
- [ ] Crear / renombrar carpeta
- [ ] Cortar y pegar enlace o carpeta
- [ ] Vista árbol ↔ grid
- [ ] Panel de detalle del marcador

### Modo escritorio

- [ ] Cambiar a «Escritorio» en perfil o toggle
- [ ] Abrir segunda ventana de biblioteca
- [ ] Carpeta distinta por ventana
- [ ] Modal crear/editar en ventana enfocada
- [ ] Recargar página: posición ventanas (si persistencia activa)
- [ ] Taskbar / foco entre ventanas

### Estadísticas y atajos

- [ ] `/estadisticas` carga KPIs
- [ ] `/atajos` muestra lista

## Módulos nuevos (refactor)

| Ruta | Rol |
|------|-----|
| [`useMarcadoresPage.ts`](../src/features/marcadores/useMarcadoresPage.ts) | Hook público único |
| [`state/libraryPaneUiState.ts`](../src/features/marcadores/state/libraryPaneUiState.ts) | Tipo UI panel unificado |
| [`state/browseScope.ts`](../src/features/marcadores/state/browseScope.ts) | Carpeta activa simple/escritorio |
| [`state/useBookmarkModalController.ts`](../src/features/marcadores/state/useBookmarkModalController.ts) | Modal sin ramas en la página |
| [`core/deriveDesktopPaneEntry.ts`](../src/features/marcadores/core/deriveDesktopPaneEntry.ts) | Derivados por ventana escritorio |

## Implementación interna

- `page/useMarcadoresPageDataHooks.ts` — datos y derivados; consumir `useMarcadoresPage`
- `page/useMarcadoresPageCommands.tsx` — teclado, efectos y overlays
- `hooks/useMarcadoresExplorerHeaderSlot.tsx` — slot cabecera global (simple + escritorio)
