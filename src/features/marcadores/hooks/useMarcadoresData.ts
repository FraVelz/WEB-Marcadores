"use client"

import { useState, useCallback, useMemo, useEffect, startTransition } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data"

import { deriveBookmarkFields } from "../views/bookmarkDerived"
import {
  buildSearchResultGridItems,
  filterBookmarksBySearch,
  type BookmarkSearchOptions,
} from "../utils/bookmarkSearch"
import { buildFoldersByParentIndex } from "../utils/folderIndex"
import { buildFolderTree, getFolderPath } from "../utils/utils"
import type { Bookmark, FlatFolder, GridItem } from "../utils/types"

function normalizeBookmarkRow(raw: Bookmark): Bookmark {
  return {
    ...raw,
    is_favorite: raw.is_favorite ?? false,
    open_count: raw.open_count ?? 0,
    archived_at: raw.archived_at ?? null,
    opened_at: raw.opened_at ?? null,
    updated_at: raw.updated_at ?? null,
    tags: raw.tags ?? [],
  }
}

/** Lista de elementos (grid) para una carpeta concreta. */
export function buildMarcadoresFlatList(
  folders: FlatFolder[],
  viewFilteredBookmarks: Bookmark[],
  selectedFolderId: string | null
): GridItem[] {
  const byParent = buildFoldersByParentIndex(folders)
  const parentId = selectedFolderId
  const subfolders = (byParent.get(parentId) ?? []).map((f) => ({
    type: "folder" as const,
    id: f.id,
    folderId: f.id,
    label: f.name,
  }))
  const links = viewFilteredBookmarks
    .filter((b) => (b.folder_id || null) === parentId)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    .map((b) => ({ type: "link" as const, bookmark: b }))
  return [...subfolders, ...links]
}

export type MarcadoresDataSearchConfig = {
  enabled: boolean
  query: string
  folderId: string | null
  searchInSubfolders: boolean
  searchInDescription: boolean
}

export function useMarcadoresData(
  search: MarcadoresDataSearchConfig,
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void
) {
  const { demoMode, setAllTagsFromBookmarks } = useDashboard()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<FlatFolder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (demoMode) {
      setBookmarks((DEMO_BOOKMARKS as Bookmark[]).map(normalizeBookmarkRow))
      setFolders(DEMO_FOLDERS)
      setCtxFolders(buildFolderTree(DEMO_FOLDERS))
    } else {
      const supabase = createClient()
      const { data: bData } = await supabase.from("bookmarks").select("*").order("title")
      const rows = (bData || []).map((r: Bookmark) => normalizeBookmarkRow(r))
      setBookmarks(rows)
      setAllTagsFromBookmarks(rows)
      const { data: fData } = await supabase.from("folders").select("*").order("sort_order")
      const flat = fData || []
      setFolders(flat)
      setCtxFolders(buildFolderTree(flat))
    }
    setLoading(false)
  }, [demoMode, setCtxFolders, setAllTagsFromBookmarks])

  useEffect(() => {
    startTransition(() => {
      void fetchData()
    })
  }, [fetchData])

  const bookmarksVisible = useMemo(() => bookmarks.filter((b) => !b.archived_at), [bookmarks])

  const derivedRows = useMemo(
    () => bookmarksVisible.map((b) => ({ b, d: deriveBookmarkFields(b) })),
    [bookmarksVisible]
  )

  const searchOpts = useMemo(
    (): BookmarkSearchOptions => ({
      query: search.query,
      folderId: search.folderId,
      folders,
      searchInSubfolders: search.searchInSubfolders,
      searchInDescription: search.searchInDescription,
    }),
    [search.query, search.folderId, search.searchInSubfolders, search.searchInDescription, folders]
  )

  const filteredBySearch = useMemo(() => {
    if (!search.enabled) return bookmarksVisible
    return filterBookmarksBySearch(bookmarksVisible, derivedRows, searchOpts)
  }, [bookmarksVisible, derivedRows, search.enabled, searchOpts])

  const filteredBookmarks = filteredBySearch

  const flatList = useMemo((): GridItem[] => {
    if (!search.enabled) {
      return buildMarcadoresFlatList(folders, bookmarksVisible, search.folderId)
    }
    return buildSearchResultGridItems(folders, filteredBookmarks, searchOpts)
  }, [search.enabled, folders, bookmarksVisible, filteredBookmarks, searchOpts, search.folderId])

  const breadcrumb = useMemo(() => getFolderPath(folders, search.folderId), [folders, search.folderId])

  return {
    bookmarks,
    setBookmarks,
    folders,
    setFolders,
    loading,
    fetchData,
    flatList,
    filteredBookmarks,
    breadcrumb,
    libraryMatchesSearch: filteredBySearch,
    searchOpts,
  }
}
