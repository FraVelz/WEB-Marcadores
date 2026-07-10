"use client"

import type { Folder } from "@/contexts/DashboardContext"

import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"
import { isFolderDescendant } from "@/features/marcadores/utils/utils"

function runDrop(
  sourceItem: GridItem,
  destId: string | null,
  folders: Folder[],
  bookmarks: Bookmark[],
  handlePasteFolder: (folderId: string, destFolderId: string | null) => void,
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => void,
  setPasteError: React.Dispatch<React.SetStateAction<string | null>>
): void {
  setPasteError(null)
  if (sourceItem.type === "folder") {
    if (destId === sourceItem.id) return
    const sameName = folders.some(
      (f) =>
        (f.parent_id || null) === destId &&
        f.name.toLowerCase() === sourceItem.label.toLowerCase() &&
        f.id !== sourceItem.id
    )
    if (sameName) {
      setPasteError("Ya existe una carpeta con ese nombre en el destino")
      return
    }
    if (destId === sourceItem.id || (destId && isFolderDescendant(folders, destId, sourceItem.id))) {
      setPasteError("No se puede mover una carpeta dentro de sí misma o de sus subcarpetas")
      return
    }
    handlePasteFolder(sourceItem.id, destId)
    return
  }
  const sourceBookmark = bookmarks.find((b) => b.id === sourceItem.bookmark.id)
  if (sourceBookmark && (sourceBookmark.folder_id ?? null) === destId) return

  const sameUrl = bookmarks.some(
    (b) => (b.folder_id || null) === destId && b.url === sourceItem.bookmark.url && b.id !== sourceItem.bookmark.id
  )
  if (sameUrl) {
    setPasteError("Ya existe un enlace con esa URL en el destino")
    return
  }
  handlePasteLink(sourceItem.bookmark.id, destId)
}

export function useMarcadoresDropHandlers(opts: {
  folders: Folder[]
  bookmarks: Bookmark[]
  handlePasteFolder: (folderId: string, destFolderId: string | null) => void
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => void
  setPasteError: React.Dispatch<React.SetStateAction<string | null>>
  selectMode: boolean
  openBookmarkTab: (b: Bookmark) => void
  defaultDropFolderId: string | null
  onNavigateFolder: (folderId: string) => void
  setDeskPaneFolder: (winId: string, folderId: string) => void
}) {
  const {
    folders,
    bookmarks,
    handlePasteFolder,
    handlePasteLink,
    setPasteError,
    selectMode,
    openBookmarkTab,
    defaultDropFolderId,
    onNavigateFolder,
    setDeskPaneFolder,
  } = opts

  const handleDrop = (sourceItem: GridItem, targetFolderId?: string | null) => {
    const destId = targetFolderId === undefined ? defaultDropFolderId : targetFolderId
    runDrop(sourceItem, destId, folders, bookmarks, handlePasteFolder, handlePasteLink, setPasteError)
  }

  const handleDoubleClick = (item: GridItem) => {
    if (selectMode) return
    if (item.type === "folder") onNavigateFolder(item.folderId)
    else openBookmarkTab(item.bookmark)
  }

  const makeDeskPaneDrop =
    (winId: string, deskFolderByWin: Record<string, string | null>) =>
    (sourceItem: GridItem, targetFolderId?: string | null) => {
      const paneFolder = deskFolderByWin[winId] ?? null
      const destId = targetFolderId === undefined ? paneFolder : targetFolderId
      runDrop(sourceItem, destId, folders, bookmarks, handlePasteFolder, handlePasteLink, setPasteError)
    }

  const makeDeskPaneDoubleClick = (winId: string) => (item: GridItem) => {
    if (selectMode) return
    if (item.type === "folder") setDeskPaneFolder(winId, item.folderId)
    else openBookmarkTab(item.bookmark)
  }

  return { handleDrop, handleDoubleClick, makeDeskPaneDrop, makeDeskPaneDoubleClick }
}
