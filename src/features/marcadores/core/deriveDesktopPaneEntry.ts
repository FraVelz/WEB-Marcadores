import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { buildMarcadoresTreeFlatRows } from "@/features/marcadores/utils/buildMarcadoresTreeFlatRows"
import {
  buildSearchResultGridItems,
  filterBookmarksBySearch,
  isScopedSearchResultsActive,
} from "@/features/marcadores/utils/bookmarkSearch"
import { deriveBookmarkFields } from "@/features/marcadores/views/bookmarkDerived"
import type { Bookmark, FlatFolder, GridItem } from "@/features/marcadores/utils/types"
import { getFolderPath } from "@/features/marcadores/utils/utils"

export type DesktopPaneDerivedEntry = {
  flatList: GridItem[]
  breadcrumb: { id: string | null; label: string }[]
  filteredBookmarks: Bookmark[]
  treeFlatRows: TreeFlatRow[]
  primaryViewMode: "grid" | "tree"
  focusFlatList: GridItem[]
}

function deriveDesktopPaneEntry(
  folders: FlatFolder[],
  baseVisible: Bookmark[],
  winFolderId: string | null,
  ui: DeskLibraryPaneUiState
): DesktopPaneDerivedEntry {
  const derivedRows = baseVisible.map((b) => ({ b, d: deriveBookmarkFields(b) }))
  const searchOpts = {
    query: ui.searchValue,
    folderId: winFolderId,
    folders,
    searchInSubfolders: ui.searchInSubfolders,
    searchInDescription: ui.searchInDescription,
  }

  const filtered = filterBookmarksBySearch(baseVisible, derivedRows, searchOpts)
  const flatList = buildSearchResultGridItems(folders, filtered, searchOpts)
  const scopedSearchActive = isScopedSearchResultsActive(searchOpts)
  const breadcrumb = getFolderPath(folders, winFolderId)
  const treeFlatRows = scopedSearchActive ? [] : buildMarcadoresTreeFlatRows(folders, filtered, ui.treeCollapsedIds)
  const primaryViewMode: "grid" | "tree" = scopedSearchActive ? "grid" : ui.viewMode
  const focusFlatList = primaryViewMode === "tree" ? treeFlatRows.map((r) => r.item) : flatList

  return {
    flatList,
    breadcrumb,
    filteredBookmarks: filtered,
    treeFlatRows,
    primaryViewMode,
    focusFlatList,
  }
}

export function deriveAllDesktopPanes(
  folders: FlatFolder[],
  baseVisible: Bookmark[],
  deskLibWinIds: string[],
  deskFolderByWin: Record<string, string | null>,
  deskUiByWin: Record<string, DeskLibraryPaneUiState>,
  defaultUi: () => DeskLibraryPaneUiState
): Record<string, DesktopPaneDerivedEntry> {
  const m: Record<string, DesktopPaneDerivedEntry> = {}
  for (const id of deskLibWinIds) {
    const ui = deskUiByWin[id] ?? defaultUi()
    const fid = deskFolderByWin[id] ?? null
    m[id] = deriveDesktopPaneEntry(folders, baseVisible, fid, ui)
  }
  return m
}
