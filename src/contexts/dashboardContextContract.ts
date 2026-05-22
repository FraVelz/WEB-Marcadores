import type { ReactNode } from "react"

import type { Folder } from "@/contexts/dashboardTypes"

export type ViewMode = "grid" | "hierarchical"

export type MarcadoresRuntimeSnap = {
  bookmarks: Array<{ id: string; title: string; url: string }>
  recordBookmarkOpened: (id: string) => Promise<void>
}

export type DashboardContextType = {
  demoMode: boolean
  mainRef: React.RefObject<HTMLElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
  focusMain: () => void
  focusSidebar: () => void
  allTags: string[]
  refreshTags: () => void
  setAllTagsFromBookmarks: (rows: { tags?: string[] | null }[]) => void
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
  setMainKeyDown: (handler: ((e: React.KeyboardEvent) => void) | null) => void
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>
  editFolderRef: React.MutableRefObject<((id: string, name: string) => void) | null>
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  refreshFolders: () => void

  commandPaletteOpen: boolean
  setCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>

  registerMarcadoresRuntime: (snapshot: MarcadoresRuntimeSnap | null) => void
  marcadoresPalette: MarcadoresRuntimeSnap | null

  explorerCollapsedIds: Set<string>
  setExplorerCollapsedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  toggleExplorerCollapsed: (folderId: string) => void
  explorerFlatSidebarItems: (string | null)[]
  marcadoresExplorerPanelRef: React.RefObject<HTMLDivElement | null>
  dashboardFullscreenHostRef: React.RefObject<HTMLDivElement | null>

  explorerWideHeaderEndSlot: ReactNode | null
  registerExplorerWideHeaderEnd: (node: ReactNode | null) => void
}
