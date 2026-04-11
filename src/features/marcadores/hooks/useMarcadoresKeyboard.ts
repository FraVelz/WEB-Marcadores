"use client"

import { useCallback, useRef } from "react"
import { isFolderDescendant } from "../utils/utils"
import type { Bookmark, GridItem, CutItem, FlatFolder } from "../utils/types"
import type { BreadcrumbPart } from "../utils/types"

const DD_TIMEOUT_MS = 400

type Params = {
  breadcrumb: BreadcrumbPart[]
  deleteConfirmItem: GridItem | null
  setDeleteConfirmItem: React.Dispatch<React.SetStateAction<GridItem | null>>
  onConfirmDelete: (item: GridItem) => void
  flatList: GridItem[]
  selectedIndex: number
  totalCount: number
  gridCols: number
  selectMode: boolean
  selectedFolderId: string | null
  folders: FlatFolder[]
  bookmarks: Bookmark[]
  cutItem: CutItem | null
  setCutItem: React.Dispatch<React.SetStateAction<CutItem | null>>
  setPasteError: (v: string | null) => void
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  setSelectedFolderId: (id: string | null) => void
  setInfoPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  handlePasteFolder: (folderId: string, destParentId: string | null) => Promise<void>
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => Promise<void>
  onAddBookmark: () => void
  onNewFolder: () => void
  onEditItem: (item: GridItem) => void
}

export function useMarcadoresKeyboard(params: Params) {
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)

  const {
    breadcrumb,
    deleteConfirmItem,
    setDeleteConfirmItem,
    onConfirmDelete,
    flatList,
    selectedIndex,
    totalCount,
    gridCols,
    selectMode,
    selectedFolderId,
    folders,
    bookmarks,
    cutItem,
    setCutItem,
    setPasteError,
    setSelectedIds,
    setSelectedIndex,
    setSelectedFolderId,
    setInfoPanelEnabled,
    setDetailBookmark,
    handlePasteFolder,
    handlePasteLink,
    onAddBookmark,
    onNewFolder,
    onEditItem,
  } = params

  return useCallback(
    (e: React.KeyboardEvent) => {
      const active = document.activeElement
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          (active as HTMLElement).closest?.('[role="dialog"]'))
      )
        return

      if (deleteConfirmItem) {
        if (e.key === "Enter") {
          e.preventDefault()
          onConfirmDelete(deleteConfirmItem)
          setDeleteConfirmItem(null)
        }
        if (e.key === "Escape") {
          e.preventDefault()
          setDeleteConfirmItem(null)
        }
        return
      }

      if (e.key === "d" && !e.ctrlKey && !e.metaKey && !e.altKey && totalCount > 0) {
        const item = flatList[selectedIndex]
        const now = Date.now()
        const prev = lastKeyRef.current
        if (prev?.key === "d" && now - prev.time < DD_TIMEOUT_MS && item) {
          e.preventDefault()
          lastKeyRef.current = null
          setDeleteConfirmItem(item)
          return
        }
        e.preventDefault()
        lastKeyRef.current = { key: "d", time: now }
        return
      }
      lastKeyRef.current = null

      if (e.key === "a" && !e.ctrlKey) {
        e.preventDefault()
        onAddBookmark()
        return
      }
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault()
        onNewFolder()
        return
      }
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey) {
        e.preventDefault()
        if (totalCount > 0) {
          const item = flatList[selectedIndex]
          if (item) onEditItem(item)
        }
        return
      }

      if (e.ctrlKey && e.key === "x") {
        e.preventDefault()
        if (totalCount > 0) {
          const item = flatList[selectedIndex]
          if (item?.type === "folder") {
            setCutItem({
              type: "folder",
              id: item.id,
              name: item.label,
              sourceParentId: selectedFolderId,
            })
          } else if (item?.type === "link") {
            setCutItem({ type: "link", bookmark: item.bookmark, sourceFolderId: selectedFolderId })
          }
        }
        return
      }

      if (e.ctrlKey && e.key === "v") {
        e.preventDefault()
        if (cutItem) {
          setPasteError(null)
          if (cutItem.type === "folder") {
            const destId = selectedFolderId
            const sameName = folders.some(
              (f) =>
                (f.parent_id || null) === destId &&
                f.name.toLowerCase() === cutItem.name.toLowerCase() &&
                f.id !== cutItem.id
            )
            if (sameName) {
              setPasteError("Ya existe una carpeta con ese nombre en el destino")
              return
            }
            if (destId === cutItem.id || (destId && isFolderDescendant(folders, destId, cutItem.id))) {
              setPasteError("No se puede mover una carpeta dentro de sí misma o de sus subcarpetas")
              return
            }
            handlePasteFolder(cutItem.id, destId)
            setCutItem(null)
          } else {
            const destId = selectedFolderId
            const sameUrl = bookmarks.some(
              (b) => (b.folder_id || null) === destId && b.url === cutItem.bookmark.url && b.id !== cutItem.bookmark.id
            )
            if (sameUrl) {
              setPasteError("Ya existe un enlace con esa URL en el destino")
              return
            }
            handlePasteLink(cutItem.bookmark.id, destId)
            setCutItem(null)
          }
        }
        return
      }

      if (totalCount === 0) return
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
          return
        }
      } else if (item) {
        if (e.key === "Enter") {
          e.preventDefault()
          if (item.type === "folder") setSelectedFolderId(item.folderId)
          else window.open(item.bookmark.url, "_blank")
          return
        }
        if ((e.key === "i" || e.key === "I") && item.type === "link") {
          e.preventDefault()
          setInfoPanelEnabled((prev) => {
            const next = !prev
            if (next) setDetailBookmark(item.bookmark)
            else setDetailBookmark(null)
            return next
          })
          return
        }
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + gridCols, totalCount - 1))
        return
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - gridCols, 0))
        return
      }
      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, totalCount - 1))
        return
      }
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === "z" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        if (breadcrumb.length > 1) {
          const parent = breadcrumb[breadcrumb.length - 2]
          setSelectedFolderId(parent.id)
        }
        return
      }
    },
    [
      breadcrumb,
      deleteConfirmItem,
      setDeleteConfirmItem,
      onConfirmDelete,
      flatList,
      selectedIndex,
      totalCount,
      gridCols,
      selectMode,
      selectedFolderId,
      folders,
      bookmarks,
      cutItem,
      setCutItem,
      setPasteError,
      setSelectedIds,
      setSelectedIndex,
      setSelectedFolderId,
      setInfoPanelEnabled,
      setDetailBookmark,
      handlePasteFolder,
      handlePasteLink,
      onAddBookmark,
      onNewFolder,
      onEditItem,
    ]
  )
}
