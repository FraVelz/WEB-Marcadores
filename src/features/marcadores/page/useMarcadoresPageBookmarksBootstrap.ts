"use client"

import type { DashboardContextType } from "@/contexts/dashboardContextContract"

import { deriveAllDesktopPanes } from "@/features/marcadores/core/deriveDesktopPaneEntry"
import type { DesktopPaneDerivedEntry } from "@/features/marcadores/core/deriveDesktopPaneEntry"
import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData"
import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { createDefaultDeskLibraryPaneUi } from "@/features/marcadores/state/libraryPaneUiState"
import { countDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"
import type { Bookmark } from "@/features/marcadores/utils/types"

type DashPick = Pick<DashboardContextType, "setFolders" | "refreshFolders" | "refreshTags">

export function useMarcadoresPageBookmarksBootstrap(p: {
  dash: DashPick
  activeBrowseFolderId: string | null
  dashboardSelectedFolderId: string | null
  setGlobalSelectedFolderId: (id: string | null) => void
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  searchValue: string
  searchInSubfolders: boolean
  searchInDescription: boolean
  bookmarkSort: import("@/features/marcadores/state/libraryPaneUiState").BookmarkSortOrder
}) {
  const data = useMarcadoresData(
    {
      enabled: !p.desktopWindowChrome,
      query: p.searchValue,
      folderId: p.activeBrowseFolderId,
      searchInSubfolders: p.searchInSubfolders,
      searchInDescription: p.searchInDescription,
      bookmarkSort: p.bookmarkSort,
    },
    p.dash.setFolders
  )

  const desktopPaneDerived = ((): Record<string, DesktopPaneDerivedEntry> | null => {
    if (!p.desktopWindowChrome) return null
    return deriveAllDesktopPanes(
      data.folders,
      data.filteredBookmarks,
      p.deskLibWinIds,
      p.deskFolderByWin,
      p.deskUiByWin,
      createDefaultDeskLibraryPaneUi
    )
  })()

  const actions = useMarcadoresActions({
    bookmarks: data.bookmarks,
    setBookmarks: data.setBookmarks,
    folders: data.folders,
    setFolders: data.setFolders,
    setCtxFolders: p.dash.setFolders,
    refreshFolders: p.dash.refreshFolders,
    refreshTags: p.dash.refreshTags,
    fetchData: data.fetchData,
    selectedFolderId: p.activeBrowseFolderId,
    dashboardSelectedFolderId: p.dashboardSelectedFolderId,
    setGlobalSelectedFolderId: p.setGlobalSelectedFolderId,
    deskFolderByWin: p.deskFolderByWin,
    setDeskFolderByWin: p.setDeskFolderByWin,
    setDetailBookmark: p.setDetailBookmark,
  })

  const duplicateClusterCount = countDuplicateClusters(data.bookmarks)

  return { ...data, desktopPaneDerived, duplicateClusterCount, ...actions }
}
