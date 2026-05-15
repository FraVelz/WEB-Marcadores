"use client"

import { createContext, use, useRef, useCallback, useReducer } from "react"

import type { ReactNode } from "react"

import { createClient } from "@/lib/supabase/client"

import type { WorkspaceLayoutPayload } from "@/features/marcadores/workspaces/workspaceLayout"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"
import { writeTabScopedItem } from "@/lib/tabScopedStorage"
import { useSidebarTreeCollapse } from "@/layouts/dashboard/hooks/useSidebarTreeCollapse"

import {
  ACTIVE_WS_KEY,
  layoutStorageKeyBase,
  useDashboardWorkspaceBootstrap,
} from "@/contexts/useDashboardWorkspaceBootstrap"
import { useDashboardBookmarksTree } from "@/contexts/useDashboardBookmarksTree"
import type { DashboardContextType, MarcadoresRuntimeSnap, ViewMode } from "@/contexts/dashboardContextContract"
import { INITIAL_DASHBOARD_UI, dashboardUiReducer } from "@/contexts/dashboardUiReducer"
import { INITIAL_DASHBOARD_WORKSPACE, dashboardWorkspaceReducer } from "@/contexts/dashboardWorkspaceReducer"

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
  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null)
  const editFolderRef = useRef<((id: string, name: string) => void) | null>(null)

  const [ws, dispatchWs] = useReducer(dashboardWorkspaceReducer, INITIAL_DASHBOARD_WORKSPACE)
  const { workspaces, activeWorkspaceId, workspaceLayout, workspacesLoading } = ws

  const setWorkspaces = useCallback((updater: React.SetStateAction<WorkspaceRow[]>) => {
    dispatchWs({ type: "set_workspaces", updater })
  }, [])

  const setActiveWorkspaceIdState = useCallback((id: string | null) => {
    dispatchWs({ type: "set_active_id", id })
  }, [])

  const setWorkspaceLayout = useCallback((updater: React.SetStateAction<WorkspaceLayoutPayload | null>) => {
    dispatchWs({ type: "set_layout", updater })
  }, [])

  const setWorkspacesLoading = useCallback((updater: React.SetStateAction<boolean>) => {
    dispatchWs({ type: "set_loading", updater })
  }, [])

  const setActiveWorkspaceId = useCallback(
    (id: string | null) => {
      setActiveWorkspaceIdState(id)
      if (typeof window === "undefined" || id === null) return
      try {
        writeTabScopedItem(ACTIVE_WS_KEY, id)
      } catch {
        /* ignore quota */
      }
    },
    [setActiveWorkspaceIdState]
  )

  const { reloadWorkspacesAndLayout } = useDashboardWorkspaceBootstrap({
    demoMode,
    setWorkspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setWorkspaceLayout,
    setWorkspacesLoading,
    workspacesLoading,
  })

  const persistWorkspaceLayout = useCallback(
    async (payload: WorkspaceLayoutPayload) => {
      setWorkspaceLayout(payload)
      if (!activeWorkspaceId) return

      if (demoMode) {
        try {
          writeTabScopedItem(layoutStorageKeyBase(activeWorkspaceId, true), JSON.stringify(payload))
        } catch {
          /* ignore */
        }
        return
      }

      const supabase = createClient()
      await supabase.from("workspace_layouts").upsert(
        {
          workspace_id: activeWorkspaceId,
          payload,
          revision: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      )
    },
    [activeWorkspaceId, demoMode, setWorkspaceLayout]
  )

  const setMainKeyDown = useCallback((handler: ((e: React.KeyboardEvent) => void) | null) => {
    mainKeyDownRef.current = handler
  }, [])

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
        setMainKeyDown,
        mainKeyDownRef,
        editFolderRef,
        selectedFolderId,
        setSelectedFolderId,
        folders,
        setFolders,
        refreshFolders,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        workspaceLayout,
        workspacesLoading,
        reloadWorkspacesAndLayout,
        persistWorkspaceLayout,

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
