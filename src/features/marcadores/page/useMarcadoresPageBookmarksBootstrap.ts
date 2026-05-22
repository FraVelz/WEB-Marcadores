"use client"

import { useMemo } from "react"

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
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  searchValue: string
}) {
  const searchForData = p.desktopWindowChrome ? "" : p.searchValue

  const data = useMarcadoresData(searchForData, p.activeBrowseFolderId, p.dash.setFolders)

  const desktopPaneDerived = useMemo((): Record<string, DesktopPaneDerivedEntry> | null => {
    if (!p.desktopWindowChrome) return null
    return deriveAllDesktopPanes(
      data.folders,
      data.filteredBookmarks,
      p.deskLibWinIds,
      p.deskFolderByWin,
      p.deskUiByWin,
      createDefaultDeskLibraryPaneUi
    )
  }, [data.folders, data.filteredBookmarks, p.desktopWindowChrome, p.deskFolderByWin, p.deskLibWinIds, p.deskUiByWin])

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
    setDetailBookmark: p.setDetailBookmark,
  })

  const duplicateClusterCount = useMemo(() => countDuplicateClusters(data.bookmarks), [data.bookmarks])

  return { ...data, desktopPaneDerived, duplicateClusterCount, ...actions }
}
