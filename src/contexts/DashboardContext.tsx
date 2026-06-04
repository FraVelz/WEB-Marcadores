"use client"

import { createContext, use, useRef, useCallback, useReducer } from "react"

import type { ReactNode } from "react"

import { useSidebarTreeCollapse } from "@/layouts/dashboard/hooks/useSidebarTreeCollapse"

import { useDashboardBookmarksTree } from "@/contexts/useDashboardBookmarksTree"
import type { DashboardContextType, MarcadoresRuntimeSnap, ViewMode } from "@/contexts/dashboardContextContract"
import { INITIAL_DASHBOARD_UI, dashboardUiReducer } from "@/contexts/dashboardUiReducer"

export type { Folder } from "@/contexts/dashboardTypes"
export type { MarcadoresRuntimeSnap, ViewMode } from "@/contexts/dashboardContextContract"

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children, demoMode }: { children: React.ReactNode; demoMode: boolean }) {
  const mainRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const marcadoresExplorerPanelRef = useRef<HTMLDivElement>(null)
  const dashboardFullscreenHostRef = useRef<HTMLDivElement>(null)
  const { allTags, folders, setFolders, refreshTags, setAllTagsFromBookmarks, refreshFolders } =
    useDashboardBookmarksTree(demoMode)
  const [ui, dispatchUi] = useReducer(dashboardUiReducer, INITIAL_DASHBOARD_UI)
  const { viewMode, selectedFolderId, commandPaletteOpen, marcadoresPalette, explorerWideHeaderEndSlot } = ui
  const {
    collapsedIds: explorerCollapsedIds,
    setCollapsedIds: setExplorerCollapsedIds,
    flatSidebarItems: explorerFlatSidebarItems,
    toggleCollapsed: toggleExplorerCollapsed,
  } = useSidebarTreeCollapse(folders)

  const setViewMode = useCallback((m: ViewMode) => {
    dispatchUi({ type: "view_mode", mode: m })
  }, [])

  const setSelectedFolderId = useCallback((id: string | null) => {
    dispatchUi({ type: "selected_folder", id })
  }, [])

  const setCommandPaletteOpen = useCallback((updater: React.SetStateAction<boolean>) => {
    dispatchUi({ type: "command_palette", updater })
  }, [])

  const registerMarcadoresRuntime = useCallback((snapshot: MarcadoresRuntimeSnap | null) => {
    queueMicrotask(() => {
      dispatchUi({ type: "marcadores_palette", updater: snapshot })
    })
  }, [])

  const registerExplorerWideHeaderEnd = useCallback((node: ReactNode | null) => {
    queueMicrotask(() => {
      dispatchUi({ type: "explorer_header_slot", updater: node })
    })
  }, [])
  const editFolderRef = useRef<((id: string, name: string) => void) | null>(null)

  const focusMain = useCallback(() => {
    mainRef.current?.focus()
  }, [])

  const focusSidebar = useCallback(() => {
    marcadoresExplorerPanelRef.current?.focus()
    sidebarRef.current?.focus()
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        demoMode,
        mainRef,
        sidebarRef,
        focusMain,
        focusSidebar,
        allTags,
        refreshTags,
        setAllTagsFromBookmarks,
        viewMode,
        setViewMode,
        editFolderRef,
        selectedFolderId,
        setSelectedFolderId,
        folders,
        setFolders,
        refreshFolders,

        commandPaletteOpen,
        setCommandPaletteOpen,
        registerMarcadoresRuntime,
        marcadoresPalette,

        explorerCollapsedIds,
        setExplorerCollapsedIds,
        toggleExplorerCollapsed,
        explorerFlatSidebarItems,
        marcadoresExplorerPanelRef,
        dashboardFullscreenHostRef,

        explorerWideHeaderEndSlot,
        registerExplorerWideHeaderEnd,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = use(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")

  return ctx
}
