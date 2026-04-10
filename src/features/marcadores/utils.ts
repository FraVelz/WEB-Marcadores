import type { Folder } from "@/contexts/DashboardContext"
import type { FlatFolder } from "./types"

export function buildFolderTree(folders: FlatFolder[]): Folder[] {
  const byParent: Record<string, Folder[]> = {}
  for (const f of folders) {
    const pid = f.parent_id || "root"
    if (!byParent[pid]) byParent[pid] = []
    byParent[pid].push({ ...f, children: [] })
  }
  const build = (parentId: string): Folder[] =>
    (byParent[parentId] || []).sort((a, b) => a.sort_order - b.sort_order).map((f) => ({ ...f, children: build(f.id) }))
  return build("root")
}

export function getFavicon(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
  } catch {
    return ""
  }
}

export function getFolderPath(
  folders: FlatFolder[],
  selectedFolderId: string | null
): { id: string | null; label: string }[] {
  const path: { id: string | null; label: string }[] = [{ id: null, label: "Marcadores" }]
  if (!selectedFolderId) return path
  let current = folders.find((f) => f.id === selectedFolderId)
  const chain: { id: string; label: string }[] = []
  while (current) {
    chain.unshift({ id: current.id, label: current.name })
    current = current.parent_id ? folders.find((f) => f.id === current!.parent_id) : undefined
  }
  return [...path, ...chain]
}

export function isFolderDescendant(folders: FlatFolder[], folderId: string, potentialAncestorId: string): boolean {
  if (folderId === potentialAncestorId) return true
  const folder = folders.find((f) => f.id === folderId)
  if (!folder?.parent_id) return false
  return isFolderDescendant(folders, folder.parent_id, potentialAncestorId)
}
