import {
  buildSearchResultGridItems,
  filterBookmarksBySearch,
  type BookmarkSearchOptions,
} from "@/features/marcadores/utils/bookmarkSearch"
import type { Bookmark, FlatFolder, GridItem } from "@/features/marcadores/utils/types"

/** @deprecated Usar bookmarkSearch.ts directamente. Mantenido para compatibilidad interna. */
export function filterBookmarksForDeskPane(
  bookmarksVisible: Bookmark[],
  derivedRows: { b: Bookmark; d: import("@/features/marcadores/views/bookmarkDerived").DerivedBookmarkFields }[],
  searchValue: string,
  searchInSubfolders: boolean,
  searchInDescription: boolean,
  currentFolderId: string | null,
  folders: FlatFolder[]
): Bookmark[] {
  const opts: BookmarkSearchOptions = {
    query: searchValue,
    folderId: currentFolderId,
    folders,
    searchInSubfolders,
    searchInDescription,
  }
  return filterBookmarksBySearch(bookmarksVisible, derivedRows, opts)
}

/** @deprecated Usar buildSearchResultGridItems. */
export function buildDeskPaneGridItems(
  folders: FlatFolder[],
  filteredBookmarks: Bookmark[],
  searchValue: string,
  searchInSubfolders: boolean,
  searchInDescription: boolean,
  selectedFolderId: string | null
): GridItem[] {
  return buildSearchResultGridItems(folders, filteredBookmarks, {
    query: searchValue,
    folderId: selectedFolderId,
    folders,
    searchInSubfolders,
    searchInDescription,
  })
}
