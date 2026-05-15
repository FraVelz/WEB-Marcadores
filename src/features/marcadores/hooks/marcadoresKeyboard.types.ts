import type { Dispatch, MutableRefObject, SetStateAction } from "react"

import type { Bookmark, BreadcrumbPart, CutItem, FlatFolder, GridItem } from "../utils/types"

export type MarcadoresKeyboardContext = {
  lastKeyRef: MutableRefObject<{ key: string; time: number } | null>
  breadcrumb: BreadcrumbPart[]
  deleteConfirmItem: GridItem | null
  setDeleteConfirmItem: Dispatch<SetStateAction<GridItem | null>>
  onConfirmDelete: (item: GridItem) => void
  flatList: GridItem[]
  selectedIndex: number
  totalCount: number
  gridCols: number
  selectMode: boolean
  selectedFolderId: string | null
  folders: FlatFolder[]
  bookmarks: Bookmark[]
  cutItem: CutItem | null
  setCutItem: Dispatch<SetStateAction<CutItem | null>>
  setPasteError: (v: string | null) => void
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
  setSelectedIndex: Dispatch<SetStateAction<number>>
  setSelectedFolderId: (id: string | null) => void
  setInfoPanelEnabled: Dispatch<SetStateAction<boolean>>
  setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>
  handlePasteFolder: (folderId: string, destParentId: string | null) => Promise<void>
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => Promise<void>
  onAddBookmark: () => void
  onNewFolder: () => void
  onEditItem: (item: GridItem) => void
  openBookmarkTab: (bookmark: Bookmark) => void
}
