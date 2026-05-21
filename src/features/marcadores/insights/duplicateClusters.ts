import { normalizeUrlDedupeKey } from "@/lib/url-normalize"

import type { Bookmark } from "../utils/types"

export type DuplicateCluster = {
  key: string
  ids: string[]
}

/** Cuenta grupos con URL duplicada sin materializar el array completo. */
export function countDuplicateClusters(bookmarks: Bookmark[]): number {
  const counts = new Map<string, number>()
  let clusters = 0
  for (const b of bookmarks) {
    const k = normalizeUrlDedupeKey(b.url || "") || `_invalid:${b.id}`
    const next = (counts.get(k) ?? 0) + 1
    counts.set(k, next)
    if (next === 2) clusters++
  }
  return clusters
}

export function buildDuplicateClusters(bookmarks: Bookmark[]): DuplicateCluster[] {
  const groups = new Map<string, string[]>()
  for (const b of bookmarks) {
    const k = normalizeUrlDedupeKey(b.url || "") || `_invalid:${b.id}`
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(b.id)
  }

  const out: DuplicateCluster[] = []
  for (const [key, ids] of groups) {
    if (ids.length > 1) out.push({ key, ids })
  }
  out.sort((a, b) => b.ids.length - a.ids.length)
  return out
}
