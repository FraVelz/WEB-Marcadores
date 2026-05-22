# Header global del dashboard

Componentes compartidos por todas las rutas bajo `(dashboard)/`. El layout (`src/layouts/dashboard/shell`) solo los monta; las features registran slots en contexto (p. ej. herramientas de marcadores).

| Archivo | Uso |
|---------|-----|
| `dashboardNav.ts` | Rutas, `dashboardMobileTitle`, `isMarcadoresRoute` |
| `DashboardShellNav.tsx` | Enlaces principales (explorador + drawer) |
| `DashboardMobileHeader.tsx` | Cabecera sticky en móvil |
| `DashboardExplorerHeader.tsx` | Barra «Explorador» en `md+` |
| `DashboardLayoutChrome.tsx` | Orquesta móvil + explorador según viewport |
