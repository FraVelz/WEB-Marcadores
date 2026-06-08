"use client"

import { useLayoutEffect, useState } from "react"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"
import { useDashboard } from "@/contexts/DashboardContext"
import { DashboardLayoutChrome } from "@/components/header/DashboardLayoutChrome"
import { DashboardMobileDrawer, MobileDrawerBackdrop } from "@/layouts/dashboard/sidebar"
import { useBodyScrollLock } from "@/layouts/dashboard/hooks/useBodyScrollLock"
import { useMatchMediaMd } from "@/lib/hooks/useMatchMediaMd"
import { applyWallpaperToHTMLElement } from "@/lib/appAppearance"
import { cn } from "@/lib/utils"

type Props = {
  pathname: string
  children: React.ReactNode
  sidebarRef: React.RefObject<HTMLDivElement | null>
  mainRef: React.RefObject<HTMLElement | null>
}

/** Composición del área principal: cabeceras globales, drawer lateral y contenido de ruta. */
export function DashboardMobileLayout({ pathname, children, sidebarRef, mainRef }: Props) {
  const wide = useMatchMediaMd()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { dashboardFullscreenHostRef } = useDashboard()
  const { appearance } = useAppAppearance()
  const wallpaperActive = Boolean(appearance.wallpaperDataUrl)

  useLayoutEffect(() => {
    applyWallpaperToHTMLElement(dashboardFullscreenHostRef.current, appearance)
  }, [appearance, dashboardFullscreenHostRef])

  useBodyScrollLock(mobileSidebarOpen)

  const closeDrawer = () => setMobileSidebarOpen(false)

  return (
    <>
      <MobileDrawerBackdrop open={mobileSidebarOpen} onClose={closeDrawer} />

      {!wide ? (
        <DashboardMobileDrawer
          pathname={pathname}
          open={mobileSidebarOpen}
          onClose={closeDrawer}
          sidebarRef={sidebarRef}
        />
      ) : null}

      <div ref={dashboardFullscreenHostRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardLayoutChrome
          pathname={pathname}
          wideViewport={wide}
          sidebarRef={sidebarRef}
          mobileSidebarOpen={mobileSidebarOpen}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main
          ref={mainRef}
          tabIndex={0}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden outline-none focus:ring-0",
            wallpaperActive ? "bg-transparent" : "bg-app-canvas"
          )}
        >
          {children}
        </main>
      </div>
    </>
  )
}
