import type { Dispatch, SetStateAction } from "react"

import { isFolderDescendant } from "../utils/utils"
import type { Bookmark, CutItem, FlatFolder } from "../utils/types"

export function pasteCutFromKeyboard(
  cutItem: CutItem,
  selectedFolderId: string | null,
  folders: FlatFolder[],
  bookmarks: Bookmark[],
  setPasteError: (v: string | null) => void,
  setCutItem: Dispatch<SetStateAction<CutItem | null>>,
  handlePasteFolder: (folderId: string, destParentId: string | null) => Promise<void>,
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => Promise<void>
) {
  setPasteError(null)
  if (cutItem.type === "folder") {
    const destId = selectedFolderId
    const sameName = folders.some(
      (f) =>
        (f.parent_id || null) === destId && f.name.toLowerCase() === cutItem.name.toLowerCase() && f.id !== cutItem.id
    )
    if (sameName) {
      setPasteError("Ya existe una carpeta con ese nombre en el destino")
      return
    }
    if (destId === cutItem.id || (destId && isFolderDescendant(folders, destId, cutItem.id))) {
      setPasteError("No se puede mover una carpeta dentro de sí misma o de sus subcarpetas")
      return
    }
    void handlePasteFolder(cutItem.id, destId)
    setCutItem(null)
    return
  }
  const destId = selectedFolderId
  const sameUrl = bookmarks.some(
    (b) => (b.folder_id || null) === destId && b.url === cutItem.bookmark.url && b.id !== cutItem.bookmark.id
  )
  if (sameUrl) {
    setPasteError("Ya existe un enlace con esa URL en el destino")
    return
  }
  void handlePasteLink(cutItem.bookmark.id, destId)
  setCutItem(null)
}
