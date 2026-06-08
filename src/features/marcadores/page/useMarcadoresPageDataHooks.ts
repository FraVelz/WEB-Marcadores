"use client"

import { useDashboard } from "@/contexts/DashboardContext"

import { useMarcadoresDeskChrome } from "@/features/marcadores/hooks/useMarcadoresDeskChrome"
import { useMarcadoresTreeDerived } from "@/features/marcadores/hooks/useMarcadoresTreeDerived"
import { useMarcadoresViewMode } from "@/features/marcadores/hooks/useMarcadoresViewMode"
import { useBrowseScope } from "@/features/marcadores/state/browseScope"
import { useResolvedLibraryPaneScope } from "@/features/marcadores/state/useResolvedLibraryPaneScope"
import { useMarcadoresBookmarkRuntime } from "@/features/marcadores/page/useMarcadoresBookmarkRuntime"
import { useMarcadoresPageBookmarksBootstrap } from "@/features/marcadores/page/useMarcadoresPageBookmarksBootstrap"
import { useMarcadoresPageDnDLayer } from "@/features/marcadores/page/useMarcadoresPageDnDLayer"
import { useMarcadoresPageUiState } from "@/features/marcadores/page/useMarcadoresPageUiState"
import { useMatchMediaMd } from "@/lib/hooks/useMatchMediaMd"

export function useMarcadoresPageDataHooks() {
  const { globalScope } = useMarcadoresPageUiState()

  const {
    demoMode,
    selectedFolderId,
    setSelectedFolderId,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    mainRef,
    focusMain,
    editFolderRef,
    registerMarcadoresRuntime,
  } = useDashboard()

  const wideViewport = useMatchMediaMd()
  const { mode: marcadoresViewMode } = useMarcadoresViewMode()
  const desktopWindowChrome = wideViewport && marcadoresViewMode === "escritorio"
  const stackedExplorerHeaderBar = wideViewport && marcadoresViewMode === "simple"

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
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
  } = desk

  const browseScope = useBrowseScope({
    desktopWindowChrome,
    selectedFolderId,
    setSelectedFolderId,
    deskFolderByWin,
    setDeskFolderByWin,
    resolvedDeskLibPaneId,
  })

  const libraryPaneScope = useResolvedLibraryPaneScope({
    desktopWindowChrome,
    resolvedDeskLibPaneId,
    globalScope,
    deskUiByWin,
    updateDeskUi,
    getDeskItemRefs,
    getDeskSearchRef,
  })

  const paneUi = libraryPaneScope.getState()

  const b = useMarcadoresPageBookmarksBootstrap({
    dash: { setFolders: setCtxFolders, refreshFolders, refreshTags },
    activeBrowseFolderId: browseScope.folderId,
    dashboardSelectedFolderId: selectedFolderId,
    setGlobalSelectedFolderId: setSelectedFolderId,
    desktopWindowChrome,
    deskLibWinIds,
    deskFolderByWin,
    setDeskFolderByWin,
    deskUiByWin,
    setDetailBookmark: libraryPaneScope.bindings.setDetailBookmark,
    searchValue: desktopWindowChrome ? "" : paneUi.searchValue,
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
    paneBindings: libraryPaneScope.bindings,
  })

  const {
    treeCollapsedIds,
    treeFlatRows,
    toggleTreeFolderCollapse,
    primaryViewMode: primaryTreeGlobal,
    focusFlatList: focusFlatGlobal,
  } = useMarcadoresTreeDerived({
    folders,
    filteredBookmarks,
    paneScope: libraryPaneScope,
    flatList,
  })

  const derivedFocused =
    desktopWindowChrome && resolvedDeskLibPaneId ? desktopPaneDerived?.[resolvedDeskLibPaneId] : null

  const primaryViewMode = derivedFocused?.primaryViewMode ?? primaryTreeGlobal
  const focusFlatList = derivedFocused?.focusFlatList ?? focusFlatGlobal
  const treeFlatRowsEffective = derivedFocused?.treeFlatRows ?? treeFlatRows

  const interactions = useMarcadoresPageDnDLayer({
    folders,
    bookmarks,
    handlePasteFolder,
    handlePasteLink,
    paneScope: libraryPaneScope,
    openBookmarkTab,
    activeBrowseFolderId: browseScope.folderId,
    navigateFolderId: browseScope.setFolderId,
    setDeskFolderByWin,
    handleCreateFolder,
    handleDeleteFolder,
    handleDelete,
    handleRenameFolder,
    handleModalSubmit,
    handleBookmarkUpdate,
    bookmarksForModal: bookmarks,
  })

  return {
    libraryPaneScope,
    browseScope,
    demoMode,
    selectedFolderId,
    setSelectedFolderId,
    mainRef,
    focusMain,
    editFolderRef,
    allTags,
    marcadoresViewMode,
    desktopWindowChrome,
    stackedExplorerHeaderBar,
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
    onModalSubmit: interactions.onModalSubmit,
    onRenameFolder: interactions.onRenameFolder,
    onCreateFolder: interactions.onCreateFolder,
    onConfirmDelete: interactions.onConfirmDelete,
    onDelete: interactions.onDelete,
    handleAdd: interactions.handleAdd,
    handleEdit: interactions.handleEdit,
    handleDoubleClick: interactions.handleDoubleClick,
    handleDrop: interactions.handleDrop,
    makeDeskPaneDoubleClick: interactions.makeDeskPaneDoubleClick,
    makeDeskPaneDrop: interactions.makeDeskPaneDrop,
    toggleSelect: interactions.toggleSelect,
    handlePasteFolder,
    handlePasteLink,
    onBookmarkUpdate: interactions.onBookmarkUpdate,
  }
}

export type MarcadoresPageCore = ReturnType<typeof useMarcadoresPageDataHooks>
