import type { ElementDragPayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import type { GridItem } from "@/features/marcadores/utils/types"

export const BOOKMARK_DRAG_TYPE = "bookmark-item" as const

export type BookmarkDragData = {
  bookmarkDragType: typeof BOOKMARK_DRAG_TYPE
  itemKind: "folder" | "link"
  folderId?: string
  folderName?: string
  bookmarkId?: string
  bookmarkUrl?: string
}

export type BookmarkDropTargetData = {
  bookmarkDropTarget: true
  targetFolderId?: string | null
}

export function gridItemToDragData(item: GridItem): BookmarkDragData {
  if (item.type === "folder") {
    return {
      bookmarkDragType: BOOKMARK_DRAG_TYPE,
      itemKind: "folder",
      folderId: item.id,
      folderName: item.label,
    }
  }

  return {
    bookmarkDragType: BOOKMARK_DRAG_TYPE,
    itemKind: "link",
    bookmarkId: item.bookmark.id,
    bookmarkUrl: item.bookmark.url,
  }
}

export function dragDataToGridItem(data: Record<string, unknown>): GridItem | null {
  if (data.bookmarkDragType !== BOOKMARK_DRAG_TYPE) return null

  if (data.itemKind === "folder" && typeof data.folderId === "string") {
    return {
      type: "folder",
      id: data.folderId,
      folderId: data.folderId,
      label: typeof data.folderName === "string" ? data.folderName : "",
    }
  }

  if (
    data.itemKind === "link" &&
    typeof data.bookmarkId === "string" &&
    typeof data.bookmarkUrl === "string"
  ) {
    return {
      type: "link",
      bookmark: {
        id: data.bookmarkId,
        title: "",
        url: data.bookmarkUrl,
        folder_id: null,
      },
    }
  }

  return null
}

export function isBookmarkDragData(data: Record<string, unknown>): data is BookmarkDragData {
  return data.bookmarkDragType === BOOKMARK_DRAG_TYPE
}

export function isBookmarkDragSource(source: Pick<ElementDragPayload, "data">): boolean {
  return isBookmarkDragData(source.data)
}

export function readDropTargetFolderId(data: Record<string, unknown>): string | null | undefined {
  if (data.bookmarkDropTarget !== true) return undefined
  if (!("targetFolderId" in data)) return undefined
  const value = data.targetFolderId
  if (value === null) return null
  if (typeof value === "string") return value
  return undefined
}
