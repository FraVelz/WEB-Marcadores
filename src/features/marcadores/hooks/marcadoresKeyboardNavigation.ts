import type { Dispatch, SetStateAction } from "react"

import { folderHasChildren } from "../components/marcadoresTree/treeHelpers"
import type { Bookmark, BreadcrumbPart, FlatFolder, GridItem } from "../utils/types"

function parentFolderIdOf(item: GridItem, folders: FlatFolder[]): string | null {
  if (item.type === "folder") {
    return folders.find((f) => f.id === item.id)?.parent_id ?? null
  }
  return item.bookmark.folder_id ?? null
}

function findFolderIndex(flatList: GridItem[], folderId: string): number {
  return flatList.findIndex((i) => i.type === "folder" && i.id === folderId)
}

export function applyMarcadoresBrowseNavigationKeys(
  e: KeyboardEvent,
  deps: {
    totalCount: number
    flatList: GridItem[]
    selectedIndex: number
    selectMode: boolean
    breadcrumb: BreadcrumbPart[]
    gridCols: number
    setSelectedIds: Dispatch<SetStateAction<Set<string>>>
    setSelectedIndex: Dispatch<SetStateAction<number>>
    setSelectedFolderId: (id: string | null) => void
    openBookmarkTab: (bookmark: Bookmark) => void
    setInfoPanelEnabled: Dispatch<SetStateAction<boolean>>
    setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>
    treeMode?: boolean
    treeCollapsedIds?: Set<string>
    onToggleFolderCollapse?: (folderId: string) => void
    folders?: FlatFolder[]
    bookmarks?: Bookmark[]
  }
): boolean {
  const {
    totalCount,
    flatList,
    selectedIndex,
    selectMode,
    breadcrumb,
    gridCols,
    setSelectedIds,
    setSelectedIndex,
    setSelectedFolderId,
    openBookmarkTab,
    setInfoPanelEnabled,
    setDetailBookmark,
    treeMode = false,
    treeCollapsedIds,
    onToggleFolderCollapse,
    folders = [],
    bookmarks = [],
  } = deps

  if (totalCount === 0) return false
  const item = flatList[selectedIndex]

  if (selectMode && item?.type === "link") {
    if (e.key === "Enter") {
      e.preventDefault()
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(item.bookmark.id)) next.delete(item.bookmark.id)
        else next.add(item.bookmark.id)
        return next
      })
      return true
    }
  } else if (item) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (item.type === "folder") setSelectedFolderId(item.folderId)
      else openBookmarkTab(item.bookmark)
      return true
    }
    if ((e.key === "i" || e.key === "I") && item.type === "link") {
      e.preventDefault()
      setInfoPanelEnabled((prev) => {
        const next = !prev
        if (next) setDetailBookmark(item.bookmark)
        else setDetailBookmark(null)
        return next
      })
      return true
    }
  }

  if (treeMode && treeCollapsedIds && onToggleFolderCollapse && item) {
    if (e.key === "ArrowRight" || e.key === "l") {
      e.preventDefault()
      if (item.type === "folder" && folderHasChildren(folders, bookmarks, item.id) && treeCollapsedIds.has(item.id)) {
        onToggleFolderCollapse(item.id)
      } else {
        setSelectedIndex((i) => Math.min(i + 1, totalCount - 1))
      }
      return true
    }
    if (e.key === "ArrowLeft" || e.key === "h") {
      e.preventDefault()
      if (item.type === "folder" && folderHasChildren(folders, bookmarks, item.id) && !treeCollapsedIds.has(item.id)) {
        onToggleFolderCollapse(item.id)
      } else {
        const parentId = parentFolderIdOf(item, folders)
        if (parentId) {
          const parentIdx = findFolderIndex(flatList, parentId)
          if (parentIdx >= 0) setSelectedIndex(parentIdx)
        }
      }
      return true
    }
    if (e.key === "j" || e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, totalCount - 1))
      return true
    }
    if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return true
    }
  }

  if (e.key === "j" || e.key === "ArrowDown") {
    e.preventDefault()
    setSelectedIndex((i) => Math.min(i + gridCols, totalCount - 1))
    return true
  }
  if (e.key === "k" || e.key === "ArrowUp") {
    e.preventDefault()
    setSelectedIndex((i) => Math.max(i - gridCols, 0))
    return true
  }
  if (e.key === "l" || e.key === "ArrowRight") {
    e.preventDefault()
    setSelectedIndex((i) => Math.min(i + 1, totalCount - 1))
    return true
  }
  if (e.key === "h" || e.key === "ArrowLeft") {
    e.preventDefault()
    setSelectedIndex((i) => Math.max(i - 1, 0))
    return true
  }
  if (e.key === "z" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    if (breadcrumb.length > 1) {
      const parent = breadcrumb[breadcrumb.length - 2]
      setSelectedFolderId(parent.id)
    }
    return true
  }

  return false
}
