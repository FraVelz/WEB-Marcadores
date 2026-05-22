import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { buildMarcadoresTreeFlatRows } from "@/features/marcadores/utils/buildMarcadoresTreeFlatRows"
import {
  buildDeskPaneGridItems,
  filterBookmarksForDeskPane,
} from "@/features/marcadores/utils/filterBookmarksForDeskPane"
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
  const filtered = filterBookmarksForDeskPane(baseVisible, ui.searchValue, ui.searchLibraryWide, winFolderId)
  const flatList = buildDeskPaneGridItems(folders, filtered, ui.searchValue, ui.searchLibraryWide, winFolderId)
  const globalResultsActive = ui.searchLibraryWide && ui.searchValue.trim() !== ""
  const breadcrumb = getFolderPath(folders, winFolderId)
  const treeFlatRows = globalResultsActive ? [] : buildMarcadoresTreeFlatRows(folders, filtered, ui.treeCollapsedIds)
  const primaryViewMode: "grid" | "tree" = globalResultsActive ? "grid" : ui.viewMode
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
