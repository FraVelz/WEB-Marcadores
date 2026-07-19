/** Rutas del dashboard y título de la cabecera móvil por pathname. */
export const dashboardNavItems = [
  { href: "/marcadores", label: "Marcadores" },
  { href: "/papelera", label: "Papelera" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/atajos", label: "Atajos" },
  { href: "/perfil", label: "Perfil" },
] as const

export function dashboardMobileTitle(pathname: string): string {
  const hit = dashboardNavItems.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
  return hit?.label ?? "Marcadores"
}

export function isMarcadoresRoute(pathname: string): boolean {
  return pathname === "/marcadores" || pathname.startsWith("/marcadores/")
}
