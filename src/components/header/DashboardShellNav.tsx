import Link from "next/link"

import { dashboardNavItems } from "@/components/header/dashboardNav"

import { cn } from "@/lib/utils"

type DashboardShellNavProps = {
  pathname: string
  onNavigate?: () => void
  /** Sin borde inferior (p. ej. dentro de la banda «Explorador» superior). */
  toolbar?: boolean
  /** Menos padding vertical (cabecera compacta junto a otras herramientas). */
  compact?: boolean
}

/** Navegación principal del dashboard (cabecera explorador y drawer móvil). */
export function DashboardShellNav({ pathname, onNavigate, toolbar, compact }: DashboardShellNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "flex shrink-0 flex-nowrap gap-1 overscroll-x-contain",
        toolbar && compact ? "px-1 py-0.5" : "px-2 py-2",
        !toolbar && "border-app-border border-b",
        "snap-x overflow-x-auto md:snap-none [&::-webkit-scrollbar]:h-1"
      )}
    >
      {dashboardNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex shrink-0 snap-start items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              compact ? "min-h-8 px-2 py-1" : "min-h-9 px-2.5 py-2",
              active ? "bg-app-nav-active text-app-fg" : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
            )}
          >
            <svg className="size-3.5 shrink-0 opacity-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
