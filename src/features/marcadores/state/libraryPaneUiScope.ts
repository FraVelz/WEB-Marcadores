"use client"

import type { MutableRefObject, RefObject, SetStateAction } from "react"

import {
  createDefaultDeskLibraryPaneUi,
  type DeskLibraryPaneUiState,
  type LibraryPaneUiState,
} from "@/features/marcadores/state/libraryPaneUiState"

type Setter<V> = (action: SetStateAction<V>) => void

export type LibraryPaneUiBindings = {
  setSelectedIndex: Setter<number>
  setSelectMode: Setter<boolean>
  setSelectedIds: Setter<Set<string>>
  setModalOpen: Setter<boolean>
  setEditingBookmark: Setter<LibraryPaneUiState["editingBookmark"]>
  setDetailBookmark: Setter<LibraryPaneUiState["detailBookmark"]>
  setShowSearch: Setter<boolean>
  setInfoPanelEnabled: Setter<boolean>
  setGridCols: Setter<number>
  setNewFolderName: Setter<string>
  setShowNewFolder: Setter<boolean>
  setEditingFolder: Setter<LibraryPaneUiState["editingFolder"]>
  setRenameFolderName: Setter<string>
  setCutItem: Setter<LibraryPaneUiState["cutItem"]>
  setPasteError: Setter<string | null>
  setDeleteConfirmItem: Setter<LibraryPaneUiState["deleteConfirmItem"]>
  setSearchValue: Setter<string>
  setBookmarkModalNonce: Setter<number>
  setViewMode: Setter<"grid" | "tree">
  setSearchLibraryWide?: Setter<boolean>
}

export type LibraryPaneUiScope = {
  getState: () => LibraryPaneUiState
  patch: (recipe: (s: LibraryPaneUiState) => LibraryPaneUiState) => void
  bindings: LibraryPaneUiBindings
  itemRefs: MutableRefObject<Map<number, HTMLDivElement>>
  searchRef: RefObject<HTMLInputElement | null>
}

export function createLibraryPaneBindings(
  patch: <Key extends keyof LibraryPaneUiState>(key: Key, action: SetStateAction<LibraryPaneUiState[Key]>) => void
): LibraryPaneUiBindings {
  return {
    setSelectedIndex: (a) => patch("selectedIndex", a),
    setSelectMode: (a) => patch("selectMode", a),
    setSelectedIds: (a) => patch("selectedIds", a),
    setModalOpen: (a) => patch("modalOpen", a),
    setEditingBookmark: (a) => patch("editingBookmark", a),
    setDetailBookmark: (a) => patch("detailBookmark", a),
    setShowSearch: (a) => patch("showSearch", a),
    setInfoPanelEnabled: (a) => patch("infoPanelEnabled", a),
    setGridCols: (a) => patch("gridCols", a),
    setNewFolderName: (a) => patch("newFolderName", a),
    setShowNewFolder: (a) => patch("showNewFolder", a),
    setEditingFolder: (a) => patch("editingFolder", a),
    setRenameFolderName: (a) => patch("renameFolderName", a),
    setCutItem: (a) => patch("cutItem", a),
    setPasteError: (a) => patch("pasteError", a),
    setDeleteConfirmItem: (a) => patch("deleteConfirmItem", a),
    setSearchValue: (a) => patch("searchValue", a),
    setBookmarkModalNonce: (a) => patch("bookmarkModalNonce", a),
    setViewMode: (a) => patch("viewMode", a),
  }
}

type GlobalPaneHost = {
  getState: () => LibraryPaneUiState
  patchState: (recipe: (s: LibraryPaneUiState) => LibraryPaneUiState) => void
  itemRefs: MutableRefObject<Map<number, HTMLDivElement>>
  searchRef: RefObject<HTMLInputElement | null>
  setters: LibraryPaneUiBindings
}

export function createGlobalPaneScope(host: GlobalPaneHost): LibraryPaneUiScope {
  return {
    getState: host.getState,
    patch: host.patchState,
    bindings: host.setters,
    itemRefs: host.itemRefs,
    searchRef: host.searchRef,
  }
}

export function createDeskPaneScope(
  winId: string,
  deskUiByWin: Record<string, DeskLibraryPaneUiState>,
  updateDeskUi: (id: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void,
  getItemRefs: (id: string) => MutableRefObject<Map<number, HTMLDivElement>>,
  getSearchRef: (id: string) => RefObject<HTMLInputElement | null>
): LibraryPaneUiScope {
  const patch = <Key extends keyof DeskLibraryPaneUiState>(
    key: Key,
    action: SetStateAction<DeskLibraryPaneUiState[Key]>
  ) => {
    updateDeskUi(winId, (s) => {
      const next =
        typeof action === "function"
          ? (action as (x: DeskLibraryPaneUiState[Key]) => DeskLibraryPaneUiState[Key])(s[key])
          : action
      if (Object.is(next, s[key])) return s
      return { ...s, [key]: next }
    })
  }

  const bindings: DeskPaneUiBindings = {
    ...createLibraryPaneBindings(
      patch as <Key extends keyof LibraryPaneUiState>(key: Key, action: SetStateAction<LibraryPaneUiState[Key]>) => void
    ),
    setSearchLibraryWide: (a) => patch("searchLibraryWide", a),
  }

  return {
    getState: () => deskUiByWin[winId] ?? createDefaultDeskLibraryPaneUi(),
    patch: (recipe) => updateDeskUi(winId, recipe as unknown as (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState),
    bindings,
    itemRefs: getItemRefs(winId),
    searchRef: getSearchRef(winId),
  }
}

export type DeskPaneUiBindings = LibraryPaneUiBindings & {
  setSearchLibraryWide: Setter<boolean>
}

/** Setters enlazados a una ventana del escritorio (compat legacy). */
export function createDeskUiBindings(
  winId: string,
  updateDeskUi: (id: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void
): DeskPaneUiBindings {
  const patch = <K extends keyof DeskLibraryPaneUiState>(key: K, action: SetStateAction<DeskLibraryPaneUiState[K]>) => {
    updateDeskUi(winId, (s) => {
      const next =
        typeof action === "function"
          ? (action as (x: DeskLibraryPaneUiState[K]) => DeskLibraryPaneUiState[K])(s[key])
          : action
      if (Object.is(next, s[key])) return s
      return { ...s, [key]: next }
    })
  }

  return {
    ...createLibraryPaneBindings(
      patch as <Key extends keyof LibraryPaneUiState>(key: Key, action: SetStateAction<LibraryPaneUiState[Key]>) => void
    ),
    setSearchLibraryWide: (a) => patch("searchLibraryWide", a),
  }
}

/** Valores + setters del panel (sin refs). */
export function expandLibraryPaneFields(state: LibraryPaneUiState, bindings: LibraryPaneUiBindings) {
  const s = state
  const b = bindings
  return {
    selectedIndex: s.selectedIndex,
    setSelectedIndex: b.setSelectedIndex,
    selectMode: s.selectMode,
    setSelectMode: b.setSelectMode,
    selectedIds: s.selectedIds,
    setSelectedIds: b.setSelectedIds,
    modalOpen: s.modalOpen,
    setModalOpen: b.setModalOpen,
    editingBookmark: s.editingBookmark,
    setEditingBookmark: b.setEditingBookmark,
    detailBookmark: s.detailBookmark,
    setDetailBookmark: b.setDetailBookmark,
    showSearch: s.showSearch,
    setShowSearch: b.setShowSearch,
    infoPanelEnabled: s.infoPanelEnabled,
    setInfoPanelEnabled: b.setInfoPanelEnabled,
    gridCols: s.gridCols,
    setGridCols: b.setGridCols,
    newFolderName: s.newFolderName,
    setNewFolderName: b.setNewFolderName,
    showNewFolder: s.showNewFolder,
    setShowNewFolder: b.setShowNewFolder,
    editingFolder: s.editingFolder,
    setEditingFolder: b.setEditingFolder,
    renameFolderName: s.renameFolderName,
    setRenameFolderName: b.setRenameFolderName,
    cutItem: s.cutItem,
    setCutItem: b.setCutItem,
    pasteError: s.pasteError,
    setPasteError: b.setPasteError,
    deleteConfirmItem: s.deleteConfirmItem,
    setDeleteConfirmItem: b.setDeleteConfirmItem,
    searchValue: s.searchValue,
    setSearchValue: b.setSearchValue,
    bookmarkModalNonce: s.bookmarkModalNonce,
    setBookmarkModalNonce: b.setBookmarkModalNonce,
    viewMode: s.viewMode,
    setViewMode: b.setViewMode,
  }
}

/** Valores + setters + refs del panel para compat con el bundle legacy de la página. */
export function expandLibraryPaneScope(scope: LibraryPaneUiScope) {
  return {
    ...expandLibraryPaneFields(scope.getState(), scope.bindings),
    itemRefs: scope.itemRefs,
    searchRef: scope.searchRef,
  }
}
