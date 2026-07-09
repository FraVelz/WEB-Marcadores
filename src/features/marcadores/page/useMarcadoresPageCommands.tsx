"use client"

import { useEffect, type ReactNode } from "react"

import { MarcadoresDesktopFloatingOverlays } from "@/features/marcadores/page/MarcadoresDesktopFloatingOverlays"
import type { MarcadoresDesktopLibraryPaneBodyProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import { useMarcadoresEffects } from "@/features/marcadores/hooks/useMarcadoresEffects"
import { useMarcadoresMainHotkeys } from "@/features/marcadores/hooks/useMarcadoresMainHotkeys"
import type { MarcadoresPageCore } from "@/features/marcadores/page/useMarcadoresPageDataHooks"

type PaneBodyExtras = Omit<
  MarcadoresDesktopLibraryPaneBodyProps,
  "winId" | "focused" | "desktopPaneDerived" | "flatListFallback" | "listForDeleteFallback" | "breadcrumbFallback"
>

export function useMarcadoresPageCommands(core: MarcadoresPageCore) {
  const scope = core.libraryPaneScope
  const pane = scope.getState()
  const b = scope.bindings

  useMarcadoresMainHotkeys({
    mainRef: core.mainRef,
    enabled: !pane.modalOpen,
    breadcrumb: core.breadcrumb,
    deleteConfirmItem: pane.deleteConfirmItem,
    setDeleteConfirmItem: b.setDeleteConfirmItem,
    onConfirmDelete: core.onConfirmDelete,
    flatList: core.focusFlatList,
    selectedIndex: pane.selectedIndex,
    totalCount: core.focusFlatList.length,
    gridCols: core.primaryViewMode === "tree" ? 1 : pane.gridCols,
    selectMode: pane.selectMode,
    selectedFolderId: core.browseScope.folderId,
    folders: core.folders,
    bookmarks: core.bookmarks,
    cutItem: pane.cutItem,
    setCutItem: b.setCutItem,
    setPasteError: b.setPasteError,
    setSelectedIds: b.setSelectedIds,
    setSelectedIndex: b.setSelectedIndex,
    setSelectedFolderId: core.browseScope.setFolderId,
    setInfoPanelEnabled: b.setInfoPanelEnabled,
    setDetailBookmark: b.setDetailBookmark,
    handlePasteFolder: core.handlePasteFolder,
    handlePasteLink: core.handlePasteLink,
    onAddBookmark: core.handleAdd,
    onNewFolder: () => b.setShowNewFolder(true),
    onEditItem: (item) => {
      if (item.type === "link") {
        b.setEditingBookmark(item.bookmark)
        b.setModalOpen(true)
      } else {
        b.setEditingFolder({ id: item.id, name: item.label })
        b.setRenameFolderName(item.label)
      }
    },
    openBookmarkTab: core.openBookmarkTab,
  })

  const { editFolderRef } = core

  useEffect(() => {
    editFolderRef.current = (id: string, name: string) => {
      b.setEditingFolder({ id, name })
      b.setRenameFolderName(name)
    }
    return () => {
      editFolderRef.current = null
    }
  }, [b, editFolderRef])

  useMarcadoresEffects({
    searchValue: pane.searchValue,
    selectedFolderId: core.browseScope.folderId,
    selectedIndex: pane.selectedIndex,
    flatList: core.focusFlatList,
    infoPanelEnabled: pane.infoPanelEnabled,
    pasteError: pane.pasteError,
    setSelectedIndex: b.setSelectedIndex,
    setGridCols: b.setGridCols,
    setDetailBookmark: b.setDetailBookmark,
    setPasteError: b.setPasteError,
    setShowSearch: b.setShowSearch,
    itemRefs: scope.itemRefs,
    searchRef: scope.searchRef,
  })

  const treeToggleDisabled = pane.searchValue.trim() !== "" && pane.searchInSubfolders

  const toggleTreeMainView = () => {
    b.setViewMode((m) => (m === "grid" ? "tree" : "grid"))
  }

  const desktopFloatingOverlays: ReactNode = core.desktopWindowChrome ? (
    <MarcadoresDesktopFloatingOverlays demoMode={core.demoMode} pasteError={pane.pasteError} />
  ) : null

  const paneBody: PaneBodyExtras = {
    deskFolderByWin: core.deskFolderByWin,
    setDeskFolderByWin: core.setDeskFolderByWin,
    resolvedDeskLibPaneId: core.resolvedDeskLibPaneId,
    deskUiByWin: core.deskUiByWin,
    updateDeskUi: core.updateDeskUi,
    toggleDeskTreeFolderCollapse: core.toggleDeskTreeFolderCollapse,
    getDeskItemRefs: core.getDeskItemRefs,
    getDeskSearchRef: core.getDeskSearchRef,
    focusDeskLibraryPane: core.focusDeskLibraryPane,
    treeToggleDisabledGlobal: false,
    focusMain: core.focusMain,
    onRenameFolder: core.onRenameFolder,
    handleAdd: core.handleAdd,
    onCreateFolder: core.onCreateFolder,
    handleEdit: core.handleEdit,
    onDelete: core.onDelete,
    folders: core.folders,
    makeDeskPaneDoubleClick: core.makeDeskPaneDoubleClick,
    makeDeskPaneDrop: core.makeDeskPaneDrop,
    setDeleteConfirmItem: b.setDeleteConfirmItem,
  }

  return { treeToggleDisabled, toggleTreeMainView, desktopFloatingOverlays, paneBody }
}
