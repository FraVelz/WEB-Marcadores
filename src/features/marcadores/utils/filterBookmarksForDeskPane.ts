import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import { buildMarcadoresFlatList } from "@/features/marcadores/hooks/useMarcadoresData"
import type { Bookmark, FlatFolder, GridItem } from "@/features/marcadores/utils/types"
import { getFolderPath } from "@/features/marcadores/utils/utils"
import { deriveBookmarkFields } from "@/features/marcadores/views/bookmarkDerived"

function bookmarkMatchesSearch(bookmark: Bookmark, q: string): boolean {
  if (q === "") return true
  const derived = deriveBookmarkFields(bookmark)
  return (
    derived.lowerTitle.includes(q) ||
    derived.lowerDesc.includes(q) ||
    derived.lowerUrl.includes(q) ||
    [...derived.tagSetLower].some((t) => t.includes(q))
  )
}

function folderPathCaption(folders: FlatFolder[], folderId: string | null | undefined): string {
  const id = folderId ?? null
  if (!id) return "Marcadores"
  return getFolderPath(folders, id)
    .map((p) => p.label)
    .join(" › ")
}

/**
 * Texto + ámbito de búsqueda en ventanas de escritorio.
 * `searchLibraryWide`: todos los marcadores visibles; si no, solo la carpeta activa del panel.
 */
export function filterBookmarksForDeskPane(
  bookmarksVisible: Bookmark[],
  searchValue: string,
  searchLibraryWide: boolean,
  currentFolderId: string | null
): Bookmark[] {
  const q = searchValue.trim().toLowerCase()
  let pool: Bookmark[]
  if (q === "") {
    pool = bookmarksVisible
  } else if (searchLibraryWide) {
    pool = bookmarksVisible.filter((b) => bookmarkMatchesSearch(b, q))
  } else {
    pool = bookmarksVisible.filter((b) => (b.folder_id || null) === currentFolderId && bookmarkMatchesSearch(b, q))
  }

  return pool
}

/** Lista de rejilla / árbol para un panel de escritorio (incluye etiquetas de ruta en búsqueda global). */
export function buildDeskPaneGridItems(
  folders: FlatFolder[],
  filteredBookmarks: Bookmark[],
  searchValue: string,
  searchLibraryWide: boolean,
  selectedFolderId: string | null
): GridItem[] {
  const q = searchValue.trim()
  if (searchLibraryWide && q !== "") {
    return filteredBookmarks
      .slice()
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .map((b) => ({
        type: "link" as const,
        bookmark: b,
        locationLabel: folderPathCaption(folders, b.folder_id),
      }))
  }
  return buildMarcadoresFlatList(folders, filteredBookmarks, selectedFolderId, "folder" satisfies BrowseMode)
}
