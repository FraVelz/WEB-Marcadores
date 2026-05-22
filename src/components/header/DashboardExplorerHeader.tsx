"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { MarcadoresViewModeToggle } from "@/features/marcadores/components/MarcadoresViewModeToggle"

import { DashboardShellNav } from "@/components/header/DashboardShellNav"
import { isMarcadoresRoute } from "@/components/header/dashboardNav"

type Props = {
  pathname: string
  sidebarRef: React.RefObject<HTMLDivElement | null>
}

/** Cabecera ancha del explorador (árbol + modo marcadores + slot de herramientas). */
export function DashboardExplorerHeader({ pathname, sidebarRef }: Props) {
  const { explorerWideHeaderEndSlot } = useDashboard()
  const isMarcadores = isMarcadoresRoute(pathname)

  return (
    <header className="border-app-border bg-app-sidebar flex shrink-0 flex-row flex-nowrap items-center gap-2 border-b px-3 py-1.5">
      <span className="text-app-fg-label shrink-0 text-xs font-medium tracking-wider uppercase">Explorador</span>
      <div
        ref={sidebarRef}
        tabIndex={0}
        className="outline-app-focus flex min-h-0 max-w-[42vw] min-w-0 shrink flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:max-w-none md:flex-[0_1_auto]"
      >
        <DashboardShellNav pathname={pathname} toolbar compact />
      </div>
      {isMarcadores ? <MarcadoresViewModeToggle className="shrink-0" /> : null}
      {explorerWideHeaderEndSlot ? (
        <div className="border-app-border flex min-h-9 min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto overscroll-x-contain border-l pl-3 [-webkit-overflow-scrolling:touch] md:min-h-10 [&::-webkit-scrollbar]:h-1">
          {explorerWideHeaderEndSlot}
        </div>
      ) : null}
    </header>
  )
}
