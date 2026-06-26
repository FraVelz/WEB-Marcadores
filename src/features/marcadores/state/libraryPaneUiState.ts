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
  searchInSubfolders: boolean
  searchInDescription: boolean
  bookmarkModalNonce: number
  viewMode: "grid" | "tree"
}

type DeskPaneUiExtras = {
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
    searchInSubfolders: false,
    searchInDescription: true,
    bookmarkModalNonce: 0,
    viewMode: "grid",
  }
}

export function createDefaultDeskLibraryPaneUi(): DeskLibraryPaneUiState {
  return {
    ...createDefaultLibraryPaneUi(),
    treeCollapsedIds: new Set(),
  }
}
