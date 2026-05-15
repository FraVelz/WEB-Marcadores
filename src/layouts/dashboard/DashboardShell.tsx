"use client"

import { usePathname, useRouter } from "next/navigation"

import { useDashboardGlobalShortcuts } from "./hooks/useDashboardGlobalShortcuts"
import { useDashboardSidebarKeyboard } from "./hooks/useDashboardSidebarKeyboard"
import { useFocusMainOnMarcadoresRoute } from "./hooks/useFocusMainOnMarcadoresRoute"
import { useSidebarTreeCollapse } from "./hooks/useSidebarTreeCollapse"

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
    editFolderRef,
    selectedFolderId,
    setSelectedFolderId,
    folders,
    setCommandPaletteOpen,
  } = useDashboard()

  const { collapsedIds, setCollapsedIds, flatSidebarItems, toggleCollapsed } = useSidebarTreeCollapse(folders)

  useFocusMainOnMarcadoresRoute(pathname, mainRef)

  const handleSidebarKeyDown = useDashboardSidebarKeyboard({
    flatSidebarItems,
    selectedFolderId,
    setSelectedFolderId,
    folders,
    collapsedIds,
    setCollapsedIds,
    focusMain,
    editFolderRef,
  })

  useDashboardGlobalShortcuts({
    pathname,
    sidebarRef,
    focusMain,
    focusSidebar,
    push,
    setCommandPaletteOpen,
  })

  return (
    <>
      <div className="bg-app-canvas flex min-h-dvh md:min-h-screen">
        <DashboardMobileLayout
          key={pathname}
          pathname={pathname}
          collapsedIds={collapsedIds}
          toggleCollapsed={toggleCollapsed}
          sidebarRef={sidebarRef}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          handleSidebarKeyDown={handleSidebarKeyDown}
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
