import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"

/** Estado de interfaz propio de cada ventana de biblioteca en el escritorio. */
export type DeskWindowUiState = {
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
  /** Si hay texto en la búsqueda: buscar en toda la biblioteca y mostrar ruta de carpeta; si no, solo la carpeta actual del panel. */
  searchLibraryWide: boolean
  treeCollapsedIds: Set<string>
}

export function createDefaultDeskWindowUi(): DeskWindowUiState {
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
    searchLibraryWide: false,
    treeCollapsedIds: new Set(),
  }
}
