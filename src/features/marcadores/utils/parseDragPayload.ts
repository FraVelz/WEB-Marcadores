import type { GridItem } from "./types"

export const BOOKMARK_DRAG_MIME_TYPE = "application/x-bookmark-item"

export function isBookmarkDragTransfer(dt: DataTransfer): boolean {
  return [...dt.types].includes(BOOKMARK_DRAG_MIME_TYPE)
}

export function parseBookmarkDragPayload(raw: string): GridItem | null {
  try {
    const payload = JSON.parse(raw) as {
      type?: string
      id?: string
      name?: string
      bookmark?: { id?: string; url?: string }
    }
    if (payload?.type === "folder" && typeof payload.id === "string") {
      return {
        type: "folder",
        id: payload.id,
        folderId: payload.id,
        label: typeof payload.name === "string" ? payload.name : "",
      }
    }
    if (
      payload?.type === "link" &&
      payload.bookmark &&
      typeof payload.bookmark.id === "string" &&
      typeof payload.bookmark.url === "string"
    ) {
      return {
        type: "link",
        bookmark: {
          id: payload.bookmark.id,
          title: "",
          url: payload.bookmark.url,
          folder_id: null,
        },
      }
    }
    return null
  } catch {
    return null
  }
}
