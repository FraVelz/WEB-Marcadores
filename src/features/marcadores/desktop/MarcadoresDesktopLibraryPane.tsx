"use client"

import { useMemo, useRef } from "react"

import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import { MarcadoresExplorerRail } from "@/features/marcadores/components/MarcadoresExplorerRail"
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import MarcadoresTreeView from "@/features/marcadores/components/MarcadoresTreeView"

import type { MarcadoresDesktopLibraryPaneProps } from "@/features/marcadores/desktop/marcadoresDesktopLibraryPane.props"

export type { MarcadoresDesktopLibraryPaneProps } from "@/features/marcadores/desktop/marcadoresDesktopLibraryPane.props"

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
        searchInSubfolders={props.searchInSubfolders}
        setSearchInSubfolders={props.setSearchInSubfolders}
        searchInDescription={props.searchInDescription}
        setSearchInDescription={props.setSearchInDescription}
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
        showFullscreenToggle={false}
      />

      <MarcadoresBreadcrumb breadcrumb={props.breadcrumb} onSelect={props.onSelectBreadcrumb} />

      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <MarcadoresExplorerRail
          registerGlobalExplorerRef={props.registerExplorerFocus ?? true}
          folderSelection={{ folderId: props.explorerFolderId, onFolderChange: props.setExplorerFolderId }}
        />
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
              setSelectedIds={props.setSelectedIds}
              setSelectMode={props.setSelectMode}
              searchQuery={props.searchValue.trim()}
              searchInDescription={props.searchInDescription}
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
              searchQuery={props.searchValue.trim()}
              searchInDescription={props.searchInDescription}
            />
          )}
        </div>
      </div>

      <MarcadoresFooter flatList={focusFlatList} selectedIndex={props.selectedIndexGrid} />
    </div>
  )
}
