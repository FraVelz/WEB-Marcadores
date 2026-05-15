import Link from "next/link"

import { navItems } from "./utils"

import { cn } from "@/lib/utils"

type DashboardShellNavProps = {
  pathname: string
  onNavigate?: () => void
  /** Sin borde inferior (p. ej. dentro de la banda «Explorador» superior). */
  toolbar?: boolean
}

/** Barra de navegación principal en una sola fila horizontal (scroll si el panel es estrecho). */
export function DashboardShellNav({ pathname, onNavigate, toolbar }: DashboardShellNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "flex shrink-0 flex-nowrap gap-1 overscroll-x-contain px-2 py-2",
        !toolbar && "border-app-border border-b",
        "snap-x overflow-x-auto md:snap-none [&::-webkit-scrollbar]:h-1"
      )}
    >
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors",
              active ? "bg-app-nav-active text-app-fg" : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
            )}
          >
            <svg className="text-app-fg-icon size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
