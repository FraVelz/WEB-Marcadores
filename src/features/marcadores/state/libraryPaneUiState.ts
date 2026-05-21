import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"

/** Estado compartido de un panel de biblioteca (simple o ventana de escritorio). */
export type LibraryPaneUiState = {
  selectedIndex: number
  selectMode: boolean
  selectedIds: Set<string>
  modalOpen: boolean
  editingBookmark: Bookmark | null
  detailBookmark: Bookmark | null
  showSearch: boolean
  infoPanelEnabled: boolean
  gridCols: number
  newFolderName: string
  showNewFolder: boolean
  editingFolder: { id: string; name: string } | null
  renameFolderName: string
  cutItem: CutItem | null
  pasteError: string | null
  deleteConfirmItem: GridItem | null
  searchValue: string
  bookmarkModalNonce: number
  viewMode: "grid" | "tree"
}

/** Campos extra por ventana en modo escritorio. */
export type DeskPaneUiExtras = {
  searchLibraryWide: boolean
  treeCollapsedIds: Set<string>
}

export type DeskLibraryPaneUiState = LibraryPaneUiState & DeskPaneUiExtras

export function createDefaultLibraryPaneUi(): LibraryPaneUiState {
  return {
    selectedIndex: 0,
    selectMode: false,
    selectedIds: new Set(),
    modalOpen: false,
    editingBookmark: null,
    detailBookmark: null,
    showSearch: false,
    infoPanelEnabled: true,
    gridCols: 3,
    newFolderName: "",
    showNewFolder: false,
    editingFolder: null,
    renameFolderName: "",
    cutItem: null,
    pasteError: null,
    deleteConfirmItem: null,
    searchValue: "",
    bookmarkModalNonce: 0,
    viewMode: "grid",
  }
}

export function createDefaultDeskLibraryPaneUi(): DeskLibraryPaneUiState {
  return {
    ...createDefaultLibraryPaneUi(),
    searchLibraryWide: false,
    treeCollapsedIds: new Set(),
  }
}

/** @deprecated Usar `DeskLibraryPaneUiState` */
export type DeskWindowUiState = DeskLibraryPaneUiState

/** @deprecated Usar `createDefaultDeskLibraryPaneUi` */
export { createDefaultDeskLibraryPaneUi as createDefaultDeskWindowUi }
