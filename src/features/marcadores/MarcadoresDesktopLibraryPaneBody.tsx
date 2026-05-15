"use client"

import type { Folder } from "@/contexts/DashboardContext"

import { MarcadoresDesktopLibraryPane } from "@/features/marcadores/desktop/MarcadoresDesktopLibraryPane"
import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

type BreadcrumbSeg = { id: string | null; label: string }

type PaneDerived = { flatList: GridItem[]; breadcrumb: BreadcrumbSeg[] } | undefined

export type MarcadoresDesktopLibraryPaneBodyProps = {
  winId: string
  focused: boolean
  desktopPaneDerived: Record<string, { flatList: GridItem[]; breadcrumb: BreadcrumbSeg[] }> | null
  flatListFallback: GridItem[]
  listForDeleteFallback: GridItem[]
  breadcrumbFallback: BreadcrumbSeg[]
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  resolvedDeskLibPaneId: string | null
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  focusDeskLibraryPane: (id: string) => void
  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  searchRef: React.RefObject<HTMLInputElement | null>
  focusMain: () => void
  showNewFolder: boolean
  setShowNewFolder: React.Dispatch<React.SetStateAction<boolean>>
  newFolderName: string
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>
  editingFolder: { id: string; name: string } | null
  setEditingFolder: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  renameFolderName: string
  setRenameFolderName: React.Dispatch<React.SetStateAction<string>>
  onRenameFolder: () => Promise<void>
  handleAdd: () => void
  onCreateFolder: () => Promise<void>
  selectMode: boolean
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  handleEdit: () => void
  onDelete: () => Promise<void>
  infoPanelEnabled: boolean
  setInfoPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>
  selectedIndex: number
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  treeViewGrid: boolean
  treeToggleDisabled: boolean
  toggleTreeMainView: () => void
  browseMode: BrowseMode
  setBrowseMode: React.Dispatch<React.SetStateAction<BrowseMode>>
  activeViewAst: ViewAst | null
  setActiveViewAst: React.Dispatch<React.SetStateAction<ViewAst | null>>
  duplicateClusterCount: number
  primaryViewMode: "grid" | "tree"
  treeFlatRows: TreeFlatRow[]
  folders: Folder[]
  filteredBookmarks: Bookmark[]
  cutItem: CutItem | null
  toggleSelect: (id: string) => void
  makeDeskPaneDoubleClick: (winId: string) => (item: GridItem) => void
  makeDeskPaneDrop: (winId: string, deskMap: Record<string, string | null>) => (s: GridItem, t?: string | null) => void
  toggleTreeFolderCollapse: (folderId: string) => void
  treeCollapsedIds: Set<string>
  setDeleteConfirmItem: React.Dispatch<React.SetStateAction<GridItem | null>>
}

export type MarcadoresDesktopLibraryPaneShareProps = Omit<MarcadoresDesktopLibraryPaneBodyProps, "winId" | "focused">

export function MarcadoresDesktopLibraryPaneBody(props: MarcadoresDesktopLibraryPaneBodyProps) {
  const pane: PaneDerived = props.desktopPaneDerived?.[props.winId]
  const paneFlatList = pane?.flatList ?? props.flatListFallback
  const paneBreadcrumb = pane?.breadcrumb ?? props.breadcrumbFallback
  const paneFolderId = props.deskFolderByWin[props.winId] ?? null
  const setPaneFolder = (id: string | null) => {
    props.setDeskFolderByWin((prev) => ({ ...prev, [props.winId]: id }))
  }
  const listForDelete =
    props.resolvedDeskLibPaneId && props.desktopPaneDerived?.[props.resolvedDeskLibPaneId]
      ? props.desktopPaneDerived[props.resolvedDeskLibPaneId]!.flatList
      : props.listForDeleteFallback

  return (
    <MarcadoresDesktopLibraryPane
      paneId={props.winId}
      focused={props.focused}
      explorerFolderId={paneFolderId}
      setExplorerFolderId={setPaneFolder}
      parentItemRefs={props.itemRefs}
      onRequestFocusPane={props.focusDeskLibraryPane}
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
      onNavigateUp={() => setPaneFolder(null)}
      onAddBookmark={props.handleAdd}
      onDeleteFocused={() => {
        const item = listForDelete[props.selectedIndex]
        if (item) props.setDeleteConfirmItem(item)
      }}
      onCreateFolder={props.onCreateFolder}
      selectMode={props.selectMode}
      setSelectMode={props.setSelectMode}
      selectedIds={props.selectedIds}
      setSelectedIds={props.setSelectedIds}
      onEdit={props.handleEdit}
      onDelete={props.onDelete}
      infoPanelEnabled={props.infoPanelEnabled}
      setInfoPanelEnabled={props.setInfoPanelEnabled}
      flatList={paneFlatList}
      selectedIndex={props.selectedIndex}
      setDetailBookmark={props.setDetailBookmark}
      treeView={props.treeViewGrid}
      onToggleTreeView={props.treeToggleDisabled ? undefined : props.toggleTreeMainView}
      treeToggleDisabled={props.treeToggleDisabled}
      browseMode={props.browseMode}
      setBrowseMode={props.setBrowseMode}
      activeViewAst={props.activeViewAst}
      setActiveViewAst={props.setActiveViewAst}
      duplicateClusterCount={props.duplicateClusterCount}
      breadcrumb={paneBreadcrumb}
      onSelectBreadcrumb={setPaneFolder}
      primaryViewMode={props.primaryViewMode}
      flatListGrid={paneFlatList}
      treeFlatRows={props.treeFlatRows}
      folders={props.folders}
      filteredBookmarks={props.filteredBookmarks}
      selectedIndexGrid={props.selectedIndex}
      onSelectIndex={props.setSelectedIndex}
      cutItem={props.cutItem}
      onToggleSelect={props.toggleSelect}
      onDoubleClick={props.makeDeskPaneDoubleClick(props.winId)}
      onDrop={props.makeDeskPaneDrop(props.winId, props.deskFolderByWin)}
      onToggleFolderCollapse={props.toggleTreeFolderCollapse}
      treeCollapsedIds={props.treeCollapsedIds}
      currentLocationLabel={paneBreadcrumb.map((p) => p.label).join(" › ")}
      registerExplorerFocus={props.focused}
    />
  )
}
