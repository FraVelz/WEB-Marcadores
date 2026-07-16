import type { Bookmark, FlatFolder } from "./types"

export type TreeMeasureRow = { kind: "folder" | "link"; id: string; depth: number }

/**
 * Same walk shape as `useMarcadoresTreeDerived` treeFlatRows (no collapse).
 * Used for C3-1 node-count / flatten timing evidence.
 */
export function flattenTreeRows(
  folders: FlatFolder[],
  bookmarks: Pick<Bookmark, "id" | "folder_id" | "title">[],
  collapsedIds: ReadonlySet<string> = new Set()
): TreeMeasureRow[] {
  const result: TreeMeasureRow[] = []
  const walk = (parentId: string | null, depth: number) => {
    const subfolders = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
    const links = bookmarks
      .filter((b) => (b.folder_id || null) === parentId)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    for (const f of subfolders) {
      result.push({ kind: "folder", id: f.id, depth })
      if (!collapsedIds.has(f.id)) walk(f.id, depth + 1)
    }
    for (const b of links) {
      result.push({ kind: "link", id: b.id, depth })
    }
  }
  walk(null, 0)
  return result
}

/** Synthetic library: ~10% folders as root buckets, rest links. */
export function makeSyntheticLibrary(nodeTarget: number): {
  folders: FlatFolder[]
  bookmarks: Bookmark[]
  nodeCount: number
} {
  const bucketCount = Math.max(1, Math.floor(nodeTarget / 50))
  const folders: FlatFolder[] = []
  for (let i = 0; i < bucketCount; i++) {
    folders.push({
      id: `f-${i}`,
      parent_id: null,
      name: `Folder ${i}`,
      sort_order: i,
    })
  }
  const linkCount = Math.max(0, nodeTarget - bucketCount)
  const bookmarks: Bookmark[] = []
  for (let i = 0; i < linkCount; i++) {
    bookmarks.push({
      id: `b-${i}`,
      title: `Bookmark ${i}`,
      url: `https://example.com/${i}`,
      folder_id: `f-${i % bucketCount}`,
      created_at: "2026-01-01T00:00:00.000Z",
      tags: [],
    })
  }
  return { folders, bookmarks, nodeCount: folders.length + bookmarks.length }
}

export type FlattenBenchmark = {
  nodeCount: number
  rowCount: number
  avgMs: number
  iterations: number
}

export function benchmarkFlatten(nodeTarget: number, iterations = 40): FlattenBenchmark {
  const { folders, bookmarks, nodeCount } = makeSyntheticLibrary(nodeTarget)
  let rowCount = 0
  const t0 = performance.now()
  for (let i = 0; i < iterations; i++) {
    rowCount = flattenTreeRows(folders, bookmarks).length
  }
  const avgMs = (performance.now() - t0) / iterations
  return { nodeCount, rowCount, avgMs, iterations }
}
