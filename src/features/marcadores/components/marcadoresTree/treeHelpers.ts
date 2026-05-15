import { getFolderPath } from "../../utils/utils"
import type { Bookmark, FlatFolder, GridItem } from "../../utils/types"

export function folderDestinationLine(folders: FlatFolder[], folderId: string | null) {
  return getFolderPath(folders, folderId)
    .map((p) => p.label)
    .join(" › ")
}

export function rowTargetKey(item: GridItem): string {
  return item.type === "folder" ? `folder:${item.id}` : `link:${item.bookmark.id}`
}

export function folderHasChildren(folders: FlatFolder[], bookmarks: Bookmark[], folderId: string) {
  const hasSubfolders = folders.some((f) => (f.parent_id || null) === folderId)
  const hasLinks = bookmarks.some((b) => (b.folder_id || null) === folderId)
  return hasSubfolders || hasLinks
}
