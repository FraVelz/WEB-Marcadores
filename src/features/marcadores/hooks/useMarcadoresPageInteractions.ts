"use client"

import type { BookmarkFormData } from "@/features/marcadores/components/bookmark/BookmarkModal"

import type { Bookmark } from "@/features/marcadores/utils/types"
import type { GridItem } from "@/features/marcadores/utils/types"

export function useMarcadoresPageInteractions(opts: {
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

  const onConfirmDelete = async (item: GridItem) => {
    if (item.type === "folder") {
      await handleDeleteFolder(item.id)
    } else {
      await handleDelete(new Set([item.bookmark.id]), setSelectedIds, setSelectMode)
    }
    setSelectedIndex(0)
  }

  const handleAdd = () => {
    setBookmarkModalNonce((n) => n + 1)
    setEditingBookmark(null)
    setModalOpen(true)
  }

  const onCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await handleCreateFolder(newFolderName)
    setNewFolderName("")
    setShowNewFolder(false)
  }

  const handleEdit = () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 1) {
      const b = bookmarks.find((x) => x.id === ids[0])
      if (b) {
        setEditingBookmark(b)
        setModalOpen(true)
      }
    }
  }

  const onModalSubmit = async (data: BookmarkFormData) => {
    await handleModalSubmit(data, editingBookmark)
    setEditingBookmark(null)
  }

  const onDelete = async () => {
    await handleDelete(selectedIds, setSelectedIds, setSelectMode)
  }

  const onBookmarkUpdate = async (id: string, updates: Partial<Bookmark>) => {
    await handleBookmarkUpdate(id, updates, detailBookmark)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onRenameFolder = async () => {
    if (!editingFolder || !renameFolderName.trim()) return
    await handleRenameFolder(editingFolder.id, renameFolderName)
    setEditingFolder(null)
    setRenameFolderName("")
  }

  return {
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
