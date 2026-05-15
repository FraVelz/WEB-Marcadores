import type { FlatFolder } from "@/features/marcadores/utils/types"

import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { Bookmark } from "@/features/marcadores/utils/types"

/** Árbol plano para la vista árbol; respeta carpetas colapsadas por ventana. */
export function buildMarcadoresTreeFlatRows(
  folders: FlatFolder[],
  filteredBookmarks: Bookmark[],
  treeCollapsedIds: Set<string>
): TreeFlatRow[] {
  const result: TreeFlatRow[] = []
  const walk = (parentId: string | null, depth: number) => {
    const subfolders = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
    const links = filteredBookmarks
      .filter((b) => (b.folder_id || null) === parentId)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    for (const f of subfolders) {
      result.push({
        item: { type: "folder", id: f.id, folderId: f.id, label: f.name },
        depth,
      })
      if (!treeCollapsedIds.has(f.id)) walk(f.id, depth + 1)
    }
    for (const b of links) {
      result.push({ item: { type: "link", bookmark: b }, depth })
    }
  }
  walk(null, 0)
  return result
}
