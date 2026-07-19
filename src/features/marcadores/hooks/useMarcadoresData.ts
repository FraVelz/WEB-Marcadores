"use client"

import { useState, useEffect, startTransition } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data"

import { deriveBookmarkFields } from "../views/bookmarkDerived"
import { buildSearchResultGridItems, filterBookmarksBySearch } from "../utils/bookmarkSearch"
import { buildFoldersByParentIndex } from "../utils/folderIndex"
import type { BookmarkSortOrder } from "../state/libraryPaneUiState"
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
    deleted_at: raw.deleted_at ?? null,
    deleted_batch_id: raw.deleted_batch_id ?? null,
    metadata: raw.metadata ?? {},
  }
}

/** Ordena marcadores según la preferencia del usuario. */
export function sortBookmarksByOrder(bookmarks: Bookmark[], sort: BookmarkSortOrder): Bookmark[] {
  const copy = [...bookmarks]
  if (sort === "title") {
    return copy.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }
  if (sort === "recent") {
    return copy.sort((a, b) => {
      const da = a.opened_at || a.updated_at || a.created_at || ""
      const db = b.opened_at || b.updated_at || b.created_at || ""
      return db.localeCompare(da)
    })
  }
  return copy.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
}

/** Lista de elementos (grid) para una carpeta concreta. */
export function buildMarcadoresFlatList(
  folders: FlatFolder[],
  viewFilteredBookmarks: Bookmark[],
  selectedFolderId: string | null,
  bookmarkSort: BookmarkSortOrder = "title"
): GridItem[] {
  const byParent = buildFoldersByParentIndex(folders)
  const parentId = selectedFolderId
  const subfolders = (byParent.get(parentId) ?? []).map((f) => ({
    type: "folder" as const,
    id: f.id,
    folderId: f.id,
    label: f.name,
  }))
  const links = sortBookmarksByOrder(
    viewFilteredBookmarks.filter((b) => (b.folder_id || null) === parentId),
    bookmarkSort
  ).map((b) => ({ type: "link" as const, bookmark: b }))
  return [...subfolders, ...links]
}

export type MarcadoresDataSearchConfig = {
  enabled: boolean
  query: string
  folderId: string | null
  searchInSubfolders: boolean
  searchInDescription: boolean
  bookmarkSort: BookmarkSortOrder
}

export function useMarcadoresData(
  search: MarcadoresDataSearchConfig,
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void
) {
  const { demoMode, setAllTagsFromBookmarks } = useDashboard()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<FlatFolder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (demoMode) {
      setBookmarks((DEMO_BOOKMARKS as Bookmark[]).map(normalizeBookmarkRow))
      setFolders(DEMO_FOLDERS)
      setCtxFolders(buildFolderTree(DEMO_FOLDERS))
    } else {
      const supabase = createClient()
      const { data: bData } = await supabase.from("bookmarks").select("*").is("deleted_at", null).order("title")
      const rows = (bData || []).map((r: Bookmark) => normalizeBookmarkRow(r))
      setBookmarks(rows)
      setAllTagsFromBookmarks(rows)
      const { data: fData } = await supabase.from("folders").select("*").is("deleted_at", null).order("sort_order")
      const flat = fData || []
      setFolders(flat)
      setCtxFolders(buildFolderTree(flat))
    }
    setLoading(false)
  }

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        if (demoMode) {
          setBookmarks((DEMO_BOOKMARKS as Bookmark[]).map(normalizeBookmarkRow))
          setFolders(DEMO_FOLDERS)
          setCtxFolders(buildFolderTree(DEMO_FOLDERS))
        } else {
          const supabase = createClient()
          const { data: bData } = await supabase.from("bookmarks").select("*").is("deleted_at", null).order("title")
          const rows = (bData || []).map((r: Bookmark) => normalizeBookmarkRow(r))
          setBookmarks(rows)
          setAllTagsFromBookmarks(rows)
          const { data: fData } = await supabase.from("folders").select("*").is("deleted_at", null).order("sort_order")
          const flat = fData || []
          setFolders(flat)
          setCtxFolders(buildFolderTree(flat))
        }
        setLoading(false)
      })()
    })
  }, [demoMode, setAllTagsFromBookmarks, setCtxFolders])

  const bookmarksVisible = bookmarks.filter((b) => !b.archived_at && !b.deleted_at)

  const derivedRows = bookmarksVisible.map((b) => ({ b, d: deriveBookmarkFields(b) }))

  const searchOpts = {
    query: search.query,
    folderId: search.folderId,
    folders,
    searchInSubfolders: search.searchInSubfolders,
    searchInDescription: search.searchInDescription,
  }

  const filteredBySearch = (() => {
    if (!search.enabled) return bookmarksVisible
    return filterBookmarksBySearch(bookmarksVisible, derivedRows, searchOpts)
  })()

  const filteredBookmarks = filteredBySearch

  const flatList = ((): GridItem[] => {
    if (!search.enabled) {
      return buildMarcadoresFlatList(folders, bookmarksVisible, search.folderId, search.bookmarkSort)
    }
    return buildSearchResultGridItems(folders, filteredBookmarks, searchOpts, search.bookmarkSort)
  })()

  const breadcrumb = getFolderPath(folders, search.folderId)

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
