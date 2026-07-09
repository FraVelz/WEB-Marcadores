"use client"

import { DashboardMobileHeader } from "@/components/header/DashboardMobileHeader"

type Props = {
  pathname: string
  wideViewport: boolean
  sidebarRef: React.RefObject<HTMLDivElement | null>
  mobileSidebarOpen: boolean
  onOpenMobileSidebar: () => void
}

/**
 * Cabecera global del dashboard: solo barra sticky en móvil.
 * En desktop la navegación vive en DashboardIconRail.
 */
export function DashboardLayoutChrome({
  pathname,
  mobileSidebarOpen,
  onOpenMobileSidebar,
}: Props) {
  return (
    <DashboardMobileHeader pathname={pathname} sidebarOpen={mobileSidebarOpen} onOpenSidebar={onOpenMobileSidebar} />
  )
}
