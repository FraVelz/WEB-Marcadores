"use client"

import { useMemo } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import { useMarcadoresDeskChrome } from "@/features/marcadores/hooks/useMarcadoresDeskChrome"
import { useMarcadoresTreeDerived } from "@/features/marcadores/hooks/useMarcadoresTreeDerived"
import { useMarcadoresViewMode } from "@/features/marcadores/hooks/useMarcadoresViewMode"
import { useMinWidthMd } from "@/features/marcadores/hooks/useMinWidthMd"

import { useBrowseScope } from "@/features/marcadores/state/browseScope"
import { expandLibraryPaneFields } from "@/features/marcadores/state/libraryPaneUiScope"
import { useResolvedLibraryPaneScope } from "@/features/marcadores/state/useResolvedLibraryPaneScope"
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
  const stackedExplorerHeaderBar = wideViewport && !zonesBoard && marcadoresViewMode === "simple"

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
    globalScope: u.globalScope,
    deskUiByWin,
    updateDeskUi,
    getDeskItemRefs,
    getDeskSearchRef,
  })

  const paneUi = libraryPaneScope.getState()
  const paneFlat = useMemo(() => {
    const s = libraryPaneScope.getState()
    return {
      ...expandLibraryPaneFields(s, libraryPaneScope.bindings),
      itemRefs: libraryPaneScope.itemRefs,
      searchRef: libraryPaneScope.searchRef,
    }
  }, [libraryPaneScope])

  const b = useMarcadoresPageBookmarksBootstrap({
    u,
    dash: { setFolders: setCtxFolders, refreshFolders, refreshTags },
    activeBrowseFolderId: browseScope.folderId,
    desktopWindowChrome,
    deskLibWinIds,
    deskFolderByWin,
    deskUiByWin,
    bookmarkPanelHooks: { setDetailBookmark: libraryPaneScope.bindings.setDetailBookmark },
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

  useMarcadoresWorkspacePrefs(
    desktopWindowChrome ? null : activeWorkspaceId,
    u.browseMode,
    u.activeViewAst,
    u.setBrowseMode,
    u.setActiveViewAst
  )

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
    paneScope: libraryPaneScope,
    flatList,
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
    ...u,
    ...b,
    ...paneFlat,
    libraryPaneScope,
    browseMode: desktopWindowChrome ? "folder" : u.browseMode,
    setBrowseMode: u.setBrowseMode,
    activeViewAst: desktopWindowChrome ? null : u.activeViewAst,
    setActiveViewAst: u.setActiveViewAst,
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
    browseScope,
    activeBrowseFolderId: browseScope.folderId,
    setActiveBrowseFolderId: browseScope.setFolderId,
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
