import type { Dispatch, SetStateAction } from "react"

import {
  assertAcyclicFolderMove,
  CyclicFolderMoveError,
  CYCLIC_FOLDER_MOVE_MESSAGE,
} from "../utils/assertAcyclicFolderMove"
import { notifyPasteError } from "../utils/notifyPasteError"
import type { Bookmark, CutItem, FlatFolder } from "../utils/types"

export function pasteCutFromKeyboard(
  cutItem: CutItem,
  selectedFolderId: string | null,
  folders: FlatFolder[],
  bookmarks: Bookmark[],
  setCutItem: Dispatch<SetStateAction<CutItem | null>>,
  handlePasteFolder: (folderId: string, destParentId: string | null) => Promise<void>,
  handlePasteLink: (bookmarkId: string, destFolderId: string | null) => Promise<void>
) {
  if (cutItem.type === "folder") {
    const destId = selectedFolderId
    const sameName = folders.some(
      (f) =>
        (f.parent_id || null) === destId && f.name.toLowerCase() === cutItem.name.toLowerCase() && f.id !== cutItem.id
    )
    if (sameName) {
      notifyPasteError("Ya existe una carpeta con ese nombre en el destino")
      return
    }
    try {
      assertAcyclicFolderMove(folders, cutItem.id, destId)
    } catch (error) {
      if (error instanceof CyclicFolderMoveError) {
        notifyPasteError(CYCLIC_FOLDER_MOVE_MESSAGE)
        return
      }
      throw error
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
    notifyPasteError("Ya existe un enlace con esa URL en el destino")
    return
  }
  void handlePasteLink(cutItem.bookmark.id, destId)
  setCutItem(null)
}
