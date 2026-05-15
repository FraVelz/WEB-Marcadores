"use client"

import { useLayoutEffect, useState } from "react"

import { DashboardMobileHeader } from "./DashboardMobileHeader"
import { DashboardShellNav } from "./DashboardShellNav"
import { MobileDrawerBackdrop } from "./MobileDrawerBackdrop"

import { useBodyScrollLock } from "./hooks/useBodyScrollLock"
import { useDashboardViewportMd } from "./hooks/useDashboardViewportMd"

import { useDashboard } from "@/contexts/DashboardContext"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"
import { applyWallpaperToHTMLElement } from "@/lib/appAppearance"

import { cn } from "@/lib/utils"

type DashboardMobileLayoutProps = {
  pathname: string
  children: React.ReactNode
  /** En rutas fuera de Marcadores permite enfocar el panel lateral con atajos. */
  sidebarRef: React.RefObject<HTMLDivElement | null>
  mainRef: React.RefObject<HTMLElement | null>
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>
}

export function DashboardMobileLayout({
  pathname,
  sidebarRef,
  children,
  mainRef,
  mainKeyDownRef,
}: DashboardMobileLayoutProps) {
  const wide = useDashboardViewportMd()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { dashboardFullscreenHostRef, explorerWideHeaderEndSlot } = useDashboard()
  const { appearance } = useAppAppearance()
  const wallpaperActive = Boolean(appearance.wallpaperDataUrl)

  useLayoutEffect(() => {
    applyWallpaperToHTMLElement(dashboardFullscreenHostRef.current, appearance)
  }, [appearance, dashboardFullscreenHostRef])

  useBodyScrollLock(mobileSidebarOpen)

  const closeDrawer = () => setMobileSidebarOpen(false)

  const isMarcadores = pathname === "/marcadores"

  const explorerNavChrome = wide ? (
    <header className="border-app-border bg-app-sidebar flex shrink-0 flex-row flex-nowrap items-center gap-2 border-b px-3 py-1.5">
      <span className="text-app-fg-label shrink-0 text-xs font-medium tracking-wider uppercase">Explorador</span>
      <div
        ref={sidebarRef}
        tabIndex={0}
        className="outline-app-focus flex min-h-0 max-w-[42vw] min-w-0 shrink flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:max-w-none md:flex-[0_1_auto]"
      >
        <DashboardShellNav pathname={pathname} toolbar compact />
      </div>
      {explorerWideHeaderEndSlot ? (
        <div className="border-app-border flex min-h-9 min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto overscroll-x-contain border-l pl-3 [-webkit-overflow-scrolling:touch] md:min-h-10 [&::-webkit-scrollbar]:h-1">
          {explorerWideHeaderEndSlot}
        </div>
      ) : null}
    </header>
  ) : (
    <aside
      className={cn(
        "border-app-border bg-app-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r shadow-xl",
        "h-dvh w-[min(18rem,calc(100vw-3rem))] transition-transform duration-200 ease-out",
        isMarcadores ? "max-w-[min(14rem,calc(100vw-3rem))]" : "max-w-[20rem]",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="border-app-border flex shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="text-app-fg-label text-xs font-medium tracking-wider uppercase">Explorador</span>

        <button
          type="button"
          className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-1"
          aria-label="Cerrar menú"
          onClick={closeDrawer}
        >
          ✕
        </button>
      </div>

      <div
        ref={sidebarRef}
        tabIndex={0}
        className={cn(
          "outline-app-focus flex min-h-0 shrink-0 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isMarcadores ? "min-h-0 overflow-y-auto" : "flex-1 overflow-y-auto"
        )}
      >
        <DashboardShellNav pathname={pathname} onNavigate={closeDrawer} toolbar />
      </div>
    </aside>
  )

  return (
    <>
      <MobileDrawerBackdrop open={mobileSidebarOpen} onClose={closeDrawer} />

      {!wide ? explorerNavChrome : null}

      <div ref={dashboardFullscreenHostRef} className="flex min-h-0 flex-1 flex-col md:min-h-screen">
        {wide ? explorerNavChrome : null}

        <DashboardMobileHeader
          pathname={pathname}
          sidebarOpen={mobileSidebarOpen}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <main
          ref={mainRef}
          tabIndex={0}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden outline-none focus:ring-0",
            wallpaperActive ? "bg-transparent" : "bg-app-canvas"
          )}
          onKeyDown={(e) => mainKeyDownRef.current?.(e)}
        >
          {children}
        </main>
      </div>
    </>
  )
}
