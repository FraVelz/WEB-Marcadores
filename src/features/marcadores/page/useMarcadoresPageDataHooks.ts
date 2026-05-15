"use client"

import { useDashboard } from "@/contexts/DashboardContext"

import { useMarcadoresDeskChrome } from "@/features/marcadores/hooks/useMarcadoresDeskChrome"
import { useMarcadoresTreeDerived } from "@/features/marcadores/hooks/useMarcadoresTreeDerived"
import { useMinWidthMd } from "@/features/marcadores/hooks/useMinWidthMd"

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
  const zonesBoard = !!(workspaceLayout && isZonesLayout(workspaceLayout))
  const zoneColumns = zonesBoard && workspaceLayout?.template === "zones" ? workspaceLayout.columns : []
  const desktopWindowChrome = wideViewport && !zonesBoard

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
    resolvedDeskLibPaneId,
    activeBrowseFolderId,
    setActiveBrowseFolderId,
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
  } = desk

  const b = useMarcadoresPageBookmarksBootstrap({
    u,
    dash: { setFolders: setCtxFolders, refreshFolders, refreshTags },
    activeBrowseFolderId,
    desktopWindowChrome,
    deskLibWinIds,
    deskFolderByWin,
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

  const { openBookmarkTab, closeBookmarkDetailPanel } = useMarcadoresBookmarkRuntime({
    bookmarks,
    registerMarcadoresRuntime,
    recordBookmarkOpened,
    setDetailBookmark: u.setDetailBookmark,
    setInfoPanelEnabled: u.setInfoPanelEnabled,
  })

  useMarcadoresWorkspacePrefs(activeWorkspaceId, u.browseMode, u.activeViewAst, u.setBrowseMode, u.setActiveViewAst)

  const { treeCollapsedIds, treeFlatRows, toggleTreeFolderCollapse, primaryViewMode, focusFlatList } =
    useMarcadoresTreeDerived({
      folders,
      filteredBookmarks,
      browseMode: u.browseMode,
      zonesBoard,
      viewMode: u.viewMode,
      setViewMode: u.setViewMode,
      flatList,
      setSelectedIndex: u.setSelectedIndex,
      itemRefs: u.itemRefs,
      searchValue: u.searchValue,
    })

  const ixDnd = useMarcadoresPageDnDLayer({
    workspaceLayout,
    persistWorkspaceLayout,
    folders,
    bookmarks,
    handlePasteFolder,
    handlePasteLink,
    selectedIds: u.selectedIds,
    setSelectedIds: u.setSelectedIds,
    setSelectMode: u.setSelectMode,
    setSelectedIndex: u.setSelectedIndex,
    selectMode: u.selectMode,
    setPasteError: u.setPasteError,
    openBookmarkTab,
    activeBrowseFolderId,
    navigateFolderId: (id) => setSelectedFolderId(id),
    setDeskFolderByWin,
    handleCreateFolder,
    handleDeleteFolder,
    handleDelete,
    handleRenameFolder,
    handleModalSubmit,
    handleBookmarkUpdate,
    newFolderName: u.newFolderName,
    setNewFolderName: u.setNewFolderName,
    setShowNewFolder: u.setShowNewFolder,
    bookmarksForModal: bookmarks,
    setEditingBookmark: u.setEditingBookmark,
    setModalOpen: u.setModalOpen,
    setBookmarkModalNonce: u.setBookmarkModalNonce,
    editingBookmark: u.editingBookmark,
    detailBookmark: u.detailBookmark,
    editingFolder: u.editingFolder,
    renameFolderName: u.renameFolderName,
    setEditingFolder: u.setEditingFolder,
    setRenameFolderName: u.setRenameFolderName,
  })

  return {
    ...u,
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
    desktopWindowChrome,
    deskLibWinIds,
    setDeskLibWinIds,
    deskFolderByWin,
    setDeskFolderByWin,
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
    treeFlatRows,
    toggleTreeFolderCollapse,
    primaryViewMode,
    focusFlatList,
    ...ixDnd,
    handlePasteFolder,
    handlePasteLink,
  }
}
