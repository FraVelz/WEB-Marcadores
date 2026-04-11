"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data"
import { buildFolderTree, getFolderPath } from "../utils/utils"
import type { Bookmark, GridItem, FlatFolder } from "../utils/types"

export function useMarcadoresData(
  searchValue: string,
  selectedFolderId: string | null,
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void,
  refreshFolders: () => void
) {
  const { demoMode } = useDashboard()
  const supabase = createClient()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<FlatFolder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (demoMode) {
      setBookmarks(DEMO_BOOKMARKS as Bookmark[])
      setFolders(DEMO_FOLDERS)
      setCtxFolders(buildFolderTree(DEMO_FOLDERS))
    } else {
      const { data: bData } = await supabase.from("bookmarks").select("*").order("title")
      setBookmarks(bData || [])
      const { data: fData } = await supabase.from("folders").select("*").order("sort_order")
      setFolders(fData || [])
      refreshFolders()
    }
    setLoading(false)
  }, [demoMode, supabase, setCtxFolders, refreshFolders])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData()
    })
  }, [fetchData])

  useEffect(() => {
    if (demoMode) {
      setCtxFolders(buildFolderTree(folders))
    }
  }, [demoMode, folders, setCtxFolders])

  const filteredBookmarks = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return bookmarks
    return bookmarks.filter((b) => {
      const matchTitle = b.title?.toLowerCase().includes(q)
      const matchDesc = b.description?.toLowerCase().includes(q)
      const matchUrl = b.url?.toLowerCase().includes(q)
      const matchTags = b.tags?.some((tag) => tag.toLowerCase().includes(q))
      return matchTitle || matchDesc || matchUrl || matchTags
    })
  }, [bookmarks, searchValue])

  const flatList = useMemo((): GridItem[] => {
    const parentId = selectedFolderId
    const subfolders = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({ type: "folder" as const, id: f.id, folderId: f.id, label: f.name }))
    const links = filteredBookmarks
      .filter((b) => (b.folder_id || null) === parentId)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .map((b) => ({ type: "link" as const, bookmark: b }))
    return [...subfolders, ...links]
  }, [filteredBookmarks, folders, selectedFolderId])

  const breadcrumb = useMemo(() => getFolderPath(folders, selectedFolderId), [folders, selectedFolderId])

  return {
    bookmarks,
    setBookmarks,
    folders,
    setFolders,
    loading,
    fetchData,
    flatList,
    breadcrumb,
    supabase,
  }
}
