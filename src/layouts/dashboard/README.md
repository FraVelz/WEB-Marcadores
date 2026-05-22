# Layout del dashboard

Composición del shell (drawer lateral, área principal, command palette). Las **cabeceras globales** están en `src/components/header/`.

## Carpetas

| Carpeta | Responsabilidad |
|---------|-----------------|
| `sidebar/` | Drawer móvil, backdrop, utilidades del árbol |
| `shell/` | `DashboardShell` + `DashboardMobileLayout` |
| `components/` | UI global del shell (command palette) |
| `hooks/` | Atajos, viewport md, scroll lock |

## Cabeceras (en `src/components/header/`)

Import: `@/components/header` o `@/components`.

- **`DashboardMobileHeader`**: menú + título (`md:hidden`).
- **`DashboardExplorerHeader`**: explorador ancho + slot de herramientas.
- **`DashboardLayoutChrome`**: agrupa ambas según viewport.
- **`DashboardShellNav`**: enlaces Marcadores / Estadísticas / …
- **`dashboardNav.ts`**: rutas y helpers de título.
