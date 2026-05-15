"use client"

import { useCallback } from "react"

import type { BookmarkFormData } from "@/components/BookmarkModal"

import type { Folder } from "@/contexts/DashboardContext"

import { useMarcadoresDropHandlers } from "@/features/marcadores/hooks/useMarcadoresDropHandlers"
import { useMarcadoresPageInteractions } from "@/features/marcadores/hooks/useMarcadoresPageInteractions"
import type { Bookmark } from "@/features/marcadores/utils/types"
import type { WorkspaceLayoutPayload } from "@/features/marcadores/workspaces/workspaceLayout"

/** Interacciones de página + DnD, una vez cargados datos y vistas derivadas del árbol. */
export function useMarcadoresPageDnDLayer(p: {
  workspaceLayout: WorkspaceLayoutPayload | null
  persistWorkspaceLayout: (payload: WorkspaceLayoutPayload) => Promise<void>
  folders: Folder[]
  bookmarks: Bookmark[]
  handlePasteFolder: (folderId: string, destParentId: string | null) => void
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  selectMode: boolean
  setPasteError: React.Dispatch<React.SetStateAction<string | null>>
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
  newFolderName: string
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>
  setShowNewFolder: React.Dispatch<React.SetStateAction<boolean>>
  bookmarksForModal: Bookmark[]
  setEditingBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setBookmarkModalNonce: React.Dispatch<React.SetStateAction<number>>
  editingBookmark: Bookmark | null
  detailBookmark: Bookmark | null
  editingFolder: { id: string; name: string } | null
  renameFolderName: string
  setEditingFolder: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  setRenameFolderName: React.Dispatch<React.SetStateAction<string>>
}) {
  const ix = useMarcadoresPageInteractions({
    workspaceLayout: p.workspaceLayout,
    persistWorkspaceLayout: p.persistWorkspaceLayout,
    handleDeleteFolder: p.handleDeleteFolder,
    handleDelete: p.handleDelete,
    selectedIds: p.selectedIds,
    setSelectedIds: p.setSelectedIds,
    setSelectMode: p.setSelectMode,
    setSelectedIndex: p.setSelectedIndex,
    handleCreateFolder: p.handleCreateFolder,
    newFolderName: p.newFolderName,
    setNewFolderName: p.setNewFolderName,
    setShowNewFolder: p.setShowNewFolder,
    bookmarks: p.bookmarksForModal,
    setEditingBookmark: p.setEditingBookmark,
    setModalOpen: p.setModalOpen,
    setBookmarkModalNonce: p.setBookmarkModalNonce,
    handleModalSubmit: p.handleModalSubmit,
    editingBookmark: p.editingBookmark,
    handleBookmarkUpdate: p.handleBookmarkUpdate,
    detailBookmark: p.detailBookmark,
    handleRenameFolder: p.handleRenameFolder,
    editingFolder: p.editingFolder,
    renameFolderName: p.renameFolderName,
    setEditingFolder: p.setEditingFolder,
    setRenameFolderName: p.setRenameFolderName,
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
    setPasteError: p.setPasteError,
    selectMode: p.selectMode,
    openBookmarkTab: p.openBookmarkTab,
    defaultDropFolderId: p.activeBrowseFolderId,
    onNavigateFolder: p.navigateFolderId,
    setDeskPaneFolder,
  })

  return { ...ix, ...dnd }
}
