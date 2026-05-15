"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { Folder } from "@/contexts/DashboardContext"

import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"

export function useMarcadoresTreeDerived(opts: {
  folders: Folder[]
  filteredBookmarks: Bookmark[]
  browseMode: BrowseMode
  zonesBoard: boolean
  viewMode: "grid" | "tree"
  setViewMode: React.Dispatch<React.SetStateAction<"grid" | "tree">>
  flatList: GridItem[]
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  searchValue: string
}) {
  const {
    folders,
    filteredBookmarks,
    browseMode,
    zonesBoard,
    viewMode,
    setViewMode,
    flatList,
    setSelectedIndex,
    itemRefs,
    searchValue,
  } = opts

  const [treeCollapsedIds, setTreeCollapsedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    queueMicrotask(() => {
      if ((browseMode === "filter" || zonesBoard) && viewMode === "tree") setViewMode("grid")
    })
  }, [browseMode, zonesBoard, setViewMode, viewMode])

  const treeFlatRows = useMemo((): TreeFlatRow[] => {
    const result: TreeFlatRow[] = []
    const walk = (parentId: string | null, depth: number) => {
      const subfolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
      const links = filteredBookmarks
        .filter((b) => (b.folder_id || null) === parentId)
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      for (const f of subfolders) {
        result.push({
          item: { type: "folder", id: f.id, folderId: f.id, label: f.name },
          depth,
        })
        if (!treeCollapsedIds.has(f.id)) walk(f.id, depth + 1)
      }
      for (const b of links) {
        result.push({ item: { type: "link", bookmark: b }, depth })
      }
    }
    walk(null, 0)
    return result
  }, [folders, filteredBookmarks, treeCollapsedIds])

  const primaryViewMode = browseMode === "filter" ? "grid" : viewMode
  const focusFlatList = primaryViewMode === "tree" ? treeFlatRows.map((r) => r.item) : flatList

  const toggleTreeFolderCollapse = useCallback((folderId: string) => {
    setTreeCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      if (searchValue.trim()) setTreeCollapsedIds(new Set())
    })
  }, [searchValue])

  useEffect(() => {
    queueMicrotask(() => {
      itemRefs.current.clear()
      setSelectedIndex(0)
    })
  }, [itemRefs, setSelectedIndex, viewMode])

  useEffect(() => {
    queueMicrotask(() => {
      if (primaryViewMode !== "tree") return
      setSelectedIndex((i) => {
        const max = Math.max(0, treeFlatRows.length - 1)
        return Math.min(Math.max(0, i), max)
      })
    })
  }, [primaryViewMode, setSelectedIndex, treeFlatRows])

  return {
    treeCollapsedIds,
    treeFlatRows,
    toggleTreeFolderCollapse,
    primaryViewMode,
    focusFlatList,
  }
}
