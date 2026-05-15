"use client"

import { useCallback, useEffect, type KeyboardEvent, type ReactNode } from "react"

import { MarcadoresDesktopFloatingOverlays } from "@/features/marcadores/page/MarcadoresDesktopFloatingOverlays"
import type { MarcadoresDesktopLibraryPaneBodyProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"

import { useMarcadoresEffects } from "@/features/marcadores/hooks/useMarcadoresEffects"
import { useMarcadoresKeyboard } from "@/features/marcadores/hooks/useMarcadoresKeyboard"

import type { MarcadoresPageDataBundle } from "./useMarcadoresPageDataHooks"

type PaneBodyExtras = Omit<
  MarcadoresDesktopLibraryPaneBodyProps,
  "winId" | "focused" | "desktopPaneDerived" | "flatListFallback" | "listForDeleteFallback" | "breadcrumbFallback"
>

export function useMarcadoresPageCommandHooks(d: MarcadoresPageDataBundle): {
  treeToggleDisabled: boolean
  toggleTreeMainView: () => void
  desktopFloatingOverlays: ReactNode
  paneBody: PaneBodyExtras
} {
  const handleKeyDown = useMarcadoresKeyboard({
    breadcrumb: d.breadcrumb,
    deleteConfirmItem: d.deleteConfirmItem,
    setDeleteConfirmItem: d.setDeleteConfirmItem,
    onConfirmDelete: d.onConfirmDelete,
    flatList: d.focusFlatList,
    selectedIndex: d.selectedIndex,
    totalCount: d.focusFlatList.length,
    gridCols: d.primaryViewMode === "tree" ? 1 : d.gridCols,
    selectMode: d.selectMode,
    selectedFolderId: d.activeBrowseFolderId,
    folders: d.folders,
    bookmarks: d.bookmarks,
    cutItem: d.cutItem,
    setCutItem: d.setCutItem,
    setPasteError: d.setPasteError,
    setSelectedIds: d.setSelectedIds,
    setSelectedIndex: d.setSelectedIndex,
    setSelectedFolderId: d.setActiveBrowseFolderId,
    setInfoPanelEnabled: d.setInfoPanelEnabled,
    setDetailBookmark: d.setDetailBookmark,
    handlePasteFolder: d.handlePasteFolder,
    handlePasteLink: d.handlePasteLink,
    onAddBookmark: d.handleAdd,
    onNewFolder: () => d.setShowNewFolder(true),
    onEditItem: (item) => {
      if (item.type === "link") {
        d.setEditingBookmark(item.bookmark)
        d.setModalOpen(true)
      } else {
        d.setEditingFolder({ id: item.id, name: item.label })
        d.setRenameFolderName(item.label)
      }
    },
    openBookmarkTab: d.openBookmarkTab,
  })

  const { editFolderRef, setEditingFolder, setRenameFolderName } = d

  useEffect(() => {
    editFolderRef.current = (id: string, name: string) => {
      setEditingFolder({ id, name })
      setRenameFolderName(name)
    }
    return () => {
      editFolderRef.current = null
    }
  }, [editFolderRef, setEditingFolder, setRenameFolderName])

  const noopKeyboardHandler = useCallback((e: KeyboardEvent) => {
    void e
  }, [])

  const effectiveKeyDown = d.zonesBoard ? noopKeyboardHandler : handleKeyDown

  useMarcadoresEffects({
    searchValue: d.searchValue,
    selectedFolderId: d.activeBrowseFolderId,
    selectedIndex: d.selectedIndex,
    flatList: d.focusFlatList,
    infoPanelEnabled: d.infoPanelEnabled,
    modalOpen: d.modalOpen,
    pasteError: d.pasteError,
    setSelectedIndex: d.setSelectedIndex,
    setGridCols: d.setGridCols,
    setDetailBookmark: d.setDetailBookmark,
    setPasteError: d.setPasteError,
    setShowSearch: d.setShowSearch,
    setMainKeyDown: d.setMainKeyDown,
    handleKeyDown: effectiveKeyDown,
    itemRefs: d.itemRefs,
    searchRef: d.searchRef,
  })

  const treeToggleDisabled = d.zonesBoard || d.browseMode !== "folder"
  const toggleTreeMainView = () => {
    d.setViewMode((m) => (m === "grid" ? "tree" : "grid"))
  }

  const desktopFloatingOverlays = d.desktopWindowChrome ? (
    <MarcadoresDesktopFloatingOverlays
      demoMode={d.demoMode}
      pasteError={d.pasteError}
      deleteConfirmItem={d.deleteConfirmItem}
      onConfirmDelete={d.onConfirmDelete}
      onCancelDelete={() => d.setDeleteConfirmItem(null)}
    />
  ) : null

  const paneBody: PaneBodyExtras = {
    deskFolderByWin: d.deskFolderByWin,
    setDeskFolderByWin: d.setDeskFolderByWin,
    resolvedDeskLibPaneId: d.resolvedDeskLibPaneId,
    itemRefs: d.itemRefs,
    focusDeskLibraryPane: d.focusDeskLibraryPane,
    showSearch: d.showSearch,
    setShowSearch: d.setShowSearch,
    searchValue: d.searchValue,
    setSearchValue: d.setSearchValue,
    searchRef: d.searchRef,
    focusMain: d.focusMain,
    showNewFolder: d.showNewFolder,
    setShowNewFolder: d.setShowNewFolder,
    newFolderName: d.newFolderName,
    setNewFolderName: d.setNewFolderName,
    editingFolder: d.editingFolder,
    setEditingFolder: d.setEditingFolder,
    renameFolderName: d.renameFolderName,
    setRenameFolderName: d.setRenameFolderName,
    onRenameFolder: d.onRenameFolder,
    handleAdd: d.handleAdd,
    onCreateFolder: d.onCreateFolder,
    selectMode: d.selectMode,
    setSelectMode: d.setSelectMode,
    selectedIds: d.selectedIds,
    setSelectedIds: d.setSelectedIds,
    handleEdit: d.handleEdit,
    onDelete: d.onDelete,
    infoPanelEnabled: d.infoPanelEnabled,
    setInfoPanelEnabled: d.setInfoPanelEnabled,
    selectedIndex: d.selectedIndex,
    setSelectedIndex: d.setSelectedIndex,
    setDetailBookmark: d.setDetailBookmark,
    treeViewGrid: d.viewMode === "tree",
    treeToggleDisabled,
    toggleTreeMainView,
    browseMode: d.browseMode,
    setBrowseMode: d.setBrowseMode,
    activeViewAst: d.activeViewAst,
    setActiveViewAst: d.setActiveViewAst,
    duplicateClusterCount: d.duplicateClusterCount,
    primaryViewMode: d.primaryViewMode,
    treeFlatRows: d.treeFlatRows,
    folders: d.folders,
    filteredBookmarks: d.filteredBookmarks,
    cutItem: d.cutItem,
    toggleSelect: d.toggleSelect,
    makeDeskPaneDoubleClick: d.makeDeskPaneDoubleClick,
    makeDeskPaneDrop: d.makeDeskPaneDrop,
    toggleTreeFolderCollapse: d.toggleTreeFolderCollapse,
    treeCollapsedIds: d.treeCollapsedIds,
    setDeleteConfirmItem: d.setDeleteConfirmItem,
  }

  return { treeToggleDisabled, toggleTreeMainView, desktopFloatingOverlays, paneBody }
}
