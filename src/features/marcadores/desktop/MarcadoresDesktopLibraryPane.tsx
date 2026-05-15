"use client"

import { useMemo, useRef } from "react"

import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import { MarcadoresExplorerRail } from "@/features/marcadores/components/MarcadoresExplorerRail"
import MarcadoresBrowseControls from "@/features/marcadores/components/MarcadoresBrowseControls"
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import MarcadoresTreeView, { type TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"

import type { Bookmark, CutItem, FlatFolder, GridItem } from "@/features/marcadores/utils/types"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

export type MarcadoresDesktopLibraryPaneProps = {
  paneId: string
  focused: boolean
  /** Ref compartido cuando `focused`; ref local si no (evita pisar índices entre ventanas). */
  parentItemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  onRequestFocusPane: (paneId: string) => void

  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  focusMain?: () => void

  showNewFolder: boolean
  setShowNewFolder: React.Dispatch<React.SetStateAction<boolean>>
  newFolderName: string
  setNewFolderName: (v: string) => void
  editingFolder: { id: string; name: string } | null
  setEditingFolder: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  renameFolderName: string
  setRenameFolderName: (v: string) => void
  onRenameFolder: () => void
  onNavigateUp: () => void
  onAddBookmark: () => void
  onDeleteFocused?: () => void
  onCreateFolder: () => void

  selectMode: boolean
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onEdit: () => void
  onDelete: () => void

  infoPanelEnabled: boolean
  setInfoPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>
  flatList: GridItem[]
  selectedIndex: number
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>

  treeView: boolean
  onToggleTreeView?: () => void
  treeToggleDisabled?: boolean

  browseMode: BrowseMode
  setBrowseMode: React.Dispatch<React.SetStateAction<BrowseMode>>
  activeViewAst: ViewAst | null
  setActiveViewAst: React.Dispatch<React.SetStateAction<ViewAst | null>>
  duplicateClusterCount: number

  breadcrumb: { id: string | null; label: string }[]
  onSelectBreadcrumb: (id: string | null) => void

  primaryViewMode: "grid" | "tree"
  flatListGrid: GridItem[]
  treeFlatRows: TreeFlatRow[]
  folders: FlatFolder[]
  filteredBookmarks: Bookmark[]

  selectedIndexGrid: number
  onSelectIndex: React.Dispatch<React.SetStateAction<number>>
  cutItem: CutItem | null
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop: (sourceItem: GridItem, targetFolderId?: string | null) => void

  onToggleFolderCollapse: (folderId: string) => void
  treeCollapsedIds: Set<string>
  currentLocationLabel: string
  /** En modo escritorio multi-ventana: solo la ventana enfocada enlaza atajos del árbol. */
  registerExplorerFocus?: boolean
}

export function MarcadoresDesktopLibraryPane(props: MarcadoresDesktopLibraryPaneProps) {
  const localRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const gridRefs = props.focused ? props.parentItemRefs : localRefs

  const { paneId, onRequestFocusPane } = props

  const focusHandlers = useMemo(
    () => ({
      onPointerDownCapture: () => onRequestFocusPane(paneId),
      onFocusCapture: () => onRequestFocusPane(paneId),
    }),
    [paneId, onRequestFocusPane]
  )

  const focusFlatList = props.primaryViewMode === "tree" ? props.treeFlatRows.map((r) => r.item) : props.flatListGrid

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none" {...focusHandlers}>
      <MarcadoresToolbar
        showSearch={props.showSearch}
        setShowSearch={props.setShowSearch}
        searchValue={props.searchValue}
        setSearchValue={props.setSearchValue}
        searchRef={props.searchRef}
        focusMain={props.focusMain}
        showNewFolder={props.showNewFolder}
        setShowNewFolder={props.setShowNewFolder}
        newFolderName={props.newFolderName}
        setNewFolderName={props.setNewFolderName}
        editingFolder={props.editingFolder}
        setEditingFolder={props.setEditingFolder}
        renameFolderName={props.renameFolderName}
        setRenameFolderName={props.setRenameFolderName}
        onRenameFolder={props.onRenameFolder}
        onNavigateUp={props.onNavigateUp}
        onAddBookmark={props.onAddBookmark}
        onDeleteFocused={props.onDeleteFocused}
        onCreateFolder={props.onCreateFolder}
        selectMode={props.selectMode}
        setSelectMode={props.setSelectMode}
        selectedIds={props.selectedIds}
        setSelectedIds={props.setSelectedIds}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        infoPanelEnabled={props.infoPanelEnabled}
        setInfoPanelEnabled={props.setInfoPanelEnabled}
        flatList={focusFlatList}
        selectedIndex={props.selectedIndexGrid}
        setDetailBookmark={props.setDetailBookmark}
        treeView={props.treeView}
        onToggleTreeView={props.onToggleTreeView}
        treeToggleDisabled={props.treeToggleDisabled}
      />

      <MarcadoresBrowseControls
        browseMode={props.browseMode}
        setBrowseMode={props.setBrowseMode}
        activeViewAst={props.activeViewAst}
        setActiveViewAst={props.setActiveViewAst}
        duplicateClusterCount={props.duplicateClusterCount}
      />

      <MarcadoresBreadcrumb breadcrumb={props.breadcrumb} onSelect={props.onSelectBreadcrumb} />

      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <MarcadoresExplorerRail registerGlobalExplorerRef={props.registerExplorerFocus ?? true} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {props.primaryViewMode === "grid" ? (
            <BookmarkGrid
              flatList={props.flatListGrid}
              selectedIndex={props.selectedIndexGrid}
              selectMode={props.selectMode}
              selectedIds={props.selectedIds}
              cutItem={props.cutItem}
              onSelectIndex={props.onSelectIndex}
              onToggleSelect={props.onToggleSelect}
              onDoubleClick={props.onDoubleClick}
              onDrop={props.onDrop}
              onAddBookmark={props.onAddBookmark}
              onNewFolder={() => props.setShowNewFolder(true)}
              itemRefs={gridRefs}
            />
          ) : (
            <MarcadoresTreeView
              folders={props.folders}
              bookmarks={props.filteredBookmarks}
              rows={props.treeFlatRows}
              selectedIndex={props.selectedIndexGrid}
              selectMode={props.selectMode}
              selectedIds={props.selectedIds}
              cutItem={props.cutItem}
              onSelectIndex={props.onSelectIndex}
              onToggleSelect={props.onToggleSelect}
              onDoubleClick={props.onDoubleClick}
              onDrop={props.onDrop}
              onToggleFolderCollapse={props.onToggleFolderCollapse}
              collapsedIds={props.treeCollapsedIds}
              onAddBookmark={props.onAddBookmark}
              onNewFolder={() => props.setShowNewFolder(true)}
              itemRefs={gridRefs}
              currentLocationLabel={props.currentLocationLabel}
            />
          )}
        </div>
      </div>

      <MarcadoresFooter flatList={focusFlatList} selectedIndex={props.selectedIndexGrid} />
    </div>
  )
}
