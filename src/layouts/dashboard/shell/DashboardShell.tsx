"use client"

import { usePathname, useRouter } from "next/navigation"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"
import { useDashboard } from "@/contexts/DashboardContext"
import { DashboardCommandPalette } from "@/layouts/dashboard/components/DashboardCommandPalette"
import { useDashboardGlobalShortcuts } from "@/layouts/dashboard/hooks/useDashboardGlobalShortcuts"
import { useFocusMainOnMarcadoresRoute } from "@/layouts/dashboard/hooks/useFocusMainOnMarcadoresRoute"
import { DashboardMobileLayout } from "@/layouts/dashboard/shell/DashboardMobileLayout"
import { cn } from "@/lib/utils"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { push } = useRouter()
  const { appearance } = useAppAppearance()
  const wallpaperActive = Boolean(appearance.wallpaperDataUrl)

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
      <div
        className={cn("flex min-h-dvh flex-col md:min-h-screen", wallpaperActive ? "bg-transparent" : "bg-app-canvas")}
      >
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
