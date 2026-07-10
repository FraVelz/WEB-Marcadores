"use client"

import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import type { LibraryPaneUiScope } from "@/features/marcadores/state/libraryPaneUiScope"
import type { Bookmark } from "@/features/marcadores/utils/types"

export type BookmarkModalController = {
  open: boolean
  editing: Bookmark | null
  nonce: number
  folderId: string | null
  openCreate: () => void
  openEdit: (bookmark: Bookmark) => void
  close: () => void
}

export function useBookmarkModalController(opts: {
  desktopWindowChrome: boolean
  libraryPaneScope: LibraryPaneUiScope
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  activeBrowseFolderId: string | null
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  updateDeskUi: (winId: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void
  focusMain: () => void
}): BookmarkModalController {
  const {
    desktopWindowChrome,
    libraryPaneScope,
    deskLibWinIds,
    deskFolderByWin,
    activeBrowseFolderId,
    deskUiByWin,
    updateDeskUi,
    focusMain,
  } = opts

  const { bindings } = libraryPaneScope

  const hostWinId = (() => {
    if (!desktopWindowChrome) return null
    for (const id of deskLibWinIds) {
      if (deskUiByWin[id]?.modalOpen) return id
    }
    return null
  })()

  const deskUi = hostWinId ? deskUiByWin[hostWinId] : null
  const globalUi = libraryPaneScope.getState()

  const open = desktopWindowChrome ? Boolean(deskUi?.modalOpen) : globalUi.modalOpen
  const editing = desktopWindowChrome ? (deskUi?.editingBookmark ?? null) : globalUi.editingBookmark
  const nonce = desktopWindowChrome ? (deskUi?.bookmarkModalNonce ?? 0) : globalUi.bookmarkModalNonce

  const folderId = desktopWindowChrome && hostWinId ? (deskFolderByWin[hostWinId] ?? null) : activeBrowseFolderId

  const patchDeskModal = (recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => {
    if (!hostWinId) return
    updateDeskUi(hostWinId, recipe)
  }

  const openCreate = () => {
    if (desktopWindowChrome && hostWinId) {
      patchDeskModal((s) => ({
        ...s,
        modalOpen: true,
        editingBookmark: null,
        bookmarkModalNonce: s.bookmarkModalNonce + 1,
      }))
      return
    }
    bindings.setEditingBookmark(null)
    bindings.setBookmarkModalNonce((n) => n + 1)
    bindings.setModalOpen(true)
  }

  const openEdit = (bookmark: Bookmark) => {
    if (desktopWindowChrome && hostWinId) {
      patchDeskModal((s) => ({ ...s, modalOpen: true, editingBookmark: bookmark }))
      return
    }
    bindings.setEditingBookmark(bookmark)
    bindings.setModalOpen(true)
  }

  const close = () => {
    if (desktopWindowChrome && hostWinId) {
      patchDeskModal((s) => ({ ...s, modalOpen: false, editingBookmark: null }))
    } else {
      bindings.setModalOpen(false)
      bindings.setEditingBookmark(null)
    }
    requestAnimationFrame(() => focusMain())
  }

  return {
    open,
    editing,
    nonce,
    folderId,
    openCreate,
    openEdit,
    close,
  }
}
