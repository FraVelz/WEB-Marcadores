import { randomUUID } from "node:crypto"

import { TRASH_RETENTION_DAYS } from "./constants"
import { createAdminClient } from "@/lib/supabase/admin"
import { collectFolderSubtreeIds } from "@/features/marcadores/utils/folderDescendants"
import type { FlatFolder } from "@/features/marcadores/utils/types"

function nowIso() {
  return new Date().toISOString()
}

export async function softDeleteBookmarks(userId: string, ids: string[]): Promise<{ count: number; batchId: string }> {
  if (ids.length === 0) return { count: 0, batchId: "" }
  const batchId = randomUUID()
  const admin = createAdminClient()
  const { error, count } = await admin
    .from("bookmarks")
    .update({ deleted_at: nowIso(), deleted_batch_id: batchId }, { count: "exact" })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("id", ids)
  if (error) throw error
  return { count: count ?? ids.length, batchId }
}

export async function softDeleteBookmark(userId: string, id: string) {
  return softDeleteBookmarks(userId, [id])
}

export async function softDeleteFolder(userId: string, folderId: string) {
  return softDeleteFolderSubtree(userId, folderId)
}

export async function softDeleteFolderSubtree(
  userId: string,
  folderId: string
): Promise<{ folderIds: string[]; bookmarkCount: number; batchId: string }> {
  const admin = createAdminClient()
  const { data: folders, error: fErr } = await admin
    .from("folders")
    .select("id, parent_id, name, sort_order, deleted_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
  if (fErr) throw fErr
  const alive = (folders ?? []) as FlatFolder[]
  if (!alive.some((f) => f.id === folderId)) {
    const err = new Error("Folder not found") as Error & { status: number; code: string }
    err.status = 404
    err.code = "not_found"
    throw err
  }
  const descendantIds = [...collectFolderSubtreeIds(alive, folderId)]
  const batchId = randomUUID()
  const deletedAt = nowIso()

  const { error: bfErr } = await admin
    .from("bookmarks")
    .update({ deleted_at: deletedAt, deleted_batch_id: batchId })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("folder_id", descendantIds)
  if (bfErr) throw bfErr

  const { count: bookmarkCount } = await admin
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("deleted_batch_id", batchId)

  const { error: ffErr } = await admin
    .from("folders")
    .update({ deleted_at: deletedAt, deleted_batch_id: batchId })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("id", descendantIds)
  if (ffErr) throw ffErr

  return { folderIds: descendantIds, bookmarkCount: bookmarkCount ?? 0, batchId }
}

export async function restoreTrashItem(userId: string, type: "bookmark" | "folder", id: string): Promise<void> {
  const admin = createAdminClient()
  const table = type === "bookmark" ? "bookmarks" : "folders"
  const { data, error } = await admin
    .from(table)
    .select("id, deleted_at, deleted_batch_id")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (!data?.deleted_at) {
    const err = new Error("Item not in trash") as Error & { status: number; code: string }
    err.status = 404
    err.code = "not_in_trash"
    throw err
  }
  if (data.deleted_batch_id) {
    await restoreBatch(userId, data.deleted_batch_id as string)
    return
  }
  const { error: uErr } = await admin
    .from(table)
    .update({ deleted_at: null, deleted_batch_id: null })
    .eq("user_id", userId)
    .eq("id", id)
  if (uErr) throw uErr
}

export async function restoreBatch(userId: string, batchId: string): Promise<{ restored: number }> {
  const admin = createAdminClient()
  const patch = { deleted_at: null, deleted_batch_id: null }
  const [b, f] = await Promise.all([
    admin.from("bookmarks").update(patch).eq("user_id", userId).eq("deleted_batch_id", batchId),
    admin.from("folders").update(patch).eq("user_id", userId).eq("deleted_batch_id", batchId),
  ])
  if (b.error) throw b.error
  if (f.error) throw f.error
  return { restored: (b.count ?? 0) + (f.count ?? 0) }
}

export async function purgeTrashItem(userId: string, type: "bookmark" | "folder", id: string): Promise<void> {
  const admin = createAdminClient()
  const table = type === "bookmark" ? "bookmarks" : "folders"
  const { data } = await admin
    .from(table)
    .select("id, deleted_at, deleted_batch_id")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle()
  if (!data?.deleted_at) {
    const err = new Error("Item not in trash") as Error & { status: number; code: string }
    err.status = 404
    err.code = "not_in_trash"
    throw err
  }
  if (data.deleted_batch_id) {
    await Promise.all([
      admin.from("bookmarks").delete().eq("user_id", userId).eq("deleted_batch_id", data.deleted_batch_id),
      admin.from("folders").delete().eq("user_id", userId).eq("deleted_batch_id", data.deleted_batch_id),
    ])
    return
  }
  const { error } = await admin.from(table).delete().eq("user_id", userId).eq("id", id)
  if (error) throw error
}

export async function emptyTrash(userId: string): Promise<{ deleted: number }> {
  const admin = createAdminClient()
  const [b, f] = await Promise.all([
    admin.from("bookmarks").delete({ count: "exact" }).eq("user_id", userId).not("deleted_at", "is", null),
    admin.from("folders").delete({ count: "exact" }).eq("user_id", userId).not("deleted_at", "is", null),
  ])
  if (b.error) throw b.error
  if (f.error) throw f.error
  return { deleted: (b.count ?? 0) + (f.count ?? 0) }
}

/** Hard-delete rows past retention. Intended for cron with service role. */
export async function purgeExpiredTrash(): Promise<{ bookmarks: number; folders: number }> {
  const admin = createAdminClient()
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - TRASH_RETENTION_DAYS)
  const iso = cutoff.toISOString()
  const [b, f] = await Promise.all([
    admin.from("bookmarks").delete({ count: "exact" }).lt("deleted_at", iso).not("deleted_at", "is", null),
    admin.from("folders").delete({ count: "exact" }).lt("deleted_at", iso).not("deleted_at", "is", null),
  ])
  if (b.error) throw b.error
  if (f.error) throw f.error
  return { bookmarks: b.count ?? 0, folders: f.count ?? 0 }
}
