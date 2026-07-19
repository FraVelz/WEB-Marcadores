"use client"

import type { MutableRefObject, RefObject, SetStateAction } from "react"

import {
  createDefaultDeskLibraryPaneUi,
  type BookmarkSortOrder,
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
  setDeleteConfirmItem: Setter<LibraryPaneUiState["deleteConfirmItem"]>
  setSearchValue: Setter<string>
  setSearchInSubfolders: Setter<boolean>
  setSearchInDescription: Setter<boolean>
  setBookmarkSort: Setter<BookmarkSortOrder>
  setBookmarkModalNonce: Setter<number>
  setViewMode: Setter<"grid" | "tree">
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
    setDeleteConfirmItem: (a) => patch("deleteConfirmItem", a),
    setSearchValue: (a) => patch("searchValue", a),
    setSearchInSubfolders: (a) => patch("searchInSubfolders", a),
    setSearchInDescription: (a) => patch("searchInDescription", a),
    setBookmarkSort: (a) => patch("bookmarkSort", a),
    setBookmarkModalNonce: (a) => patch("bookmarkModalNonce", a),
    setViewMode: (a) => patch("viewMode", a),
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

  const bindings = createLibraryPaneBindings(
    patch as <Key extends keyof LibraryPaneUiState>(key: Key, action: SetStateAction<LibraryPaneUiState[Key]>) => void
  )

  return {
    getState: () => deskUiByWin[winId] ?? createDefaultDeskLibraryPaneUi(),
    patch: (recipe) => updateDeskUi(winId, recipe as unknown as (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState),
    bindings,
    itemRefs: getItemRefs(winId),
    searchRef: getSearchRef(winId),
  }
}

export type DeskPaneUiBindings = LibraryPaneUiBindings
