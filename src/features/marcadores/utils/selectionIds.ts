import { collectFolderSubtreeIds } from "@/features/marcadores/utils/folderDescendants"
import type { Bookmark, FlatFolder, GridItem } from "@/features/marcadores/utils/types"
import { isFolderDescendant } from "@/features/marcadores/utils/utils"

export function gridItemSelectionId(item: GridItem): string {
  return item.type === "folder" ? item.id : item.bookmark.id
}

export function partitionSelectedIds(
  selectedIds: Set<string>,
  folders: FlatFolder[],
  bookmarks: Bookmark[]
): { folderIds: string[]; bookmarkIds: string[] } {
  const folderIdSet = new Set(folders.map((f) => f.id))
  const bookmarkIdSet = new Set(bookmarks.map((b) => b.id))
  const folderIds: string[] = []
  const bookmarkIds: string[] = []
  for (const id of selectedIds) {
    if (folderIdSet.has(id)) folderIds.push(id)
    else if (bookmarkIdSet.has(id)) bookmarkIds.push(id)
  }
  return { folderIds, bookmarkIds }
}

/** Si padre e hijo están seleccionados, solo elimina el ancestro más alto. */
export function topmostSelectedFolderIds(folders: FlatFolder[], selectedFolderIds: string[]): string[] {
  const selected = new Set(selectedFolderIds)
  return selectedFolderIds.filter((id) => {
    for (const other of selected) {
      if (other !== id && isFolderDescendant(folders, id, other)) return false
    }
    return true
  })
}

/** Enlaces cuya carpeta ya se borra con un subárbol seleccionado no hace falta borrar aparte. */
export function bookmarkIdsOutsideDeletedFolders(
  bookmarks: Bookmark[],
  bookmarkIds: string[],
  folders: FlatFolder[],
  folderIdsToDelete: string[]
): string[] {
  if (folderIdsToDelete.length === 0) return bookmarkIds
  const covered = new Set<string>()
  for (const folderId of folderIdsToDelete) {
    for (const id of collectFolderSubtreeIds(folders, folderId)) covered.add(id)
  }
  return bookmarkIds.filter((id) => {
    const folderId = bookmarks.find((b) => b.id === id)?.folder_id ?? null
    return !folderId || !covered.has(folderId)
  })
}
