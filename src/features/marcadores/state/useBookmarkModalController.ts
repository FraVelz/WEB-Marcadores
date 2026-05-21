"use client"

import { useCallback, useMemo } from "react"

import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import type { LibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import type { Bookmark } from "@/features/marcadores/utils/types"

type ModalSetters = {
  setModalOpen: (open: boolean) => void
  setEditingBookmark: (b: Bookmark | null) => void
  setBookmarkModalNonce: React.Dispatch<React.SetStateAction<number>>
}

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
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  activeBrowseFolderId: string | null
  globalUi: LibraryPaneUiState
  globalSetters: ModalSetters
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  updateDeskUi: (winId: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void
  focusMain: () => void
}): BookmarkModalController {
  const {
    desktopWindowChrome,
    deskLibWinIds,
    deskFolderByWin,
    activeBrowseFolderId,
    globalUi,
    globalSetters,
    deskUiByWin,
    updateDeskUi,
    focusMain,
  } = opts

  const hostWinId = useMemo(() => {
    if (!desktopWindowChrome) return null
    for (const id of deskLibWinIds) {
      if (deskUiByWin[id]?.modalOpen) return id
    }
    return null
  }, [desktopWindowChrome, deskLibWinIds, deskUiByWin])

  const deskUi = hostWinId ? deskUiByWin[hostWinId] : null

  const open = desktopWindowChrome ? Boolean(deskUi?.modalOpen) : globalUi.modalOpen
  const editing = desktopWindowChrome ? (deskUi?.editingBookmark ?? null) : globalUi.editingBookmark
  const nonce = desktopWindowChrome ? (deskUi?.bookmarkModalNonce ?? 0) : globalUi.bookmarkModalNonce

  const folderId = desktopWindowChrome && hostWinId ? (deskFolderByWin[hostWinId] ?? null) : activeBrowseFolderId

  const patchModal = useCallback(
    (recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => {
      if (!hostWinId) return
      updateDeskUi(hostWinId, recipe)
    },
    [hostWinId, updateDeskUi]
  )

  const openCreate = useCallback(() => {
    if (desktopWindowChrome && hostWinId) {
      patchModal((s) => ({
        ...s,
        modalOpen: true,
        editingBookmark: null,
        bookmarkModalNonce: s.bookmarkModalNonce + 1,
      }))
      return
    }
    globalSetters.setEditingBookmark(null)
    globalSetters.setBookmarkModalNonce((n) => n + 1)
    globalSetters.setModalOpen(true)
  }, [desktopWindowChrome, globalSetters, hostWinId, patchModal])

  const openEdit = useCallback(
    (bookmark: Bookmark) => {
      if (desktopWindowChrome && hostWinId) {
        patchModal((s) => ({ ...s, modalOpen: true, editingBookmark: bookmark }))
        return
      }
      globalSetters.setEditingBookmark(bookmark)
      globalSetters.setModalOpen(true)
    },
    [desktopWindowChrome, globalSetters, hostWinId, patchModal]
  )

  const close = useCallback(() => {
    if (desktopWindowChrome && hostWinId) {
      patchModal((s) => ({ ...s, modalOpen: false, editingBookmark: null }))
    } else {
      globalSetters.setModalOpen(false)
      globalSetters.setEditingBookmark(null)
    }
    requestAnimationFrame(() => focusMain())
  }, [desktopWindowChrome, focusMain, globalSetters, hostWinId, patchModal])

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
