"use client"

import { useCallback } from "react"
import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { buildFolderTree } from "../utils/utils"
import { splitCommaTags } from "@/lib/comma-tags"
import type { Bookmark, FlatFolder } from "../utils/types"
import type { BookmarkFormData } from "@/components/BookmarkModal"

type UseMarcadoresActionsParams = {
  bookmarks: Bookmark[]
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>
  folders: FlatFolder[]
  setFolders: React.Dispatch<React.SetStateAction<FlatFolder[]>>
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void
  refreshFolders: () => void
  refreshTags: () => void
  fetchData: () => Promise<void>
  selectedFolderId: string | null
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
}

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
    async (data: BookmarkFormData, editingBookmark: Bookmark | null) => {
      const tags = data.tags ? splitCommaTags(data.tags) : []
      const folder_id = data.folder_id || null

      if (demoMode) {
        if (editingBookmark) {
          setBookmarks((prev) =>
            prev.map((b) =>
              b.id === editingBookmark.id
                ? {
                    ...b,
                    title: data.title,
                    url: data.url,
                    description: data.description || undefined,
                    folder_id,
                    tags,
                  }
                : b
            )
          )
          setDetailBookmark((prev) =>
            prev?.id === editingBookmark.id
              ? {
                  ...prev,
                  title: data.title,
                  url: data.url,
                  description: data.description,
                  folder_id,
                  tags,
                }
              : prev
          )
        } else {
          setBookmarks((prev) => [
            ...prev,
            {
              id: `demo-${Date.now()}`,
              title: data.title,
              url: data.url,
              description: data.description || undefined,
              folder_id,
              tags,
              created_at: new Date().toISOString(),
            },
          ])
        }
        refreshTags()
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Debes iniciar sesión")

      const payload = {
        title: data.title,
        url: data.url,
        description: data.description || null,
        folder_id,
        tags: data.tags ? splitCommaTags(data.tags) : [],
      }

      if (editingBookmark) {
        await supabase.from("bookmarks").update(payload).eq("id", editingBookmark.id)
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, ...payload })
      }
      await fetchData()
      refreshTags()
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
      const descendantIds = new Set<string>()
      const stack = [folderId]
      while (stack.length > 0) {
        const id = stack.pop()!
        descendantIds.add(id)
        for (const f of folders) {
          if ((f.parent_id || null) === id) stack.push(f.id)
        }
      }

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

  return {
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleDeleteFolder,
    handleBookmarkUpdate,
    handlePasteFolder,
    handlePasteLink,
  }
}
