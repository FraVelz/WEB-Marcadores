"use client"

import type { SetStateAction } from "react"

import type { DeskWindowUiState } from "@/features/marcadores/page/deskWindowUiState"

type Setter<V> = (action: SetStateAction<V>) => void

/** Setters React-like enlazados a una ventana del escritorio. */
export function createDeskUiBindings(
  winId: string,
  updateDeskUi: (id: string, recipe: (s: DeskWindowUiState) => DeskWindowUiState) => void
): {
  setSelectedIndex: Setter<number>
  setSelectMode: Setter<boolean>
  setSelectedIds: Setter<Set<string>>
  setModalOpen: Setter<boolean>
  setEditingBookmark: Setter<DeskWindowUiState["editingBookmark"]>
  setDetailBookmark: Setter<DeskWindowUiState["detailBookmark"]>
  setShowSearch: Setter<boolean>
  setInfoPanelEnabled: Setter<boolean>
  setGridCols: Setter<number>
  setNewFolderName: Setter<string>
  setShowNewFolder: Setter<boolean>
  setEditingFolder: Setter<DeskWindowUiState["editingFolder"]>
  setRenameFolderName: Setter<string>
  setCutItem: Setter<DeskWindowUiState["cutItem"]>
  setPasteError: Setter<string | null>
  setDeleteConfirmItem: Setter<DeskWindowUiState["deleteConfirmItem"]>
  setSearchValue: Setter<string>
  setBookmarkModalNonce: Setter<number>
  setViewMode: Setter<"grid" | "tree">
  setSearchLibraryWide: Setter<boolean>
} {
  const patch = <K extends keyof DeskWindowUiState>(key: K, action: SetStateAction<DeskWindowUiState[K]>) => {
    updateDeskUi(winId, (s) => {
      const next =
        typeof action === "function"
          ? (action as (x: DeskWindowUiState[K]) => DeskWindowUiState[K])(s[key])
          : action
      if (Object.is(next, s[key])) return s
      return { ...s, [key]: next }
    })
  }

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
    setSearchLibraryWide: (a) => patch("searchLibraryWide", a),
  }
}
