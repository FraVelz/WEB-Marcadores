"use client"

import { DashboardShellNav } from "@/components/header/DashboardShellNav"
import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN, HOTKEY_SCOPE_FOCUS } from "@/lib/focusStyles"
import { isMarcadoresRoute } from "@/components/header/dashboardNav"

type Props = {
  pathname: string
  open: boolean
  onClose: () => void
  sidebarRef: React.RefObject<HTMLDivElement | null>
}

/** Panel lateral del explorador en viewport estrecho. */
export function DashboardMobileDrawer({ pathname, open, onClose, sidebarRef }: Props) {
  const isMarcadores = isMarcadoresRoute(pathname)

  return (
    <aside
      className={cn(
        "border-app-border bg-app-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r shadow-xl",
        "h-dvh w-[min(18rem,calc(100vw-3rem))] transition-transform duration-200 ease-out",
        isMarcadores ? "max-w-[min(14rem,calc(100vw-3rem))]" : "max-w-[20rem]",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="border-app-border flex shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="text-app-fg-label text-xs font-medium tracking-wider uppercase">Explorador</span>
        <button
          type="button"
          className={cn(
            "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-1",
            FOCUS_RING_ICON_BTN
          )}
          aria-label="Cerrar menú"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div
        ref={sidebarRef}
        tabIndex={0}
        className={cn(
          HOTKEY_SCOPE_FOCUS,
          "flex min-h-0 shrink-0 flex-col",
          isMarcadores ? "min-h-0 overflow-y-auto" : "flex-1 overflow-y-auto"
        )}
      >
        <DashboardShellNav pathname={pathname} onNavigate={onClose} toolbar />
      </div>
    </aside>
  )
}
