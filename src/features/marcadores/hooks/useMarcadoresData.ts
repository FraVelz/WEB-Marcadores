"use client"

import { useState, useCallback, useMemo, useEffect, startTransition } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data"

import { compileView } from "../views/applyFilter"
import { deriveBookmarkFields } from "../views/bookmarkDerived"
import type { ViewAst } from "../views/viewTypes"
import { EMPTY_VIEW_AST } from "../views/viewTypes"
import { buildFolderTree, getFolderPath } from "../utils/utils"
import type { Bookmark, FlatFolder, GridItem } from "../utils/types"

export type BrowseMode = "folder" | "filter"

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

type UseMarcadoresDataOpts = {
  browseMode: BrowseMode
  activeViewAst: ViewAst | null
}

const defaultOpts: UseMarcadoresDataOpts = {
  browseMode: "folder",
  activeViewAst: null,
}

/** Lista de elementos (grid) para una carpeta concreta; comparte reglas con `useMarcadoresData`. */
export function buildMarcadoresFlatList(
  folders: FlatFolder[],
  viewFilteredBookmarks: Bookmark[],
  selectedFolderId: string | null,
  browseMode: BrowseMode
): GridItem[] {
  if (browseMode === "filter") {
    return viewFilteredBookmarks
      .slice()
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .map((b) => ({ type: "link" as const, bookmark: b }))
  }
  const parentId = selectedFolderId
  const subfolders = folders
    .filter((f) => (f.parent_id || null) === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((f) => ({ type: "folder" as const, id: f.id, folderId: f.id, label: f.name }))
  const links = viewFilteredBookmarks
    .filter((b) => (b.folder_id || null) === parentId)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    .map((b) => ({ type: "link" as const, bookmark: b }))
  return [...subfolders, ...links]
}

export function useMarcadoresData(
  searchValue: string,
  selectedFolderId: string | null,
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void,
  refreshFolders: () => void,
  opts: UseMarcadoresDataOpts = defaultOpts
) {
  const { demoMode, setAllTagsFromBookmarks } = useDashboard()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<FlatFolder[]>([])
  const [loading, setLoading] = useState(true)

  const browseMode = opts.browseMode
  const activeViewAst = opts.activeViewAst

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
      setFolders(fData || [])
      refreshFolders()
    }
    setLoading(false)
  }, [demoMode, setCtxFolders, refreshFolders, setAllTagsFromBookmarks])

  useEffect(() => {
    startTransition(() => {
      void fetchData()
    })
  }, [fetchData])

  const bookmarksVisible = useMemo(() => bookmarks.filter((b) => !b.archived_at), [bookmarks])

  const filteredBySearch = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return bookmarksVisible
    return bookmarksVisible.filter((b) => {
      const derived = deriveBookmarkFields(b)
      return (
        derived.lowerTitle.includes(q) ||
        derived.lowerDesc.includes(q) ||
        derived.lowerUrl.includes(q) ||
        [...derived.tagSetLower].some((t) => t.includes(q))
      )
    })
  }, [bookmarksVisible, searchValue])

  const compiledView = useMemo(() => compileView(activeViewAst ?? EMPTY_VIEW_AST), [activeViewAst])

  const filteredBookmarks = useMemo(() => {
    if (browseMode === "folder") return filteredBySearch
    return filteredBySearch.filter((b) => compiledView.match(b, deriveBookmarkFields(b)))
  }, [browseMode, compiledView, filteredBySearch])

  const flatList = useMemo(
    (): GridItem[] => buildMarcadoresFlatList(folders, filteredBookmarks, selectedFolderId, browseMode),
    [browseMode, filteredBookmarks, folders, selectedFolderId]
  )

  const breadcrumb = useMemo(() => getFolderPath(folders, selectedFolderId), [folders, selectedFolderId])

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
  }
}
