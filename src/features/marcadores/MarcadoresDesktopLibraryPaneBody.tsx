"use client"

import { useEffect, useMemo } from "react"

import type { FlatFolder } from "@/features/marcadores/utils/types"

import { MarcadoresDesktopLibraryPane } from "@/features/marcadores/desktop/MarcadoresDesktopLibraryPane"
import { createDefaultDeskWindowUi, type DeskWindowUiState } from "@/features/marcadores/page/deskWindowUiState"
import { createDeskUiBindings } from "@/features/marcadores/page/deskUiBindings"
import type { DesktopPaneDerivedEntry } from "@/features/marcadores/page/useMarcadoresPageBookmarksBootstrap"
import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"

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
  deskUiByWin: Record<string, DeskWindowUiState>
  updateDeskUi: (winId: string, recipe: (s: DeskWindowUiState) => DeskWindowUiState) => void
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
  const pane = props.desktopPaneDerived?.[props.winId]
  const ui = props.deskUiByWin[props.winId] ?? createDefaultDeskWindowUi()
  const b = useMemo(() => createDeskUiBindings(props.winId, props.updateDeskUi), [props.winId, props.updateDeskUi])

  const paneFlatList = pane?.flatList ?? props.flatListFallback
  const paneBreadcrumb = pane?.breadcrumb ?? props.breadcrumbFallback
  const paneFiltered = pane?.filteredBookmarks ?? []
  const paneTreeRows = pane?.treeFlatRows ?? []
  const panePrimaryMode = pane?.primaryViewMode ?? "grid"
  const focusFlatList = pane?.focusFlatList ?? paneFlatList

  const paneFolderId = props.deskFolderByWin[props.winId] ?? null
  const setPaneFolder = (id: string | null) => {
    props.setDeskFolderByWin((prev) => ({ ...prev, [props.winId]: id }))
  }

  const listForDelete = focusFlatList

  useEffect(() => {
    if (!ui.searchValue.trim()) return
    props.updateDeskUi(props.winId, (s) => ({ ...s, treeCollapsedIds: new Set() }))
  }, [ui.searchValue, props.winId, props.updateDeskUi])

  useEffect(() => {
    queueMicrotask(() => {
      props.getDeskItemRefs(props.winId).current.clear()
      props.updateDeskUi(props.winId, (s) => ({ ...s, selectedIndex: 0 }))
    })
  }, [ui.viewMode, props.winId, props.getDeskItemRefs, props.updateDeskUi])

  useEffect(() => {
    if (panePrimaryMode !== "tree") return
    queueMicrotask(() => {
      props.updateDeskUi(props.winId, (s) => {
        const max = Math.max(0, paneTreeRows.length - 1)
        return {
          ...s,
          selectedIndex: Math.min(Math.max(0, s.selectedIndex), max),
        }
      })
    })
  }, [panePrimaryMode, paneTreeRows.length, props.winId, props.updateDeskUi])

  const globalResultsActive = ui.searchLibraryWide && ui.searchValue.trim() !== ""

  const toggleTreeMainView = () => {
    b.setViewMode((m) => (m === "grid" ? "tree" : "grid"))
  }

  const treeToggleDisabled = props.treeToggleDisabledGlobal || globalResultsActive

  return (
    <MarcadoresDesktopLibraryPane
      paneId={props.winId}
      focused={props.focused}
      explorerFolderId={paneFolderId}
      setExplorerFolderId={setPaneFolder}
      parentItemRefs={props.getDeskItemRefs(props.winId)}
      onRequestFocusPane={props.focusDeskLibraryPane}
      showSearch={ui.showSearch}
      setShowSearch={b.setShowSearch}
      searchValue={ui.searchValue}
      setSearchValue={b.setSearchValue}
      searchRef={props.getDeskSearchRef(props.winId)}
      focusMain={props.focusMain}
      showNewFolder={ui.showNewFolder}
      setShowNewFolder={b.setShowNewFolder}
      newFolderName={ui.newFolderName}
      setNewFolderName={b.setNewFolderName}
      editingFolder={ui.editingFolder}
      setEditingFolder={b.setEditingFolder}
      renameFolderName={ui.renameFolderName}
      setRenameFolderName={b.setRenameFolderName}
      onRenameFolder={props.onRenameFolder}
      onNavigateUp={() => setPaneFolder(null)}
      onAddBookmark={props.handleAdd}
      onDeleteFocused={() => {
        const item = listForDelete[ui.selectedIndex]
        if (item) props.setDeleteConfirmItem(item)
      }}
      onCreateFolder={props.onCreateFolder}
      selectMode={ui.selectMode}
      setSelectMode={b.setSelectMode}
      selectedIds={ui.selectedIds}
      setSelectedIds={b.setSelectedIds}
      onEdit={props.handleEdit}
      onDelete={props.onDelete}
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
      folders={props.folders}
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
      onDoubleClick={props.makeDeskPaneDoubleClick(props.winId)}
      onDrop={props.makeDeskPaneDrop(props.winId, props.deskFolderByWin)}
      onToggleFolderCollapse={(folderId) => props.toggleDeskTreeFolderCollapse(props.winId, folderId)}
      treeCollapsedIds={ui.treeCollapsedIds}
      currentLocationLabel={paneBreadcrumb.map((p) => p.label).join(" › ")}
      registerExplorerFocus={props.focused}
    />
  )
}
