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

function topCountsFromMap(map: Map<string, number>, limit: number): StatCountRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

function buildFolderChildrenIndex(folders: FlatFolder[]): Map<string, string[]> {
  const children = new Map<string, string[]>()
  for (const f of folders) {
    if (!f.parent_id) continue
    const list = children.get(f.parent_id)
    if (list) list.push(f.id)
    else children.set(f.parent_id, [f.id])
  }
  return children
}

function descendantFolderIds(children: Map<string, string[]>, rootId: string): Set<string> {
  const out = new Set<string>([rootId])
  const stack = [rootId]
  while (stack.length > 0) {
    const id = stack.pop()!
    for (const kid of children.get(id) ?? []) {
      if (!out.has(kid)) {
        out.add(kid)
        stack.push(kid)
      }
    }
  }
  return out
}

function folderDepth(byId: Map<string, FlatFolder>, id: string): number {
  let depth = 0
  let cur = byId.get(id)
  while (cur?.parent_id) {
    depth++
    cur = byId.get(cur.parent_id)
  }
  return depth
}

export function computeEstadisticas(bookmarks: Bookmark[], folders: FlatFolder[]): EstadisticasSnapshot {
  const active: Bookmark[] = []
  const archived: Bookmark[] = []
  const hostById = new Map<string, string | null>()
  const domainCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()
  const tagSet = new Set<string>()
  const monthCounts = new Map<string, number>()
  const linksByFolder = new Map<string | null, number>()

  let favorites = 0
  let neverOpened = 0
  let staleCount = 0
  const staleCutoff = monthsAgoDate(STALE_MONTHS)

  for (const b of bookmarks) {
    if (b.archived_at) {
      archived.push(b)
      continue
    }
    active.push(b)

    const d = deriveBookmarkFields(b)
    hostById.set(b.id, d.host)
    const hostLabel = d.host ?? "(sin dominio)"
    domainCounts.set(hostLabel, (domainCounts.get(hostLabel) ?? 0) + 1)

    const fid = b.folder_id ?? null
    linksByFolder.set(fid, (linksByFolder.get(fid) ?? 0) + 1)

    for (const t of b.tags ?? []) {
      const n = String(t).trim()
      if (!n) continue
      tagSet.add(n)
      tagCounts.set(n, (tagCounts.get(n) ?? 0) + 1)
    }

    if (b.is_favorite) favorites++

    const opens = b.open_count ?? 0
    if (opens === 0) neverOpened++
    if (isStaleBookmark(b, staleCutoff)) staleCount++

    const raw = b.created_at
    if (raw) {
      const date = new Date(raw)
      if (!Number.isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
      }
    }
  }

  const looseRoot = linksByFolder.get(null) ?? 0
  const folderChildren = buildFolderChildrenIndex(folders)
  const byId = new Map(folders.map((f) => [f.id, f]))
  const subtreeLinkCache = new Map<string, number>()

  const countSubtreeLinks = (folderId: string): number => {
    const cached = subtreeLinkCache.get(folderId)
    if (cached !== undefined) return cached
    const ids = descendantFolderIds(folderChildren, folderId)
    let n = 0
    for (const fid of ids) {
      n += linksByFolder.get(fid) ?? 0
    }
    subtreeLinkCache.set(folderId, n)
    return n
  }

  const rootFolderCounts = new Map<string, number>()
  for (const rf of folders) {
    if (rf.parent_id) continue
    rootFolderCounts.set(rf.name, countSubtreeLinks(rf.id))
  }
  if (looseRoot > 0) {
    rootFolderCounts.set("(raíz, sin carpeta)", looseRoot)
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

  const bookmarkRow = (b: Bookmark, subtitle?: string, meta?: string): StatBookmarkRow => ({
    id: b.id,
    title: b.title || b.url || "Sin título",
    subtitle: subtitle ?? hostById.get(b.id) ?? undefined,
    meta,
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
    .map((b) => bookmarkRow(b, hostById.get(b.id) ?? undefined, `${b.open_count ?? 0} aperturas`))

  const dupClusters = buildDuplicateClusters(active)
  const duplicates: StatDuplicateGroup[] = dupClusters.slice(0, LIST_CAP).map((c) => {
    const titles = c.ids.map((id) => active.find((b) => b.id === id)?.title).filter((t): t is string => Boolean(t))
    return { key: c.key, count: c.ids.length, sampleTitles: titles.slice(0, 3) }
  })

  const emptyFolderCount = folders.filter((f) => countSubtreeLinks(f.id) === 0).length
  const depthByFolder = folders.map((f) => ({
    name: f.name,
    depth: folderDepth(byId, f.id) + 1,
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
      normal: active.length - favorites,
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
      emptyFolderCount,
      linksAtRoot: looseRoot,
      deepestFolders,
    },
  }
}
