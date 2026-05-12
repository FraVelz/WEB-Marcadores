import type { Folder } from "@/contexts/DashboardContext"

export function findFolderInTree(folders: Folder[], id: string): Folder | undefined {
  for (const f of folders) {
    if (f.id === id) return f
    if (f.children) {
      const found = findFolderInTree(f.children, id)
      if (found) return found
    }
  }
  return undefined
}

export function folderHasChildren(folders: Folder[], id: string): boolean {
  const f = findFolderInTree(folders, id)
  return !!f?.children?.length
}

export function flattenTree(folders: Folder[], collapsedIds: Set<string>): (string | null)[] {
  const result: (string | null)[] = [null]
  const add = (items: Folder[]) => {
    for (const f of items) {
      result.push(f.id)
      if (f.children && f.children.length > 0 && !collapsedIds.has(f.id)) {
        add(f.children)
      }
    }
  }
  add(folders)
  return result
}

export const navItems = [
  { href: "/marcadores", label: "Marcadores" },
  { href: "/atajos", label: "Atajos" },
  { href: "/perfil", label: "Perfil" },
]

export function mobileTitle(pathname: string): string {
  const hit = navItems.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
  return hit?.label ?? "Marcadores"
}
