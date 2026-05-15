import type { Bookmark } from "../utils/types"

export type DerivedBookmarkFields = {
  lowerTitle: string
  lowerDesc: string
  lowerUrl: string
  host: string | null
  tagSetLower: Set<string>
}

export function deriveBookmarkFields(b: Bookmark): DerivedBookmarkFields {
  const tags = b.tags ?? []
  const tagSetLower = new Set(tags.map((t) => String(t).toLowerCase()))

  let host: string | null = null
  try {
    host = new URL(b.url || "").hostname.replace(/^www\./i, "").toLowerCase()
  } catch {
    host = null
  }

  return {
    lowerTitle: String(b.title || "").toLowerCase(),
    lowerDesc: String(b.description || "").toLowerCase(),
    lowerUrl: String(b.url || "").toLowerCase(),
    host,
    tagSetLower,
  }
}
