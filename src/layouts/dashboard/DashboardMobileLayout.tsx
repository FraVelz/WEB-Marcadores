import { useState } from "react"

import { DashboardMobileHeader } from "./DashboardMobileHeader"
import { DashboardShellNav } from "./DashboardShellNav"
import { MobileDrawerBackdrop } from "./MobileDrawerBackdrop"

import { useBodyScrollLock } from "./hooks/useBodyScrollLock"

import { type Folder } from "@/contexts/DashboardContext"

import ExplorerTree from "@/components/ExplorerTree"
import { cn } from "@/lib/utils"

type DashboardMobileLayoutProps = {
  pathname: string
  children: React.ReactNode
  collapsedIds: Set<string>
  toggleCollapsed: (id: string) => void
  sidebarRef: React.RefObject<HTMLDivElement | null>
  folders: Folder[]
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  handleSidebarKeyDown: (e: React.KeyboardEvent) => void
  mainRef: React.RefObject<HTMLElement | null>
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>
}

export function DashboardMobileLayout({
  pathname,
  children,
  collapsedIds,
  toggleCollapsed,
  sidebarRef,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  handleSidebarKeyDown,
  mainRef,
  mainKeyDownRef,
}: DashboardMobileLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useBodyScrollLock(mobileSidebarOpen)

  const closeDrawer = () => setMobileSidebarOpen(false)

  return (
    <>
      <MobileDrawerBackdrop open={mobileSidebarOpen} onClose={closeDrawer} />

      <aside
        className={cn(
          "border-app-border bg-app-sidebar flex w-56 flex-col border-r",
          "inset-y-0 left-0",
          "z-40 h-dvh transition-transform duration-200 ease-out md:relative md:z-auto md:h-screen md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0 md:shadow-none"
        )}
      >
        <div className="border-app-border flex items-center justify-between border-b px-3 py-2">
          <span className="text-app-fg-label text-xs font-medium tracking-wider uppercase">Explorador</span>

          <button
            type="button"
            className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-1 md:hidden"
            aria-label="Cerrar menú"
            onClick={closeDrawer}
          >
            ✕
          </button>
        </div>

        <DashboardShellNav pathname={pathname} onNavigate={closeDrawer} />

        {pathname === "/marcadores" && (
          <div
            ref={sidebarRef}
            tabIndex={0}
            role="navigation"
            aria-label="Árbol de carpetas"
            className="flex-1 overflow-y-auto p-2 outline-none focus:ring-0"
            onKeyDown={handleSidebarKeyDown}
          >
            <ExplorerTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelect={setSelectedFolderId}
              collapsedIds={collapsedIds}
              onToggle={toggleCollapsed}
            />
          </div>
        )}
      </aside>

      <div className="flex min-h-0 w-full flex-1 flex-col md:min-h-screen">
        <DashboardMobileHeader
          pathname={pathname}
          sidebarOpen={mobileSidebarOpen}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <main
          ref={mainRef}
          tabIndex={0}
          className="bg-app-canvas flex min-h-0 flex-1 flex-col overflow-hidden outline-none focus:ring-0"
          onKeyDown={(e) => mainKeyDownRef.current?.(e)}
        >
          {children}
        </main>
      </div>
    </>
  )
}
