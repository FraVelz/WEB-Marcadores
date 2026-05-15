"use client"

import { useCallback } from "react"

import type { BookmarkFormData } from "@/components/BookmarkModal"
import type { WorkspaceLayoutPayload, WorkspaceZoneColumn } from "@/features/marcadores/workspaces/workspaceLayout"

import type { Bookmark } from "@/features/marcadores/utils/types"
import type { GridItem } from "@/features/marcadores/utils/types"

export function useMarcadoresPageInteractions(opts: {
  workspaceLayout: WorkspaceLayoutPayload | null
  persistWorkspaceLayout: (payload: WorkspaceLayoutPayload) => Promise<void>
  handleDeleteFolder: (id: string) => Promise<void>
  handleDelete: (
    ids: Set<string>,
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>,
    setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  handleCreateFolder: (name: string) => Promise<void>
  newFolderName: string
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>
  setShowNewFolder: React.Dispatch<React.SetStateAction<boolean>>
  bookmarks: Bookmark[]
  setEditingBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setBookmarkModalNonce: React.Dispatch<React.SetStateAction<number>>
  handleModalSubmit: (data: BookmarkFormData, editing: Bookmark | null) => Promise<void>
  editingBookmark: Bookmark | null
  handleBookmarkUpdate: (id: string, updates: Partial<Bookmark>, detail: Bookmark | null) => Promise<void>
  detailBookmark: Bookmark | null
  handleRenameFolder: (id: string, name: string) => Promise<void>
  editingFolder: { id: string; name: string } | null
  renameFolderName: string
  setEditingFolder: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  setRenameFolderName: React.Dispatch<React.SetStateAction<string>>
}) {
  const {
    workspaceLayout,
    persistWorkspaceLayout,
    handleDeleteFolder,
    handleDelete,
    selectedIds,
    setSelectedIds,
    setSelectMode,
    setSelectedIndex,
    handleCreateFolder,
    newFolderName,
    setNewFolderName,
    setShowNewFolder,
    bookmarks,
    setEditingBookmark,
    setModalOpen,
    setBookmarkModalNonce,
    handleModalSubmit,
    editingBookmark,
    handleBookmarkUpdate,
    detailBookmark,
    handleRenameFolder,
    editingFolder,
    renameFolderName,
    setEditingFolder,
    setRenameFolderName,
  } = opts

  const handleZonesReorder = useCallback(
    async (cols: WorkspaceZoneColumn[]) => {
      if (!workspaceLayout || workspaceLayout.template !== "zones") return
      await persistWorkspaceLayout({
        template: "zones",
        columns: cols,
        revision: workspaceLayout.revision ?? 1,
      })
    },
    [persistWorkspaceLayout, workspaceLayout]
  )

  const onConfirmDelete = useCallback(
    async (item: GridItem) => {
      if (item.type === "folder") {
        await handleDeleteFolder(item.id)
      } else {
        await handleDelete(new Set([item.bookmark.id]), setSelectedIds, setSelectMode)
      }
      setSelectedIndex(0)
    },
    [handleDelete, handleDeleteFolder, setSelectMode, setSelectedIds, setSelectedIndex]
  )

  const handleAdd = useCallback(() => {
    setBookmarkModalNonce((n) => n + 1)
    setEditingBookmark(null)
    setModalOpen(true)
  }, [setBookmarkModalNonce, setEditingBookmark, setModalOpen])

  const onCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    await handleCreateFolder(newFolderName)
    setNewFolderName("")
    setShowNewFolder(false)
  }, [newFolderName, handleCreateFolder, setNewFolderName, setShowNewFolder])

  const handleEdit = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (ids.length === 1) {
      const b = bookmarks.find((x) => x.id === ids[0])
      if (b) {
        setEditingBookmark(b)
        setModalOpen(true)
      }
    }
  }, [selectedIds, bookmarks, setEditingBookmark, setModalOpen])

  const onModalSubmit = useCallback(
    async (data: BookmarkFormData) => {
      await handleModalSubmit(data, editingBookmark)
      setEditingBookmark(null)
    },
    [handleModalSubmit, editingBookmark, setEditingBookmark]
  )

  const onDelete = useCallback(async () => {
    await handleDelete(selectedIds, setSelectedIds, setSelectMode)
  }, [handleDelete, selectedIds, setSelectMode, setSelectedIds])

  const onBookmarkUpdate = useCallback(
    async (id: string, updates: Partial<Bookmark>) => {
      await handleBookmarkUpdate(id, updates, detailBookmark)
    },
    [handleBookmarkUpdate, detailBookmark]
  )

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [setSelectedIds]
  )

  const onRenameFolder = useCallback(async () => {
    if (!editingFolder || !renameFolderName.trim()) return
    await handleRenameFolder(editingFolder.id, renameFolderName)
    setEditingFolder(null)
    setRenameFolderName("")
  }, [editingFolder, renameFolderName, handleRenameFolder, setEditingFolder, setRenameFolderName])

  return {
    handleZonesReorder,
    onConfirmDelete,
    handleAdd,
    onCreateFolder,
    handleEdit,
    onModalSubmit,
    onDelete,
    onBookmarkUpdate,
    toggleSelect,
    onRenameFolder,
  }
}
