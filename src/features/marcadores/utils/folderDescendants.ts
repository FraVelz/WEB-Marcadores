import type { FlatFolder } from "@/features/marcadores/utils/types"

/** Todas las carpetas en el subárbol de `folderId`, incluida esa id. */
export function collectFolderSubtreeIds(folders: FlatFolder[], folderId: string): Set<string> {
  const ids = new Set<string>()
  const stack = [folderId]
  while (stack.length > 0) {
    const id = stack.pop()
    if (id === undefined) break
    ids.add(id)
    for (const f of folders) {
      if ((f.parent_id ?? null) === id) stack.push(f.id)
    }
  }
  return ids
}
