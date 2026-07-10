"use client"

import { useEffect, useState } from "react"

import type { Folder } from "@/contexts/DashboardContext"

import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { LibraryPaneUiScope } from "@/features/marcadores/state/libraryPaneUiScope"
import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"

export function useMarcadoresTreeDerived(opts: {
  folders: Folder[]
  filteredBookmarks: Bookmark[]
  paneScope: LibraryPaneUiScope
  flatList: GridItem[]
}) {
  const { folders, filteredBookmarks, paneScope, flatList } = opts
  const pane = paneScope.getState()
  const { setSelectedIndex } = paneScope.bindings
  const { viewMode, searchValue } = pane
  const { itemRefs } = paneScope

  const [treeCollapsedIds, setTreeCollapsedIds] = useState<Set<string>>(() => new Set())

  const treeFlatRows = ((): TreeFlatRow[] => {
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
  })()

  const primaryViewMode = viewMode
  const focusFlatList = primaryViewMode === "tree" ? treeFlatRows.map((r) => r.item) : flatList

  const toggleTreeFolderCollapse = (folderId: string) => {
    setTreeCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

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
