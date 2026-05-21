import type { FlatFolder } from "./types"

/** Carpetas agrupadas por `parent_id`, ordenadas por `sort_order`. */
export function buildFoldersByParentIndex(folders: FlatFolder[]): Map<string | null, FlatFolder[]> {
  const map = new Map<string | null, FlatFolder[]>()
  for (const f of folders) {
    const pid = f.parent_id ?? null
    const list = map.get(pid)
    if (list) list.push(f)
    else map.set(pid, [f])
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order)
  }
  return map
}
