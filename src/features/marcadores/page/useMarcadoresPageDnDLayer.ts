"use client"

import { useCallback } from "react"

import type { BookmarkFormData } from "@/features/marcadores/components/bookmark/BookmarkModal"

import type { Folder } from "@/contexts/DashboardContext"

import { useMarcadoresDropHandlers } from "@/features/marcadores/hooks/useMarcadoresDropHandlers"
import { useMarcadoresPageInteractions } from "@/features/marcadores/hooks/useMarcadoresPageInteractions"
import type { LibraryPaneUiScope } from "@/features/marcadores/state/libraryPaneUiScope"
import type { Bookmark } from "@/features/marcadores/utils/types"

/** Interacciones de página + DnD, una vez cargados datos y vistas derivadas del árbol. */
export function useMarcadoresPageDnDLayer(p: {
  folders: Folder[]
  bookmarks: Bookmark[]
  handlePasteFolder: (folderId: string, destParentId: string | null) => void
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => void
  paneScope: LibraryPaneUiScope
  openBookmarkTab: (b: Bookmark) => void
  activeBrowseFolderId: string | null
  navigateFolderId: (id: string) => void
  setDeskFolderByWin: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  handleCreateFolder: (name: string) => Promise<void>
  handleDeleteFolder: (id: string) => Promise<void>
  handleDelete: (
    ids: Set<string>,
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>,
    setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>
  handleRenameFolder: (id: string, name: string) => Promise<void>
  handleModalSubmit: (data: BookmarkFormData, editingBookmark: Bookmark | null) => Promise<void>
  handleBookmarkUpdate: (id: string, updates: Partial<Bookmark>, detailBookmark: Bookmark | null) => Promise<void>
  bookmarksForModal: Bookmark[]
}) {
  const ui = p.paneScope.getState()
  const b = p.paneScope.bindings

  const ix = useMarcadoresPageInteractions({
    handleDeleteFolder: p.handleDeleteFolder,
    handleDelete: p.handleDelete,
    selectedIds: ui.selectedIds,
    setSelectedIds: b.setSelectedIds,
    setSelectMode: b.setSelectMode,
    setSelectedIndex: b.setSelectedIndex,
    handleCreateFolder: p.handleCreateFolder,
    newFolderName: ui.newFolderName,
    setNewFolderName: b.setNewFolderName,
    setShowNewFolder: b.setShowNewFolder,
    bookmarks: p.bookmarksForModal,
    setEditingBookmark: b.setEditingBookmark,
    setModalOpen: b.setModalOpen,
    setBookmarkModalNonce: b.setBookmarkModalNonce,
    handleModalSubmit: p.handleModalSubmit,
    editingBookmark: ui.editingBookmark,
    handleBookmarkUpdate: p.handleBookmarkUpdate,
    detailBookmark: ui.detailBookmark,
    handleRenameFolder: p.handleRenameFolder,
    editingFolder: ui.editingFolder,
    renameFolderName: ui.renameFolderName,
    setEditingFolder: b.setEditingFolder,
    setRenameFolderName: b.setRenameFolderName,
  })

  const { setDeskFolderByWin } = p

  const setDeskPaneFolder = useCallback(
    (winId: string, folderId: string) => {
      setDeskFolderByWin((prev) => ({ ...prev, [winId]: folderId }))
    },
    [setDeskFolderByWin]
  )

  const dnd = useMarcadoresDropHandlers({
    folders: p.folders,
    bookmarks: p.bookmarks,
    handlePasteFolder: p.handlePasteFolder,
    handlePasteLink: p.handlePasteLink,
    setPasteError: b.setPasteError,
    selectMode: ui.selectMode,
    openBookmarkTab: p.openBookmarkTab,
    defaultDropFolderId: p.activeBrowseFolderId,
    onNavigateFolder: p.navigateFolderId,
    setDeskPaneFolder,
  })

  return { ...ix, ...dnd }
}
