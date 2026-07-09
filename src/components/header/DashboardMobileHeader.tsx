"use client"

import { MarcadoresViewModeToggle } from "@/features/marcadores/components/MarcadoresViewModeToggle"
import { dashboardMobileTitle, isMarcadoresRoute } from "@/components/header/dashboardNav"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

type Props = {
  pathname: string
  sidebarOpen: boolean
  onOpenSidebar: () => void
}

/** Cabecera global sticky en viewport estrecho (menú + título de ruta). */
export function DashboardMobileHeader({ pathname, sidebarOpen, onOpenSidebar }: Props) {
  return (
    <header className="border-app-border bg-app-toolbar sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
      <button
        type="button"
        className={cn("text-app-fg-secondary hover:bg-app-active hover:text-app-fg rounded p-2", FOCUS_RING_ICON_BTN)}
        aria-label="Abrir menú"
        aria-expanded={sidebarOpen}
        onClick={onOpenSidebar}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      <span className="text-app-fg min-w-0 flex-1 truncate text-sm font-medium">{dashboardMobileTitle(pathname)}</span>

      {isMarcadoresRoute(pathname) ? <MarcadoresViewModeToggle compact className="shrink-0" /> : null}
    </header>
  )
}
