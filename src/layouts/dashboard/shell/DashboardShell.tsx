"use client"

import { usePathname, useRouter } from "next/navigation"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"
import { useDashboard } from "@/contexts/DashboardContext"
import { DashboardCommandPalette } from "@/layouts/dashboard/components/DashboardCommandPalette"
import { DashboardWallpaperBackdrop } from "@/layouts/dashboard/components/DashboardWallpaperBackdrop"
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
      {wallpaperActive ? <DashboardWallpaperBackdrop {...appearance} /> : null}
      <div
        className={cn(
          "relative z-10 flex h-dvh max-h-dvh flex-col overflow-hidden",
          wallpaperActive ? "bg-transparent" : "bg-app-canvas"
        )}
      >
        <DashboardMobileLayout pathname={pathname} sidebarRef={sidebarRef} mainRef={mainRef}>
          {children}
        </DashboardMobileLayout>
      </div>
      <DashboardCommandPalette />
    </>
  )
}
