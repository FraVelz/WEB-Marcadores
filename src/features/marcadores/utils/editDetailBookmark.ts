import type { Bookmark } from "@/features/marcadores/utils/types"

/** Abre el editor del marcador visible en el panel, aunque no esté en la selección múltiple. */
export function editDetailBookmark(
  bookmark: Bookmark | null | undefined,
  openEdit: (bookmark: Bookmark) => void
): void {
  if (!bookmark) return
  openEdit(bookmark)
}
