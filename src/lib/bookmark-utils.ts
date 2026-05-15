type FlatFolder = { id: string; parent_id: string | null; name: string; sort_order: number }

export function buildFolderOptions(folders: FlatFolder[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = []

  const add = (parentId: string | null, prefix: string) => {
    const children = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)

    for (const f of children) {
      const label = prefix ? `${prefix} › ${f.name}` : f.name
      result.push({ id: f.id, label })

      add(f.id, label)
    }
  }

  add(null, "")
  return result
}

export function getFaviconUrl(url: string): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
  } catch {
    return ""
  }
}

export function getFolderPathLabel(folders: FlatFolder[], folderId: string | null): string {
  if (!folderId) return "Raíz"

  const path: string[] = []
  const byId = new Map(folders.map((f) => [f.id, f]))
  let current = byId.get(folderId)

  while (current) {
    path.unshift(current.name)
    current = current.parent_id ? (byId.get(current.parent_id) ?? undefined) : undefined
  }

  return path.join(" › ") || "Raíz"
}
