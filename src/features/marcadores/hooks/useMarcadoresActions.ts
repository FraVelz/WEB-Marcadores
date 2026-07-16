"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { assertAcyclicFolderMove, CyclicFolderMoveError } from "../utils/assertAcyclicFolderMove"
import { buildFolderTree } from "../utils/utils"
import { repointBrowseAfterFolderDelete } from "../utils/folderBrowseRepoint"
import { collectFolderSubtreeIds } from "../utils/folderDescendants"
import type { Bookmark } from "../utils/types"

import { bumpBookmarkOpenStats } from "./bumpBookmarkOpenStats"
import { persistMarcadoresBookmarkModal } from "./persistMarcadoresBookmarkModal"
import type { UseMarcadoresActionsParams } from "./useMarcadoresActions.types"

export type { UseMarcadoresActionsParams } from "./useMarcadoresActions.types"

export function useMarcadoresActions({
  bookmarks,
  setBookmarks,
  folders,
  setFolders,
  setCtxFolders,
  refreshFolders,
  refreshTags,
  fetchData,
  selectedFolderId,
  dashboardSelectedFolderId,
  setGlobalSelectedFolderId,
  deskFolderByWin,
  setDeskFolderByWin,
  setDetailBookmark,
}: UseMarcadoresActionsParams) {
  void bookmarks
  const { demoMode } = useDashboard()
  const supabase = createClient()

  const handleCreateFolder = async (newFolderName: string) => {
    const name = newFolderName.trim()
    if (!name) return
    if (demoMode) {
      const id = `f-${Date.now()}`
      setFolders((prev) => [...prev, { id, parent_id: selectedFolderId, name, sort_order: prev.length }])
      setCtxFolders(
        buildFolderTree([...folders, { id, parent_id: selectedFolderId, name, sort_order: folders.length }])
      )
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          parent_id: selectedFolderId,
          name,
          sort_order: folders.length,
        })
        .select()
        .single()
      if (!error && data) {
        setFolders((prev) => [...prev, data])
        refreshFolders()
      }
    }
  }

  const handleModalSubmit = async (
    data: import("@/features/marcadores/components/bookmark/BookmarkModal").BookmarkFormData,
    editingBookmark: Bookmark | null
  ) => {
    await persistMarcadoresBookmarkModal(
      { demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags, fetchData },
      data,
      editingBookmark
    )
  }

  const handleDelete = async (
    selectedIds: Set<string>,
    setSelectedIds: (v: Set<string>) => void,
    setSelectMode: (v: boolean) => void
  ) => {
    if (selectedIds.size === 0) return
    if (demoMode) {
      setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)))
      setSelectedIds(new Set())
      setSelectMode(false)
      return
    }
    await supabase.from("bookmarks").delete().in("id", Array.from(selectedIds))
    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)))
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const handleDeleteFolder = async (folderId: string) => {
    const parentId = folders.find((f) => f.id === folderId)?.parent_id ?? null
    const descendantIds = collectFolderSubtreeIds(folders, folderId)

    repointBrowseAfterFolderDelete({
      deletedSubtreeIds: descendantIds,
      fallbackParentId: parentId,
      globalSelectedFolderId: dashboardSelectedFolderId,
      setGlobalSelectedFolderId,
      deskFolderByWin,
      setDeskFolderByWin,
    })

    if (demoMode) {
      setBookmarks((prev) =>
        prev.map((b) => (b.folder_id && descendantIds.has(b.folder_id) ? { ...b, folder_id: parentId } : b))
      )
      setFolders((prev) => {
        const next = prev.filter((f) => !descendantIds.has(f.id))
        setCtxFolders(buildFolderTree(next))
        return next
      })
      refreshFolders()
      return
    }
    await Promise.all([
      supabase.from("bookmarks").update({ folder_id: parentId }).in("folder_id", Array.from(descendantIds)),
      supabase.from("folders").delete().in("id", Array.from(descendantIds)),
    ])
    await fetchData()
  }

  const handleBookmarkUpdate = async (id: string, updates: Partial<Bookmark>, detailBookmark: Bookmark | null) => {
    if (demoMode) {
      setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
      if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null))
      refreshTags()
      return
    }
    await supabase.from("bookmarks").update(updates).eq("id", id)
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null))
    refreshTags()
  }

  const handlePasteFolder = async (folderId: string, destParentId: string | null) => {
    try {
      assertAcyclicFolderMove(folders, folderId, destParentId)
    } catch (error) {
      if (error instanceof CyclicFolderMoveError) return
      throw error
    }

    if (demoMode) {
      setFolders((prev) => {
        const next = prev.map((f) => (f.id === folderId ? { ...f, parent_id: destParentId } : f))
        setCtxFolders(buildFolderTree(next))
        return next
      })
    } else {
      await supabase.from("folders").update({ parent_id: destParentId }).eq("id", folderId)
      await fetchData()
    }
  }

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const name = newName.trim()
    if (!name) return
    if (demoMode) {
      setFolders((prev) => {
        const next = prev.map((f) => (f.id === folderId ? { ...f, name } : f))
        setCtxFolders(buildFolderTree(next))
        return next
      })
    } else {
      await supabase.from("folders").update({ name }).eq("id", folderId)
      await fetchData()
    }
  }

  const handlePasteLink = async (bookmarkId: string, destFolderId: string | null) => {
    if (demoMode) {
      setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? { ...b, folder_id: destFolderId } : b)))
    } else {
      await supabase.from("bookmarks").update({ folder_id: destFolderId }).eq("id", bookmarkId)
      await fetchData()
    }
  }

  const recordBookmarkOpened = async (bookmarkId: string) => {
    await bumpBookmarkOpenStats({ demoMode, supabase, bookmarks, setBookmarks }, bookmarkId)
  }

  return {
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleDeleteFolder,
    handleBookmarkUpdate,
    handlePasteFolder,
    handlePasteLink,
    recordBookmarkOpened,
  }
}
