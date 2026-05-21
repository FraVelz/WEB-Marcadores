"use client"

import { useMemo } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import { useMarcadoresDeskChrome } from "@/features/marcadores/hooks/useMarcadoresDeskChrome"
import { useMarcadoresTreeDerived } from "@/features/marcadores/hooks/useMarcadoresTreeDerived"
import { useMarcadoresViewMode } from "@/features/marcadores/hooks/useMarcadoresViewMode"
import { useMinWidthMd } from "@/features/marcadores/hooks/useMinWidthMd"

import { createDefaultDeskWindowUi } from "@/features/marcadores/page/deskWindowUiState"
import { createDeskUiBindings } from "@/features/marcadores/page/deskUiBindings"
import { useMarcadoresBookmarkRuntime } from "@/features/marcadores/page/useMarcadoresBookmarkRuntime"
import { useMarcadoresPageBookmarksBootstrap } from "@/features/marcadores/page/useMarcadoresPageBookmarksBootstrap"
import { useMarcadoresPageDnDLayer } from "@/features/marcadores/page/useMarcadoresPageDnDLayer"
import { useMarcadoresPageUiState } from "@/features/marcadores/page/useMarcadoresPageUiState"
import { useMarcadoresWorkspacePrefs } from "@/features/marcadores/page/useMarcadoresWorkspacePrefs"
import { isZonesLayout } from "@/features/marcadores/workspaces/workspaceLayout"

export type MarcadoresPageDataBundle = ReturnType<typeof useMarcadoresPageDataHooks>

export function useMarcadoresPageDataHooks() {
  const u = useMarcadoresPageUiState()

  const {
    demoMode,
    selectedFolderId,
    setSelectedFolderId,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    setMainKeyDown,
    focusMain,
    editFolderRef,
    workspaceLayout,
    persistWorkspaceLayout,
    registerMarcadoresRuntime,
    activeWorkspaceId,
  } = useDashboard()

  const wideViewport = useMinWidthMd()
  const { mode: marcadoresViewMode } = useMarcadoresViewMode()
  const zonesBoard = !!(workspaceLayout && isZonesLayout(workspaceLayout))
  const zoneColumns = zonesBoard && workspaceLayout?.template === "zones" ? workspaceLayout.columns : []
  const desktopWindowChrome = wideViewport && !zonesBoard && marcadoresViewMode === "escritorio"

  const desk = useMarcadoresDeskChrome({
    desktopWindowChrome,
    selectedFolderId,
    setSelectedFolderId,
  })

  const {
    deskLibWinIds,
    setDeskLibWinIds,
    deskFolderByWin,
    setDeskFolderByWin,
    deskUiByWin,
    updateDeskUi,
    toggleDeskTreeFolderCollapse,
    getDeskItemRefs,
    getDeskSearchRef,
    resolvedDeskLibPaneId,
    activeBrowseFolderId,
    setActiveBrowseFolderId,
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
  } = desk

  const deskBindings = useMemo(() => {
    if (!desktopWindowChrome || !resolvedDeskLibPaneId) return null
    return createDeskUiBindings(resolvedDeskLibPaneId, updateDeskUi)
  }, [desktopWindowChrome, resolvedDeskLibPaneId, updateDeskUi])

  const b = useMarcadoresPageBookmarksBootstrap({
    u,
    dash: { setFolders: setCtxFolders, refreshFolders, refreshTags },
    activeBrowseFolderId,
    desktopWindowChrome,
    deskLibWinIds,
    deskFolderByWin,
    deskUiByWin,
    bookmarkPanelHooks: deskBindings ? { setDetailBookmark: deskBindings.setDetailBookmark } : undefined,
  })

  const {
    bookmarks,
    folders,
    loading,
    flatList,
    filteredBookmarks,
    breadcrumb,
    libraryMatchesSearch,
    desktopPaneDerived,
    duplicateClusterCount,
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleDeleteFolder,
    handleBookmarkUpdate,
    handlePasteFolder,
    handlePasteLink,
    recordBookmarkOpened,
  } = b

  const deskUiFocused =
    desktopWindowChrome && resolvedDeskLibPaneId
      ? (deskUiByWin[resolvedDeskLibPaneId] ?? createDefaultDeskWindowUi())
      : null

  const deskModalHostWinId = useMemo(() => {
    if (!desktopWindowChrome) return null
    for (const id of deskLibWinIds) {
      if (deskUiByWin[id]?.modalOpen) return id
    }
    return null
  }, [desktopWindowChrome, deskLibWinIds, deskUiByWin])

  const { openBookmarkTab, closeBookmarkDetailPanel } = useMarcadoresBookmarkRuntime({
    bookmarks,
    registerMarcadoresRuntime,
    recordBookmarkOpened,
    setDetailBookmark: deskBindings?.setDetailBookmark ?? u.setDetailBookmark,
    setInfoPanelEnabled: deskBindings?.setInfoPanelEnabled ?? u.setInfoPanelEnabled,
  })

  useMarcadoresWorkspacePrefs(
    desktopWindowChrome ? null : activeWorkspaceId,
    u.browseMode,
    u.activeViewAst,
    u.setBrowseMode,
    u.setActiveViewAst
  )

  const treeItemRefs =
    desktopWindowChrome && resolvedDeskLibPaneId ? getDeskItemRefs(resolvedDeskLibPaneId) : u.itemRefs

  const {
    treeCollapsedIds,
    treeFlatRows,
    toggleTreeFolderCollapse,
    primaryViewMode: primaryTreeGlobal,
    focusFlatList: focusFlatGlobal,
  } = useMarcadoresTreeDerived({
    folders,
    filteredBookmarks,
    browseMode: desktopWindowChrome ? "folder" : u.browseMode,
    zonesBoard,
    viewMode: deskUiFocused?.viewMode ?? u.viewMode,
    setViewMode: deskBindings?.setViewMode ?? u.setViewMode,
    flatList,
    setSelectedIndex: deskBindings?.setSelectedIndex ?? u.setSelectedIndex,
    itemRefs: treeItemRefs,
    searchValue: deskUiFocused?.searchValue ?? u.searchValue,
  })

  const derivedFocused =
    desktopWindowChrome && resolvedDeskLibPaneId ? desktopPaneDerived?.[resolvedDeskLibPaneId] : null

  const primaryViewMode = derivedFocused?.primaryViewMode ?? primaryTreeGlobal
  const focusFlatList = derivedFocused?.focusFlatList ?? focusFlatGlobal
  const treeFlatRowsEffective = derivedFocused?.treeFlatRows ?? treeFlatRows

  const ixDnd = useMarcadoresPageDnDLayer({
    workspaceLayout,
    persistWorkspaceLayout,
    folders,
    bookmarks,
    handlePasteFolder,
    handlePasteLink,
    selectedIds: deskUiFocused?.selectedIds ?? u.selectedIds,
    setSelectedIds: deskBindings?.setSelectedIds ?? u.setSelectedIds,
    setSelectMode: deskBindings?.setSelectMode ?? u.setSelectMode,
    setSelectedIndex: deskBindings?.setSelectedIndex ?? u.setSelectedIndex,
    selectMode: deskUiFocused?.selectMode ?? u.selectMode,
    setPasteError: deskBindings?.setPasteError ?? u.setPasteError,
    openBookmarkTab,
    activeBrowseFolderId,
    navigateFolderId: (id) => {
      if (desktopWindowChrome && resolvedDeskLibPaneId) {
        setDeskFolderByWin((prev) => ({ ...prev, [resolvedDeskLibPaneId]: id }))
        return
      }
      setSelectedFolderId(id)
    },
    setDeskFolderByWin,
    handleCreateFolder,
    handleDeleteFolder,
    handleDelete,
    handleRenameFolder,
    handleModalSubmit,
    handleBookmarkUpdate,
    newFolderName: deskUiFocused?.newFolderName ?? u.newFolderName,
    setNewFolderName: deskBindings?.setNewFolderName ?? u.setNewFolderName,
    setShowNewFolder: deskBindings?.setShowNewFolder ?? u.setShowNewFolder,
    bookmarksForModal: bookmarks,
    setEditingBookmark: deskBindings?.setEditingBookmark ?? u.setEditingBookmark,
    setModalOpen: deskBindings?.setModalOpen ?? u.setModalOpen,
    setBookmarkModalNonce: deskBindings?.setBookmarkModalNonce ?? u.setBookmarkModalNonce,
    editingBookmark: deskUiFocused?.editingBookmark ?? u.editingBookmark,
    detailBookmark: deskUiFocused?.detailBookmark ?? u.detailBookmark,
    editingFolder: deskUiFocused?.editingFolder ?? u.editingFolder,
    renameFolderName: deskUiFocused?.renameFolderName ?? u.renameFolderName,
    setEditingFolder: deskBindings?.setEditingFolder ?? u.setEditingFolder,
    setRenameFolderName: deskBindings?.setRenameFolderName ?? u.setRenameFolderName,
  })

  const effectiveItemRefs =
    desktopWindowChrome && resolvedDeskLibPaneId ? getDeskItemRefs(resolvedDeskLibPaneId) : u.itemRefs

  const effectiveSearchRef =
    desktopWindowChrome && resolvedDeskLibPaneId ? getDeskSearchRef(resolvedDeskLibPaneId) : u.searchRef

  return {
    ...u,
    ...b,
    selectedIndex: deskUiFocused?.selectedIndex ?? u.selectedIndex,
    setSelectedIndex: deskBindings?.setSelectedIndex ?? u.setSelectedIndex,
    selectMode: deskUiFocused?.selectMode ?? u.selectMode,
    setSelectMode: deskBindings?.setSelectMode ?? u.setSelectMode,
    selectedIds: deskUiFocused?.selectedIds ?? u.selectedIds,
    setSelectedIds: deskBindings?.setSelectedIds ?? u.setSelectedIds,
    modalOpen: deskUiFocused?.modalOpen ?? u.modalOpen,
    setModalOpen: deskBindings?.setModalOpen ?? u.setModalOpen,
    editingBookmark: deskUiFocused?.editingBookmark ?? u.editingBookmark,
    setEditingBookmark: deskBindings?.setEditingBookmark ?? u.setEditingBookmark,
    detailBookmark: deskUiFocused?.detailBookmark ?? u.detailBookmark,
    setDetailBookmark: deskBindings?.setDetailBookmark ?? u.setDetailBookmark,
    showSearch: deskUiFocused?.showSearch ?? u.showSearch,
    setShowSearch: deskBindings?.setShowSearch ?? u.setShowSearch,
    infoPanelEnabled: deskUiFocused?.infoPanelEnabled ?? u.infoPanelEnabled,
    setInfoPanelEnabled: deskBindings?.setInfoPanelEnabled ?? u.setInfoPanelEnabled,
    gridCols: deskUiFocused?.gridCols ?? u.gridCols,
    setGridCols: deskBindings?.setGridCols ?? u.setGridCols,
    newFolderName: deskUiFocused?.newFolderName ?? u.newFolderName,
    setNewFolderName: deskBindings?.setNewFolderName ?? u.setNewFolderName,
    showNewFolder: deskUiFocused?.showNewFolder ?? u.showNewFolder,
    setShowNewFolder: deskBindings?.setShowNewFolder ?? u.setShowNewFolder,
    editingFolder: deskUiFocused?.editingFolder ?? u.editingFolder,
    setEditingFolder: deskBindings?.setEditingFolder ?? u.setEditingFolder,
    renameFolderName: deskUiFocused?.renameFolderName ?? u.renameFolderName,
    setRenameFolderName: deskBindings?.setRenameFolderName ?? u.setRenameFolderName,
    cutItem: deskUiFocused?.cutItem ?? u.cutItem,
    setCutItem: deskBindings?.setCutItem ?? u.setCutItem,
    pasteError: deskUiFocused?.pasteError ?? u.pasteError,
    setPasteError: deskBindings?.setPasteError ?? u.setPasteError,
    deleteConfirmItem: deskUiFocused?.deleteConfirmItem ?? u.deleteConfirmItem,
    setDeleteConfirmItem: deskBindings?.setDeleteConfirmItem ?? u.setDeleteConfirmItem,
    searchValue: deskUiFocused?.searchValue ?? u.searchValue,
    setSearchValue: deskBindings?.setSearchValue ?? u.setSearchValue,
    bookmarkModalNonce: deskUiFocused?.bookmarkModalNonce ?? u.bookmarkModalNonce,
    setBookmarkModalNonce: deskBindings?.setBookmarkModalNonce ?? u.setBookmarkModalNonce,
    viewMode: deskUiFocused?.viewMode ?? u.viewMode,
    setViewMode: deskBindings?.setViewMode ?? u.setViewMode,
    browseMode: desktopWindowChrome ? "folder" : u.browseMode,
    setBrowseMode: u.setBrowseMode,
    activeViewAst: desktopWindowChrome ? null : u.activeViewAst,
    setActiveViewAst: u.setActiveViewAst,
    itemRefs: effectiveItemRefs,
    searchRef: effectiveSearchRef,
    demoMode,
    selectedFolderId,
    setSelectedFolderId,
    setMainKeyDown,
    focusMain,
    editFolderRef,
    allTags,
    activeWorkspaceId,
    zonesBoard,
    zoneColumns,
    marcadoresViewMode,
    desktopWindowChrome,
    deskLibWinIds,
    setDeskLibWinIds,
    deskFolderByWin,
    setDeskFolderByWin,
    deskUiByWin,
    updateDeskUi,
    toggleDeskTreeFolderCollapse,
    getDeskItemRefs,
    getDeskSearchRef,
    deskModalHostWinId,
    resolvedDeskLibPaneId,
    activeBrowseFolderId,
    setActiveBrowseFolderId,
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
    bookmarks,
    folders,
    loading,
    flatList,
    filteredBookmarks,
    breadcrumb,
    libraryMatchesSearch,
    desktopPaneDerived,
    duplicateClusterCount,
    openBookmarkTab,
    closeBookmarkDetailPanel,
    recordBookmarkOpened,
    treeCollapsedIds,
    treeFlatRows: treeFlatRowsEffective,
    toggleTreeFolderCollapse,
    primaryViewMode,
    focusFlatList,
    ...ixDnd,
    handlePasteFolder,
    handlePasteLink,
  }
}
