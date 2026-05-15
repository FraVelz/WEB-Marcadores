"use client"

import { useCallback } from "react"
import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { buildFolderTree } from "../utils/utils"
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
  setDetailBookmark,
}: UseMarcadoresActionsParams) {
  void bookmarks
  const { demoMode } = useDashboard()
  const supabase = createClient()

  const handleCreateFolder = useCallback(
    async (newFolderName: string) => {
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
    },
    [demoMode, folders, selectedFolderId, supabase, setCtxFolders, refreshFolders, setFolders]
  )

  const handleModalSubmit = useCallback(
    async (data: import("@/components/BookmarkModal").BookmarkFormData, editingBookmark: Bookmark | null) => {
      await persistMarcadoresBookmarkModal(
        { demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags, fetchData },
        data,
        editingBookmark
      )
    },
    [demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags, fetchData]
  )

  const handleDelete = useCallback(
    async (selectedIds: Set<string>, setSelectedIds: (v: Set<string>) => void, setSelectMode: (v: boolean) => void) => {
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
    },
    [demoMode, supabase, setBookmarks]
  )

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      const parentId = folders.find((f) => f.id === folderId)?.parent_id ?? null
      const descendantIds = collectFolderSubtreeIds(folders, folderId)

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
    },
    [demoMode, folders, supabase, setBookmarks, setFolders, setCtxFolders, refreshFolders, fetchData]
  )

  const handleBookmarkUpdate = useCallback(
    async (id: string, updates: Partial<Bookmark>, detailBookmark: Bookmark | null) => {
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
    },
    [demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags]
  )

  const handlePasteFolder = useCallback(
    async (folderId: string, destParentId: string | null) => {
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
    },
    [demoMode, supabase, setCtxFolders, fetchData, setFolders]
  )

  const handleRenameFolder = useCallback(
    async (folderId: string, newName: string) => {
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
    },
    [demoMode, supabase, setCtxFolders, fetchData, setFolders]
  )

  const handlePasteLink = useCallback(
    async (bookmarkId: string, destFolderId: string | null) => {
      if (demoMode) {
        setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? { ...b, folder_id: destFolderId } : b)))
      } else {
        await supabase.from("bookmarks").update({ folder_id: destFolderId }).eq("id", bookmarkId)
        await fetchData()
      }
    },
    [demoMode, supabase, setBookmarks, fetchData]
  )

  const recordBookmarkOpened = useCallback(
    async (bookmarkId: string) => {
      await bumpBookmarkOpenStats({ demoMode, supabase, bookmarks, setBookmarks }, bookmarkId)
    },
    [demoMode, supabase, setBookmarks, bookmarks]
  )

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
