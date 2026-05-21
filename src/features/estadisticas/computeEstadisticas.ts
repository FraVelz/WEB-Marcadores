import { buildDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"
import { deriveBookmarkFields } from "@/features/marcadores/views/bookmarkDerived"
import type { Bookmark, FlatFolder } from "@/features/marcadores/utils/types"

export type StatCountRow = { label: string; value: number; hint?: string }

export type StatBookmarkRow = {
  id: string
  title: string
  subtitle?: string
  meta?: string
}

export type StatDuplicateGroup = {
  key: string
  count: number
  sampleTitles: string[]
}

export type EstadisticasSnapshot = {
  kpis: {
    totalLinks: number
    totalFolders: number
    uniqueTags: number
    favorites: number
    archived: number
    neverOpened: number
    duplicateClusters: number
    staleCount: number
  }
  statusBreakdown: { normal: number; favorite: number; archived: number }
  topDomains: StatCountRow[]
  topRootFolders: StatCountRow[]
  topTags: StatCountRow[]
  mostOpened: StatBookmarkRow[]
  createdByMonth: StatCountRow[]
  neverOpened: StatBookmarkRow[]
  noTags: StatBookmarkRow[]
  stale: StatBookmarkRow[]
  duplicates: StatDuplicateGroup[]
  tree: {
    maxDepth: number
    emptyFolderCount: number
    linksAtRoot: number
    deepestFolders: StatCountRow[]
  }
}

const STALE_MONTHS = 6
const TOP_N = 12
const LIST_CAP = 15

function monthsAgoDate(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

function isStaleBookmark(b: Bookmark, cutoff: Date): boolean {
  if ((b.open_count ?? 0) === 0) return true
  if (!b.opened_at) return true
  return new Date(b.opened_at) <= cutoff
}

function bookmarkRow(b: Bookmark, subtitle?: string, meta?: string): StatBookmarkRow {
  const host = deriveBookmarkFields(b).host
  return {
    id: b.id,
    title: b.title || b.url || "Sin título",
    subtitle: subtitle ?? host ?? undefined,
    meta,
  }
}

function topCountsFromMap(map: Map<string, number>, limit: number): StatCountRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

function folderDepth(folders: FlatFolder[], id: string): number {
  const byId = new Map(folders.map((f) => [f.id, f]))
  let depth = 0
  let cur = byId.get(id)
  while (cur?.parent_id) {
    depth++
    cur = byId.get(cur.parent_id)
  }
  return depth
}

function descendantFolderIds(folders: FlatFolder[], rootId: string): Set<string> {
  const out = new Set<string>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const f of folders) {
      if (f.parent_id && out.has(f.parent_id) && !out.has(f.id)) {
        out.add(f.id)
        changed = true
      }
    }
  }
  return out
}

function countLinksInFolderSubtree(activeBookmarks: Bookmark[], folders: FlatFolder[], folderId: string): number {
  const ids = descendantFolderIds(folders, folderId)
  return activeBookmarks.filter((b) => b.folder_id && ids.has(b.folder_id)).length
}

function folderHasAnyLinks(activeBookmarks: Bookmark[], folders: FlatFolder[], folderId: string): boolean {
  return countLinksInFolderSubtree(activeBookmarks, folders, folderId) > 0
}

export function computeEstadisticas(bookmarks: Bookmark[], folders: FlatFolder[]): EstadisticasSnapshot {
  const active = bookmarks.filter((b) => !b.archived_at)
  const archived = bookmarks.filter((b) => b.archived_at)
  const staleCutoff = monthsAgoDate(STALE_MONTHS)

  const tagSet = new Set<string>()
  for (const b of active) {
    for (const t of b.tags ?? []) {
      const n = String(t).trim()
      if (n) tagSet.add(n)
    }
  }

  const domainCounts = new Map<string, number>()
  for (const b of active) {
    const host = deriveBookmarkFields(b).host ?? "(sin dominio)"
    domainCounts.set(host, (domainCounts.get(host) ?? 0) + 1)
  }

  const rootFolders = folders.filter((f) => !f.parent_id)
  const rootFolderCounts = new Map<string, number>()
  for (const rf of rootFolders) {
    rootFolderCounts.set(rf.name, countLinksInFolderSubtree(active, folders, rf.id))
  }
  const looseRoot = active.filter((b) => !b.folder_id).length
  if (looseRoot > 0) {
    rootFolderCounts.set("(raíz, sin carpeta)", looseRoot)
  }

  const tagCounts = new Map<string, number>()
  for (const b of active) {
    for (const t of b.tags ?? []) {
      const n = String(t).trim()
      if (!n) continue
      tagCounts.set(n, (tagCounts.get(n) ?? 0) + 1)
    }
  }

  const monthCounts = new Map<string, number>()
  for (const b of bookmarks) {
    const raw = b.created_at
    if (!raw) continue
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
  }
  const createdByMonth = [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([label, value]) => {
      const [y, m] = label.split("-")
      const monthLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es", {
        month: "short",
        year: "numeric",
      })
      return { label: monthLabel, value, hint: label }
    })

  const neverOpenedList = active
    .filter((b) => (b.open_count ?? 0) === 0)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    .slice(0, LIST_CAP)
    .map((b) => bookmarkRow(b))

  const noTagsList = active
    .filter((b) => !(b.tags?.length ?? 0))
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    .slice(0, LIST_CAP)
    .map((b) => bookmarkRow(b))

  const staleList = active
    .filter((b) => isStaleBookmark(b, staleCutoff))
    .sort((a, b) => {
      const ta = a.opened_at ? new Date(a.opened_at).getTime() : 0
      const tb = b.opened_at ? new Date(b.opened_at).getTime() : 0
      return ta - tb
    })
    .slice(0, LIST_CAP)
    .map((b) => {
      const opens = b.open_count ?? 0
      const meta =
        opens === 0
          ? "Nunca abierto"
          : b.opened_at
            ? `Última: ${new Date(b.opened_at).toLocaleDateString("es")}`
            : undefined
      return bookmarkRow(b, undefined, meta)
    })

  const mostOpened = [...active]
    .filter((b) => (b.open_count ?? 0) > 0)
    .sort((a, b) => (b.open_count ?? 0) - (a.open_count ?? 0))
    .slice(0, LIST_CAP)
    .map((b) => bookmarkRow(b, deriveBookmarkFields(b).host ?? undefined, `${b.open_count ?? 0} aperturas`))

  const dupClusters = buildDuplicateClusters(active)
  const duplicates: StatDuplicateGroup[] = dupClusters.slice(0, LIST_CAP).map((c) => {
    const titles = c.ids.map((id) => active.find((b) => b.id === id)?.title).filter((t): t is string => Boolean(t))
    return { key: c.key, count: c.ids.length, sampleTitles: titles.slice(0, 3) }
  })

  const favorites = active.filter((b) => b.is_favorite).length
  const neverOpened = active.filter((b) => (b.open_count ?? 0) === 0).length
  const staleCount = active.filter((b) => isStaleBookmark(b, staleCutoff)).length

  const emptyFolders = folders.filter((f) => !folderHasAnyLinks(active, folders, f.id))
  const depthByFolder = folders.map((f) => ({
    name: f.name,
    depth: folderDepth(folders, f.id) + 1,
  }))
  const maxDepth = depthByFolder.reduce((m, x) => Math.max(m, x.depth), 0)
  const deepestFolders = [...depthByFolder]
    .sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name))
    .slice(0, 6)
    .map((x) => ({ label: x.name, value: x.depth, hint: "niveles" }))

  return {
    kpis: {
      totalLinks: active.length,
      totalFolders: folders.length,
      uniqueTags: tagSet.size,
      favorites,
      archived: archived.length,
      neverOpened,
      duplicateClusters: dupClusters.length,
      staleCount,
    },
    statusBreakdown: {
      normal: active.filter((b) => !b.is_favorite).length,
      favorite: favorites,
      archived: archived.length,
    },
    topDomains: topCountsFromMap(domainCounts, TOP_N),
    topRootFolders: topCountsFromMap(rootFolderCounts, TOP_N).filter((r) => r.value > 0),
    topTags: topCountsFromMap(tagCounts, TOP_N),
    mostOpened,
    createdByMonth,
    neverOpened: neverOpenedList,
    noTags: noTagsList,
    stale: staleList,
    duplicates,
    tree: {
      maxDepth,
      emptyFolderCount: emptyFolders.length,
      linksAtRoot: looseRoot,
      deepestFolders,
    },
  }
}
