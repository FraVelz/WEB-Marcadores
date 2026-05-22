"use client"

import { DashboardExplorerHeader } from "@/components/header/DashboardExplorerHeader"
import { DashboardMobileHeader } from "@/components/header/DashboardMobileHeader"

type Props = {
  pathname: string
  wideViewport: boolean
  sidebarRef: React.RefObject<HTMLDivElement | null>
  mobileSidebarOpen: boolean
  onOpenMobileSidebar: () => void
}

/**
 * Cabeceras globales del dashboard: explorador (md+) y barra sticky (móvil).
 * Las features solo registran slots (p. ej. herramientas de marcadores vía contexto).
 */
export function DashboardLayoutChrome({
  pathname,
  wideViewport,
  sidebarRef,
  mobileSidebarOpen,
  onOpenMobileSidebar,
}: Props) {
  return (
    <>
      {wideViewport ? <DashboardExplorerHeader pathname={pathname} sidebarRef={sidebarRef} /> : null}
      <DashboardMobileHeader pathname={pathname} sidebarOpen={mobileSidebarOpen} onOpenSidebar={onOpenMobileSidebar} />
    </>
  )
}
