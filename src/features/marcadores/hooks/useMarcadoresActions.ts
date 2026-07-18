"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { captureMutationError } from "@/lib/sentry/captureMutationError"
import { assertAcyclicFolderMove, CyclicFolderMoveError } from "../utils/assertAcyclicFolderMove"
import { buildMarcadoresBackupJson, stringifyMarcadoresBackup } from "../utils/marcadoresBackup"
import { buildFolderTree } from "../utils/utils"
import { repointBrowseAfterFolderDelete } from "../utils/folderBrowseRepoint"
import { collectFolderSubtreeIds } from "../utils/folderDescendants"
import type { Bookmark } from "../utils/types"

import { bumpBookmarkOpenStats } from "./bumpBookmarkOpenStats"
import { importBackupJsonFile, importNetscapeHtmlFile } from "./persistMarcadoresImport"
import { persistMarcadoresBookmarkModal } from "./persistMarcadoresBookmarkModal"
import type { UseMarcadoresActionsParams } from "./useMarcadoresActions.types"

export type { UseMarcadoresActionsParams } from "./useMarcadoresActions.types"

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function withMutationError<T>(mutation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    captureMutationError(error, { mutation })
    throw error
  }
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
  dashboardSelectedFolderId,
  setGlobalSelectedFolderId,
  deskFolderByWin,
  setDeskFolderByWin,
  setDetailBookmark,
}: UseMarcadoresActionsParams) {
  const { demoMode } = useDashboard()
  const supabase = createClient()

  const handleCreateFolder = async (newFolderName: string) => {
    const name = newFolderName.trim()
    if (!name) return
    await withMutationError("create_folder", async () => {
      if (demoMode) {
        const id = `f-${Date.now()}`
        setFolders((prev) => [...prev, { id, parent_id: selectedFolderId, name, sort_order: prev.length }])
        setCtxFolders(
          buildFolderTree([...folders, { id, parent_id: selectedFolderId, name, sort_order: folders.length }])
        )
        return
      }
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
      if (error) throw error
      if (data) {
        setFolders((prev) => [...prev, data])
        refreshFolders()
      }
    })
  }

  const handleModalSubmit = async (
    data: import("@/features/marcadores/components/bookmark/BookmarkModal").BookmarkFormData,
    editingBookmark: Bookmark | null
  ) => {
    await withMutationError(editingBookmark ? "update_bookmark" : "create_bookmark", async () => {
      await persistMarcadoresBookmarkModal(
        { demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags, fetchData },
        data,
        editingBookmark
      )
    })
  }

  const handleDelete = async (
    selectedIds: Set<string>,
    setSelectedIds: (v: Set<string>) => void,
    setSelectMode: (v: boolean) => void
  ) => {
    if (selectedIds.size === 0) return
    await withMutationError("delete_bookmarks", async () => {
      if (demoMode) {
        setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)))
        setSelectedIds(new Set())
        setSelectMode(false)
        return
      }
      const { error } = await supabase.from("bookmarks").delete().in("id", Array.from(selectedIds))
      if (error) throw error
      setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)))
      setSelectedIds(new Set())
      setSelectMode(false)
    })
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

    await withMutationError("delete_folder", async () => {
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
      const [moveRes, delRes] = await Promise.all([
        supabase.from("bookmarks").update({ folder_id: parentId }).in("folder_id", Array.from(descendantIds)),
        supabase.from("folders").delete().in("id", Array.from(descendantIds)),
      ])
      if (moveRes.error) throw moveRes.error
      if (delRes.error) throw delRes.error
      await fetchData()
    })
  }

  const handleBookmarkUpdate = async (id: string, updates: Partial<Bookmark>, detailBookmark: Bookmark | null) => {
    await withMutationError("update_bookmark_fields", async () => {
      if (demoMode) {
        setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
        if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null))
        refreshTags()
        return
      }
      const { error } = await supabase.from("bookmarks").update(updates).eq("id", id)
      if (error) throw error
      setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
      if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null))
      refreshTags()
    })
  }

  const handlePasteFolder = async (folderId: string, destParentId: string | null) => {
    try {
      assertAcyclicFolderMove(folders, folderId, destParentId)
    } catch (error) {
      if (error instanceof CyclicFolderMoveError) return
      throw error
    }

    await withMutationError("move_folder", async () => {
      if (demoMode) {
        setFolders((prev) => {
          const next = prev.map((f) => (f.id === folderId ? { ...f, parent_id: destParentId } : f))
          setCtxFolders(buildFolderTree(next))
          return next
        })
        return
      }
      const { error } = await supabase.from("folders").update({ parent_id: destParentId }).eq("id", folderId)
      if (error) throw error
      await fetchData()
    })
  }

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const name = newName.trim()
    if (!name) return
    await withMutationError("rename_folder", async () => {
      if (demoMode) {
        setFolders((prev) => {
          const next = prev.map((f) => (f.id === folderId ? { ...f, name } : f))
          setCtxFolders(buildFolderTree(next))
          return next
        })
        return
      }
      const { error } = await supabase.from("folders").update({ name }).eq("id", folderId)
      if (error) throw error
      await fetchData()
    })
  }

  const handlePasteLink = async (bookmarkId: string, destFolderId: string | null) => {
    await withMutationError("move_bookmark", async () => {
      if (demoMode) {
        setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? { ...b, folder_id: destFolderId } : b)))
        return
      }
      const { error } = await supabase.from("bookmarks").update({ folder_id: destFolderId }).eq("id", bookmarkId)
      if (error) throw error
      await fetchData()
    })
  }

  const recordBookmarkOpened = async (bookmarkId: string) => {
    try {
      await bumpBookmarkOpenStats({ demoMode, supabase, bookmarks, setBookmarks }, bookmarkId)
    } catch (error) {
      captureMutationError(error, { mutation: "record_bookmark_open" })
    }
  }

  const handleExportJson = () => {
    const backup = buildMarcadoresBackupJson(folders, bookmarks)
    const stamp = backup.exportedAt.slice(0, 10)
    downloadTextFile(`marcadores-backup-${stamp}.json`, stringifyMarcadoresBackup(backup), "application/json")
  }

  const handleImportFile = async (file: File) => {
    const deps = {
      demoMode,
      supabase,
      folders,
      setFolders,
      setBookmarks,
      setCtxFolders,
      refreshFolders,
      refreshTags,
      fetchData,
      targetFolderId: selectedFolderId,
    }
    const lower = file.name.toLowerCase()
    if (lower.endsWith(".json") || file.type === "application/json") {
      return importBackupJsonFile(deps, file)
    }
    return importNetscapeHtmlFile(deps, file)
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
    handleExportJson,
    handleImportFile,
  }
}
