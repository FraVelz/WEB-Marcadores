"use client"

import { useEffect, useMemo } from "react"

import type { FlatFolder } from "@/features/marcadores/utils/types"

import { MarcadoresDesktopLibraryPane } from "@/features/marcadores/desktop/MarcadoresDesktopLibraryPane"
import {
  createDefaultDeskLibraryPaneUi,
  type DeskLibraryPaneUiState,
} from "@/features/marcadores/state/libraryPaneUiState"
import { createDeskPaneScope, type DeskPaneUiBindings } from "@/features/marcadores/state/libraryPaneUiScope"
import type { DesktopPaneDerivedEntry } from "@/features/marcadores/page/useMarcadoresPageBookmarksBootstrap"
import type { GridItem } from "@/features/marcadores/utils/types"

type BreadcrumbSeg = { id: string | null; label: string }

export type MarcadoresDesktopLibraryPaneBodyProps = {
  winId: string
  focused: boolean
  desktopPaneDerived: Record<string, DesktopPaneDerivedEntry> | null
  flatListFallback: GridItem[]
  listForDeleteFallback: GridItem[]
  breadcrumbFallback: BreadcrumbSeg[]
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  resolvedDeskLibPaneId: string | null
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  updateDeskUi: (winId: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void
  toggleDeskTreeFolderCollapse: (winId: string, folderId: string) => void
  getDeskItemRefs: (winId: string) => React.MutableRefObject<Map<number, HTMLDivElement>>
  getDeskSearchRef: (winId: string) => React.RefObject<HTMLInputElement | null>
  focusDeskLibraryPane: (id: string) => void
  treeToggleDisabledGlobal: boolean
  focusMain: () => void
  onRenameFolder: () => Promise<void>
  handleAdd: () => void
  onCreateFolder: () => Promise<void>
  handleEdit: () => void
  onDelete: () => Promise<void>
  folders: FlatFolder[]
  makeDeskPaneDoubleClick: (winId: string) => (item: GridItem) => void
  makeDeskPaneDrop: (winId: string, deskMap: Record<string, string | null>) => (s: GridItem, t?: string | null) => void
  setDeleteConfirmItem: React.Dispatch<React.SetStateAction<GridItem | null>>
}

export type MarcadoresDesktopLibraryPaneShareProps = Omit<MarcadoresDesktopLibraryPaneBodyProps, "winId" | "focused">

export function MarcadoresDesktopLibraryPaneBody(props: MarcadoresDesktopLibraryPaneBodyProps) {
  const {
    winId,
    focused,
    desktopPaneDerived,
    flatListFallback,
    breadcrumbFallback,
    deskFolderByWin,
    setDeskFolderByWin,
    deskUiByWin,
    updateDeskUi,
    toggleDeskTreeFolderCollapse,
    getDeskItemRefs,
    getDeskSearchRef,
    focusDeskLibraryPane,
    treeToggleDisabledGlobal,
    focusMain,
    onRenameFolder,
    handleAdd,
    onCreateFolder,
    handleEdit,
    onDelete,
    folders,
    makeDeskPaneDoubleClick,
    makeDeskPaneDrop,
    setDeleteConfirmItem,
  } = props

  const pane = desktopPaneDerived?.[winId]
  const ui = deskUiByWin[winId] ?? createDefaultDeskLibraryPaneUi()
  const paneScope = useMemo(
    () => createDeskPaneScope(winId, deskUiByWin, updateDeskUi, getDeskItemRefs, getDeskSearchRef),
    [winId, deskUiByWin, updateDeskUi, getDeskItemRefs, getDeskSearchRef]
  )
  const b = paneScope.bindings as DeskPaneUiBindings

  const paneFlatList = pane?.flatList ?? flatListFallback
  const paneBreadcrumb = pane?.breadcrumb ?? breadcrumbFallback
  const paneFiltered = pane?.filteredBookmarks ?? []
  const paneTreeRows = pane?.treeFlatRows ?? []
  const panePrimaryMode = pane?.primaryViewMode ?? "grid"
  const focusFlatList = pane?.focusFlatList ?? paneFlatList

  const paneFolderId = deskFolderByWin[winId] ?? null
  const setPaneFolder = (id: string | null) => {
    setDeskFolderByWin((prev) => ({ ...prev, [winId]: id }))
  }

  const listForDelete = focusFlatList

  useEffect(() => {
    if (!ui.searchValue.trim()) return
    updateDeskUi(winId, (s) => ({ ...s, treeCollapsedIds: new Set() }))
  }, [ui.searchValue, winId, updateDeskUi])

  useEffect(() => {
    queueMicrotask(() => {
      getDeskItemRefs(winId).current.clear()
      updateDeskUi(winId, (s) => ({ ...s, selectedIndex: 0 }))
    })
  }, [ui.viewMode, winId, getDeskItemRefs, updateDeskUi])

  useEffect(() => {
    if (panePrimaryMode !== "tree") return
    queueMicrotask(() => {
      updateDeskUi(winId, (s) => {
        const max = Math.max(0, paneTreeRows.length - 1)
        return {
          ...s,
          selectedIndex: Math.min(Math.max(0, s.selectedIndex), max),
        }
      })
    })
  }, [panePrimaryMode, paneTreeRows.length, winId, updateDeskUi])

  const globalResultsActive = ui.searchLibraryWide && ui.searchValue.trim() !== ""

  const toggleTreeMainView = () => {
    b.setViewMode((m) => (m === "grid" ? "tree" : "grid"))
  }

  const treeToggleDisabled = treeToggleDisabledGlobal || globalResultsActive

  return (
    <MarcadoresDesktopLibraryPane
      paneId={winId}
      focused={focused}
      explorerFolderId={paneFolderId}
      setExplorerFolderId={setPaneFolder}
      parentItemRefs={getDeskItemRefs(winId)}
      onRequestFocusPane={focusDeskLibraryPane}
      showSearch={ui.showSearch}
      setShowSearch={b.setShowSearch}
      searchValue={ui.searchValue}
      setSearchValue={b.setSearchValue}
      searchRef={getDeskSearchRef(winId)}
      focusMain={focusMain}
      showNewFolder={ui.showNewFolder}
      setShowNewFolder={b.setShowNewFolder}
      newFolderName={ui.newFolderName}
      setNewFolderName={b.setNewFolderName}
      editingFolder={ui.editingFolder}
      setEditingFolder={b.setEditingFolder}
      renameFolderName={ui.renameFolderName}
      setRenameFolderName={b.setRenameFolderName}
      onRenameFolder={onRenameFolder}
      onNavigateUp={() => setPaneFolder(null)}
      onAddBookmark={handleAdd}
      onDeleteFocused={() => {
        const item = listForDelete[ui.selectedIndex]
        if (item) setDeleteConfirmItem(item)
      }}
      onCreateFolder={onCreateFolder}
      selectMode={ui.selectMode}
      setSelectMode={b.setSelectMode}
      selectedIds={ui.selectedIds}
      setSelectedIds={b.setSelectedIds}
      onEdit={handleEdit}
      onDelete={onDelete}
      infoPanelEnabled={ui.infoPanelEnabled}
      setInfoPanelEnabled={b.setInfoPanelEnabled}
      flatList={paneFlatList}
      selectedIndex={ui.selectedIndex}
      setDetailBookmark={b.setDetailBookmark}
      treeView={ui.viewMode === "tree"}
      onToggleTreeView={treeToggleDisabled ? undefined : toggleTreeMainView}
      treeToggleDisabled={treeToggleDisabled}
      searchLibraryWide={ui.searchLibraryWide}
      setSearchLibraryWide={b.setSearchLibraryWide}
      breadcrumb={paneBreadcrumb}
      onSelectBreadcrumb={setPaneFolder}
      primaryViewMode={panePrimaryMode}
      flatListGrid={paneFlatList}
      treeFlatRows={paneTreeRows}
      folders={folders}
      filteredBookmarks={paneFiltered}
      selectedIndexGrid={ui.selectedIndex}
      onSelectIndex={b.setSelectedIndex}
      cutItem={ui.cutItem}
      onToggleSelect={(id) => {
        const toggle = (prev: Set<string>) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        }
        b.setSelectedIds(toggle)
      }}
      onDoubleClick={makeDeskPaneDoubleClick(winId)}
      onDrop={makeDeskPaneDrop(winId, deskFolderByWin)}
      onToggleFolderCollapse={(folderId) => toggleDeskTreeFolderCollapse(winId, folderId)}
      treeCollapsedIds={ui.treeCollapsedIds}
      currentLocationLabel={paneBreadcrumb.map((p) => p.label).join(" › ")}
      registerExplorerFocus={focused}
    />
  )
}
