import { daysLeftInTrash, trashPurgeAt } from "./constants"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Bookmark, FlatFolder, TrashItem } from "@/features/marcadores/utils/types"

export async function listBookmarks(
  userId: string,
  opts: {
    folderId?: string | null
    tag?: string
    q?: string
    limit?: number
    offset?: number
  } = {}
): Promise<Bookmark[]> {
  const rows = await searchBookmarks(userId, {
    q: opts.q,
    tag: opts.tag,
    folderId: opts.folderId,
    limit: 10_000,
  })
  const offset = Math.max(opts.offset ?? 0, 0)
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  return rows.slice(offset, offset + limit)
}

export async function listFolders(userId: string): Promise<FlatFolder[]> {
  return listAliveFolders(userId)
}

export async function listAliveBookmarks(userId: string): Promise<Bookmark[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("title")
  if (error) throw error
  return (data ?? []) as Bookmark[]
}

export async function listAliveFolders(userId: string): Promise<FlatFolder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("sort_order")
  if (error) throw error
  return (data ?? []) as FlatFolder[]
}

export async function searchBookmarks(
  userId: string,
  opts: { q?: string; tag?: string; folderId?: string | null; limit?: number }
): Promise<Bookmark[]> {
  let rows = await listAliveBookmarks(userId)
  if (opts.folderId !== undefined) {
    rows = rows.filter((b) => (b.folder_id ?? null) === (opts.folderId || null))
  }
  if (opts.tag) {
    const tag = opts.tag.toLowerCase()
    rows = rows.filter((b) => (b.tags ?? []).some((t) => t.toLowerCase() === tag))
  }
  if (opts.q?.trim()) {
    const q = opts.q.trim().toLowerCase()
    rows = rows.filter((b) => {
      const hay = [b.title, b.url, b.description ?? "", ...(b.tags ?? [])].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  return rows.slice(0, limit)
}

export async function getBookmark(userId: string, id: string): Promise<Bookmark | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()
  if (error) throw error
  return (data as Bookmark) ?? null
}

export async function getFolder(userId: string, id: string): Promise<FlatFolder | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()
  if (error) throw error
  return (data as FlatFolder) ?? null
}

export async function listTags(userId: string): Promise<Array<{ tag: string; count: number }>> {
  const bookmarks = await listAliveBookmarks(userId)
  const counts = new Map<string, number>()
  for (const b of bookmarks) {
    for (const t of b.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export async function getStats(userId: string) {
  const [bookmarks, folders] = await Promise.all([listAliveBookmarks(userId), listAliveFolders(userId)])
  return {
    bookmarks: bookmarks.length,
    folders: folders.length,
    favorites: bookmarks.filter((b) => b.is_favorite).length,
    archived: bookmarks.filter((b) => b.archived_at).length,
  }
}

export async function listTrash(userId: string): Promise<TrashItem[]> {
  const admin = createAdminClient()
  const [{ data: bookmarks }, { data: folders }] = await Promise.all([
    admin
      .from("bookmarks")
      .select("id, title, url, deleted_at, deleted_batch_id")
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    admin
      .from("folders")
      .select("id, name, deleted_at, deleted_batch_id")
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ])

  const items: TrashItem[] = []
  for (const b of bookmarks ?? []) {
    if (!b.deleted_at) continue
    items.push({
      type: "bookmark",
      id: b.id,
      title: b.title,
      url: b.url,
      deleted_at: b.deleted_at,
      deleted_batch_id: b.deleted_batch_id ?? null,
      purge_at: trashPurgeAt(b.deleted_at).toISOString(),
      days_left: daysLeftInTrash(b.deleted_at),
    })
  }
  for (const f of folders ?? []) {
    if (!f.deleted_at) continue
    items.push({
      type: "folder",
      id: f.id,
      name: f.name,
      deleted_at: f.deleted_at,
      deleted_batch_id: f.deleted_batch_id ?? null,
      purge_at: trashPurgeAt(f.deleted_at).toISOString(),
      days_left: daysLeftInTrash(f.deleted_at),
    })
  }
  return items.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at))
}

export function folderPath(
  folders: FlatFolder[],
  folderId: string | null | undefined
): Array<{ id: string | null; name: string }> {
  const byId = new Map(folders.map((f) => [f.id, f]))
  const path: Array<{ id: string | null; name: string }> = []
  let cur: string | null = folderId ?? null
  const guard = new Set<string>()
  while (cur && !guard.has(cur)) {
    guard.add(cur)
    const f = byId.get(cur)
    if (!f) break
    path.unshift({ id: f.id, name: f.name })
    cur = f.parent_id
  }
  path.unshift({ id: null, name: "Root" })
  return path
}
