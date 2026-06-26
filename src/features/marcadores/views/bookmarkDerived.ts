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

function textContainsQuery(text: string, q: string): boolean {
  return text.indexOf(q) !== -1
}

export type BookmarkMatchFields = {
  title: boolean
  url: boolean
  description: boolean
  tags: boolean
}

/** Qué campos contienen la query (para resaltado y snippet de descripción). */
export function bookmarkMatchedFields(
  d: DerivedBookmarkFields,
  q: string,
  includeDescription: boolean
): BookmarkMatchFields {
  const title = textContainsQuery(d.lowerTitle, q)
  const url = textContainsQuery(d.lowerUrl, q) || (d.host !== null && textContainsQuery(d.host, q))
  let tags = false
  for (const tag of d.tagSetLower) {
    if (textContainsQuery(tag, q)) {
      tags = true
      break
    }
  }
  const description = includeDescription && textContainsQuery(d.lowerDesc, q)
  return { title, url, description, tags }
}

/** Búsqueda en título, URL, tags y opcionalmente descripción. */
export function bookmarkDerivedMatchesSearchQuery(
  d: DerivedBookmarkFields,
  q: string,
  options?: { includeDescription?: boolean }
): boolean {
  const includeDescription = options?.includeDescription ?? true
  const fields = bookmarkMatchedFields(d, q, includeDescription)
  return fields.title || fields.url || fields.tags || fields.description
}
