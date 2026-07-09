import { buildMarcadoresFlatList, sortBookmarksByOrder } from "@/features/marcadores/hooks/useMarcadoresData"
import {
  bookmarkDerivedMatchesSearchQuery,
  bookmarkMatchedFields,
  deriveBookmarkFields,
  type BookmarkMatchFields,
  type DerivedBookmarkFields,
} from "@/features/marcadores/views/bookmarkDerived"
import { collectFolderSubtreeIds } from "@/features/marcadores/utils/folderDescendants"
import type { BookmarkSortOrder } from "@/features/marcadores/state/libraryPaneUiState"
import type { Bookmark, FlatFolder, GridItem } from "@/features/marcadores/utils/types"
import { getFolderPath } from "@/features/marcadores/utils/utils"

export type BookmarkSearchOptions = {
  query: string
  folderId: string | null
  folders: FlatFolder[]
  searchInSubfolders: boolean
  searchInDescription: boolean
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

function folderPathCaption(folders: FlatFolder[], folderId: string | null | undefined): string {
  const id = folderId ?? null
  if (!id) return "Marcadores"
  return getFolderPath(folders, id)
    .map((p) => p.label)
    .join(" › ")
}

function resolveFolderScopeIds(
  folders: FlatFolder[],
  folderId: string | null,
  searchInSubfolders: boolean
): Set<string | null> {
  if (!searchInSubfolders) {
    return new Set([folderId])
  }
  if (folderId === null) {
    return new Set([null, ...folders.map((f) => f.id)])
  }
  return collectFolderSubtreeIds(folders, folderId)
}

function bookmarkInFolderScope(bookmark: Bookmark, scope: Set<string | null>): boolean {
  const fid = bookmark.folder_id ?? null
  return scope.has(fid)
}

export function isScopedSearchResultsActive(opts: BookmarkSearchOptions): boolean {
  return normalizeQuery(opts.query) !== "" && opts.searchInSubfolders
}

type DerivedRow = { b: Bookmark; d: DerivedBookmarkFields }

function matchRow(row: DerivedRow, q: string, includeDescription: boolean): boolean {
  return bookmarkDerivedMatchesSearchQuery(row.d, q, { includeDescription })
}

export function filterBookmarksBySearch(
  bookmarks: Bookmark[],
  derivedRows: DerivedRow[],
  opts: BookmarkSearchOptions
): Bookmark[] {
  const q = normalizeQuery(opts.query)
  if (!q) return bookmarks

  const scope = resolveFolderScopeIds(opts.folders, opts.folderId, opts.searchInSubfolders)

  const matched: Bookmark[] = []
  for (const row of derivedRows) {
    if (!bookmarkInFolderScope(row.b, scope)) continue
    if (matchRow(row, q, opts.searchInDescription)) matched.push(row.b)
  }
  return matched
}

export function buildSearchResultGridItems(
  folders: FlatFolder[],
  filteredBookmarks: Bookmark[],
  opts: BookmarkSearchOptions,
  bookmarkSort: BookmarkSortOrder = "title"
): GridItem[] {
  const qNorm = normalizeQuery(opts.query)

  if (qNorm === "") {
    return buildMarcadoresFlatList(folders, filteredBookmarks, opts.folderId, bookmarkSort)
  }

  if (opts.searchInSubfolders) {
    return sortBookmarksByOrder(filteredBookmarks, bookmarkSort).map((b) => ({
      type: "link" as const,
      bookmark: b,
      locationLabel: folderPathCaption(folders, b.folder_id),
    }))
  }

  return buildMarcadoresFlatList(folders, filteredBookmarks, opts.folderId, bookmarkSort)
}

export function getBookmarkMatchFields(
  bookmark: Bookmark,
  query: string,
  searchInDescription: boolean
): BookmarkMatchFields | null {
  const q = normalizeQuery(query)
  if (!q) return null
  const d = deriveBookmarkFields(bookmark)
  return bookmarkMatchedFields(d, q, searchInDescription)
}

/** Extracto de descripción alrededor del match (solo si el match fue en descripción). */
export function descriptionMatchSnippet(
  description: string | undefined | null,
  query: string,
  radius = 40
): string | null {
  const q = normalizeQuery(query)
  if (!q || !description) return null
  const lower = description.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return null
  const start = Math.max(0, idx - radius)
  const end = Math.min(description.length, idx + q.length + radius)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < description.length ? "…" : ""
  return `${prefix}${description.slice(start, end)}${suffix}`
}

export function shouldShowDescriptionSnippet(bookmark: Bookmark, matchFields: BookmarkMatchFields | null): boolean {
  if (!matchFields?.description) return false
  return !matchFields.title && !matchFields.url && !matchFields.tags
}
