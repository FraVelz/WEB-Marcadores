"use client"

import { usePathname, useRouter } from "next/navigation"

import { useDashboardGlobalShortcuts } from "./hooks/useDashboardGlobalShortcuts"
import { useFocusMainOnMarcadoresRoute } from "./hooks/useFocusMainOnMarcadoresRoute"

import { useDashboard } from "@/contexts/DashboardContext"

import { DashboardCommandPalette } from "./components/DashboardCommandPalette"

import { DashboardMobileLayout } from "./DashboardMobileLayout"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { push } = useRouter()

  const {
    mainRef,
    sidebarRef,
    focusMain,
    focusSidebar,
    mainKeyDownRef,
    setCommandPaletteOpen,
    marcadoresExplorerPanelRef,
  } = useDashboard()

  useFocusMainOnMarcadoresRoute(pathname, mainRef)

  useDashboardGlobalShortcuts({
    pathname,
    sidebarRef,
    marcadoresExplorerPanelRef,
    focusMain,
    focusSidebar,
    push,
    setCommandPaletteOpen,
  })

  return (
    <>
      <div className="bg-app-canvas flex min-h-dvh flex-col md:min-h-screen">
        <DashboardMobileLayout
          pathname={pathname}
          sidebarRef={sidebarRef}
          mainRef={mainRef}
          mainKeyDownRef={mainKeyDownRef}
        >
          {children}
        </DashboardMobileLayout>
      </div>
      <DashboardCommandPalette />
    </>
  )
}
