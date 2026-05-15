import type { MutableRefObject, Dispatch, SetStateAction, RefObject } from "react"

import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"
import type { TreeFlatRow } from "@/features/marcadores/components/marcadoresTree/treeTypes"
import type { Bookmark, CutItem, FlatFolder, GridItem } from "@/features/marcadores/utils/types"

export type MarcadoresDesktopLibraryPaneProps = {
  paneId: string
  focused: boolean
  /** Ref compartido cuando `focused`; ref local si no (evita pisar índices entre ventanas). */
  parentItemRefs: MutableRefObject<Map<number, HTMLDivElement>>
  onRequestFocusPane: (paneId: string) => void

  showSearch: boolean
  setShowSearch: Dispatch<SetStateAction<boolean>>
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: RefObject<HTMLInputElement | null>
  focusMain?: () => void

  showNewFolder: boolean
  setShowNewFolder: Dispatch<SetStateAction<boolean>>
  newFolderName: string
  setNewFolderName: (v: string) => void
  editingFolder: { id: string; name: string } | null
  setEditingFolder: Dispatch<SetStateAction<{ id: string; name: string } | null>>
  renameFolderName: string
  setRenameFolderName: (v: string) => void
  onRenameFolder: () => void
  onNavigateUp: () => void
  onAddBookmark: () => void
  onDeleteFocused?: () => void
  onCreateFolder: () => void

  selectMode: boolean
  setSelectMode: Dispatch<SetStateAction<boolean>>
  selectedIds: Set<string>
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
  onEdit: () => void
  onDelete: () => void

  infoPanelEnabled: boolean
  setInfoPanelEnabled: Dispatch<SetStateAction<boolean>>
  flatList: GridItem[]
  selectedIndex: number
  setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>

  treeView: boolean
  onToggleTreeView?: () => void
  treeToggleDisabled?: boolean

  browseMode: BrowseMode
  setBrowseMode: Dispatch<SetStateAction<BrowseMode>>
  activeViewAst: ViewAst | null
  setActiveViewAst: Dispatch<SetStateAction<ViewAst | null>>
  duplicateClusterCount: number

  breadcrumb: { id: string | null; label: string }[]
  onSelectBreadcrumb: (id: string | null) => void

  primaryViewMode: "grid" | "tree"
  flatListGrid: GridItem[]
  treeFlatRows: TreeFlatRow[]
  folders: FlatFolder[]
  filteredBookmarks: Bookmark[]

  selectedIndexGrid: number
  onSelectIndex: Dispatch<SetStateAction<number>>
  cutItem: CutItem | null
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop: (sourceItem: GridItem, targetFolderId?: string | null) => void

  onToggleFolderCollapse: (folderId: string) => void
  treeCollapsedIds: Set<string>
  currentLocationLabel: string
  /** En modo escritorio multi-ventana: solo la ventana enfocada enlaza atajos del árbol. */
  registerExplorerFocus?: boolean
  explorerFolderId: string | null
  setExplorerFolderId: (id: string | null) => void
}
