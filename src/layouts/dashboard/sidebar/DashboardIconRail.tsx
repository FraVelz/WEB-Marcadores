"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import { AppLogoMark } from "@/components/brand/AppLogoMark"
import { dashboardNavItems, isMarcadoresRoute } from "@/components/header/dashboardNav"
import { useMarcadoresViewMode, type MarcadoresViewMode } from "@/features/marcadores/hooks/useMarcadoresViewMode"
import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

const NAV_ICONS: Record<(typeof dashboardNavItems)[number]["href"], ReactNode> = {
  "/marcadores": (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/estadisticas": (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "/atajos": (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  ),
  "/perfil": (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  ),
}

function SearchIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function DesktopModeIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" className={active ? "fill-current opacity-20" : undefined} />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
  )
}

type RailButtonProps = {
  label: string
  active?: boolean
  onClick?: () => void
  href?: string
  children: ReactNode
}

function RailButton({ label, active, onClick, href, children }: RailButtonProps) {
  const className = cn(
    "flex size-10 items-center justify-center rounded-lg transition-colors",
    FOCUS_RING_ICON_BTN,
    active
      ? "bg-app-primary text-white shadow-sm"
      : "text-app-fg-muted hover:bg-app-hover hover:text-app-fg"
  )

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label} title={label}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={className} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  )
}

/** Barra de iconos global del dashboard (solo desktop). */
export function DashboardIconRail() {
  const pathname = usePathname()
  const { setCommandPaletteOpen } = useDashboard()
  const { mode, setMode } = useMarcadoresViewMode()
  const onMarcadores = isMarcadoresRoute(pathname)

  const toggleDesktopMode = () => {
    const next: MarcadoresViewMode = mode === "escritorio" ? "simple" : "escritorio"
    setMode(next)
  }

  return (
    <aside
      className="border-app-border bg-app-sidebar hidden w-[52px] shrink-0 flex-col items-center border-r py-3 md:flex"
      aria-label="Navegación global"
    >
      <AppLogoMark className="mb-3" />

      <nav className="flex flex-1 flex-col items-center gap-1">
        {dashboardNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <RailButton key={item.href} href={item.href} label={item.label} active={active}>
              {NAV_ICONS[item.href]}
            </RailButton>
          )
        })}

        <div className="bg-app-border my-2 h-px w-6" aria-hidden />

        <RailButton
          label="Buscar (Ctrl+K)"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <SearchIcon />
        </RailButton>

        {onMarcadores ? (
          <RailButton
            label={mode === "escritorio" ? "Modo simple" : "Modo escritorio"}
            active={mode === "escritorio"}
            onClick={toggleDesktopMode}
          >
            <DesktopModeIcon active={mode === "escritorio"} />
          </RailButton>
        ) : null}
      </nav>
    </aside>
  )
}
