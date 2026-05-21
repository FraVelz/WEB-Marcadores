"use client"

import { useMemo } from "react"

import type { DashboardContextType } from "@/contexts/dashboardContextContract"

import { deriveAllDesktopPanes, type DesktopPaneDerivedEntry } from "@/features/marcadores/core/deriveDesktopPaneEntry"
import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData"
import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { createDefaultDeskLibraryPaneUi } from "@/features/marcadores/state/libraryPaneUiState"
import { useMarcadoresPageUiState } from "@/features/marcadores/page/useMarcadoresPageUiState"
import { countDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"
import type { Bookmark } from "@/features/marcadores/utils/types"

type DashPick = Pick<DashboardContextType, "setFolders" | "refreshFolders" | "refreshTags">
type Ui = ReturnType<typeof useMarcadoresPageUiState>

export type { DesktopPaneDerivedEntry } from "@/features/marcadores/core/deriveDesktopPaneEntry"

export function useMarcadoresPageBookmarksBootstrap(p: {
  u: Ui
  dash: DashPick
  activeBrowseFolderId: string | null
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  bookmarkPanelHooks?: {
    setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  }
  searchValue?: string
}) {
  const dataOpts = useMemo(
    () =>
      p.desktopWindowChrome
        ? { browseMode: "folder" as const, activeViewAst: null }
        : { browseMode: p.u.browseMode, activeViewAst: p.u.activeViewAst },
    [p.desktopWindowChrome, p.u.activeViewAst, p.u.browseMode]
  )

  const searchForData = p.desktopWindowChrome ? "" : (p.searchValue ?? p.u.searchValue)

  const data = useMarcadoresData(searchForData, p.activeBrowseFolderId, p.dash.setFolders, dataOpts)

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
    setDetailBookmark: p.bookmarkPanelHooks?.setDetailBookmark ?? p.u.setDetailBookmark,
  })

  const duplicateClusterCount = useMemo(() => countDuplicateClusters(data.bookmarks), [data.bookmarks])

  return { ...data, desktopPaneDerived, duplicateClusterCount, ...actions }
}
