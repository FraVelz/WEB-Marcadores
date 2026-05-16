"use client"

import { MarcadoresViewModeToggle } from "@/features/marcadores/components/MarcadoresViewModeToggle"

import { mobileTitle } from "./utils"

function isMarcadoresRoute(pathname: string) {
  return pathname === "/marcadores" || pathname.startsWith("/marcadores/")
}

type DashboardMobileHeaderProps = {
  pathname: string
  sidebarOpen: boolean
  onOpenSidebar: () => void
}

export function DashboardMobileHeader({ pathname, sidebarOpen, onOpenSidebar }: DashboardMobileHeaderProps) {
  return (
    <header className="border-app-border bg-app-toolbar sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
      <button
        type="button"
        className="text-app-fg-secondary hover:bg-app-active hover:text-app-fg rounded p-2"
        aria-label="Abrir menú"
        aria-expanded={sidebarOpen}
        onClick={onOpenSidebar}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      <span className="text-app-fg min-w-0 flex-1 truncate text-sm font-medium">{mobileTitle(pathname)}</span>

      {isMarcadoresRoute(pathname) ? <MarcadoresViewModeToggle compact className="shrink-0" /> : null}
    </header>
  )
}
