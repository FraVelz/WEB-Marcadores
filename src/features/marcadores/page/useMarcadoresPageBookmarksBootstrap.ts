"use client"

import { useMemo } from "react"

import type { DashboardContextType } from "@/contexts/dashboardContextContract"

import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData"
import type { DeskWindowUiState } from "@/features/marcadores/page/deskWindowUiState"
import { createDefaultDeskWindowUi } from "@/features/marcadores/page/deskWindowUiState"
import { useMarcadoresPageUiState } from "@/features/marcadores/page/useMarcadoresPageUiState"
import { buildDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"
import { buildMarcadoresTreeFlatRows } from "@/features/marcadores/utils/buildMarcadoresTreeFlatRows"
import { buildDeskPaneGridItems, filterBookmarksForDeskPane } from "@/features/marcadores/utils/filterBookmarksForDeskPane"
import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"
import { getFolderPath } from "@/features/marcadores/utils/utils"

type DashPick = Pick<DashboardContextType, "setFolders" | "refreshFolders" | "refreshTags">
type Ui = ReturnType<typeof useMarcadoresPageUiState>

export type DesktopPaneDerivedEntry = {
  flatList: GridItem[]
  breadcrumb: { id: string | null; label: string }[]
  filteredBookmarks: Bookmark[]
  treeFlatRows: TreeFlatRow[]
  primaryViewMode: "grid" | "tree"
  focusFlatList: GridItem[]
}

export function useMarcadoresPageBookmarksBootstrap(p: {
  u: Ui
  dash: DashPick
  activeBrowseFolderId: string | null
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  deskUiByWin: Record<string, DeskWindowUiState>
  bookmarkPanelHooks?: {
    setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  }
}) {
  const dataOpts = useMemo(
    () =>
      p.desktopWindowChrome
        ? ({ browseMode: "folder" as const, activeViewAst: null })
        : ({ browseMode: p.u.browseMode, activeViewAst: p.u.activeViewAst }),
    [p.desktopWindowChrome, p.u.activeViewAst, p.u.browseMode]
  )

  const searchForData = p.desktopWindowChrome ? "" : p.u.searchValue

  const data = useMarcadoresData(
    searchForData,
    p.activeBrowseFolderId,
    p.dash.setFolders,
    p.dash.refreshFolders,
    dataOpts
  )

  const desktopPaneDerived = useMemo((): Record<string, DesktopPaneDerivedEntry> | null => {
    if (!p.desktopWindowChrome) return null
    const baseVisible = data.filteredBookmarks
    const m: Record<string, DesktopPaneDerivedEntry> = {}
    for (const id of p.deskLibWinIds) {
      const ui = p.deskUiByWin[id] ?? createDefaultDeskWindowUi()
      const fid = p.deskFolderByWin[id] ?? null
      const filtered = filterBookmarksForDeskPane(baseVisible, ui.searchValue, ui.searchLibraryWide, fid)
      const flatList = buildDeskPaneGridItems(data.folders, filtered, ui.searchValue, ui.searchLibraryWide, fid)
      const globalResultsActive = ui.searchLibraryWide && ui.searchValue.trim() !== ""
      const breadcrumb = getFolderPath(data.folders, fid)
      const treeFlatRows = globalResultsActive
        ? []
        : buildMarcadoresTreeFlatRows(data.folders, filtered, ui.treeCollapsedIds)
      const primaryViewMode: "grid" | "tree" = globalResultsActive ? "grid" : ui.viewMode
      const focusFlatList = primaryViewMode === "tree" ? treeFlatRows.map((r) => r.item) : flatList
      m[id] = { flatList, breadcrumb, filteredBookmarks: filtered, treeFlatRows, primaryViewMode, focusFlatList }
    }
    return m
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

  const duplicateClusterCount = useMemo(() => buildDuplicateClusters(data.bookmarks).length, [data.bookmarks])

  return { ...data, desktopPaneDerived, duplicateClusterCount, ...actions }
}
