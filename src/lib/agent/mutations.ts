import { createAdminClient } from "@/lib/supabase/admin"
import { isHttpUrl, mergeMetadata, sanitizeMetadata } from "./validate"
import type { Bookmark } from "@/features/marcadores/utils/types"

export async function createBookmark(
  userId: string,
  input: {
    title?: string
    url: string
    description?: string | null
    folder_id?: string | null
    tags?: string[]
    is_favorite?: boolean
    metadata?: Record<string, unknown>
  }
): Promise<Bookmark> {
  if (!isHttpUrl(input.url)) {
    const err = new Error("url must be http(s)") as Error & { status: number; code: string }
    err.status = 400
    err.code = "invalid_url"
    throw err
  }
  const admin = createAdminClient()
  const metadata = sanitizeMetadata({
    ...(input.metadata ?? {}),
    ...(input.is_favorite != null ? { is_favorite: Boolean(input.is_favorite) } : {}),
  })
  const { data, error } = await admin
    .from("bookmarks")
    .insert({
      user_id: userId,
      title: (input.title ?? "").trim() || input.url,
      url: input.url.trim(),
      description: input.description ?? null,
      folder_id: input.folder_id ?? null,
      tags: input.tags ?? [],
      metadata,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as Bookmark
}

export async function updateBookmark(
  userId: string,
  id: string,
  patch: Partial<{
    title: string
    url: string
    description: string | null
    folder_id: string | null
    tags: string[]
    is_favorite: boolean
    metadata: Record<string, unknown>
    metadata_mode: "merge" | "replace"
  }>
): Promise<Bookmark> {
  const admin = createAdminClient()
  const { data: current, error: gErr } = await admin
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()
  if (gErr) throw gErr
  if (!current) {
    const err = new Error("Bookmark not found") as Error & { status: number; code: string }
    err.status = 404
    err.code = "not_found"
    throw err
  }
  if (patch.url != null && !isHttpUrl(patch.url)) {
    const err = new Error("url must be http(s)") as Error & { status: number; code: string }
    err.status = 400
    err.code = "invalid_url"
    throw err
  }
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.title != null) updates.title = patch.title
  if (patch.url != null) updates.url = patch.url
  if (patch.description !== undefined) updates.description = patch.description
  if (patch.folder_id !== undefined) updates.folder_id = patch.folder_id
  if (patch.tags != null) updates.tags = patch.tags
  if (patch.is_favorite != null || patch.metadata != null) {
    const currentMeta = ((current.metadata as Record<string, unknown>) ?? {}) as Record<string, unknown>
    let nextMeta = currentMeta
    if (patch.metadata != null) {
      nextMeta = mergeMetadata(currentMeta, patch.metadata, patch.metadata_mode ?? "merge") as Record<
        string,
        unknown
      >
    }
    if (patch.is_favorite != null) {
      nextMeta = { ...nextMeta, is_favorite: patch.is_favorite }
    }
    updates.metadata = sanitizeMetadata(nextMeta)
  }
  const { data, error } = await admin
    .from("bookmarks")
    .update(updates)
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Bookmark
}

export async function createFolder(
  userId: string,
  input: { name: string; parent_id?: string | null; sort_order?: number; color?: string | null }
) {
  const name = input.name.trim()
  if (!name) {
    const err = new Error("name required") as Error & { status: number; code: string }
    err.status = 400
    err.code = "invalid_name"
    throw err
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("folders")
    .insert({
      user_id: userId,
      name,
      parent_id: input.parent_id ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function updateFolder(
  userId: string,
  id: string,
  patch: { name?: string; parent_id?: string | null; sort_order?: number; color?: string | null }
) {
  const admin = createAdminClient()
  const updates: Record<string, unknown> = {}
  if (patch.name != null) updates.name = patch.name.trim()
  if (patch.parent_id !== undefined) updates.parent_id = patch.parent_id
  if (patch.sort_order != null) updates.sort_order = patch.sort_order
  // color ignored until schema supports it
  void patch.color
  const { data, error } = await admin
    .from("folders")
    .update(updates)
    .eq("user_id", userId)
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle()
  if (error) throw error
  if (!data) {
    const err = new Error("Folder not found") as Error & { status: number; code: string }
    err.status = 404
    err.code = "not_found"
    throw err
  }
  return data
}

export async function moveBookmark(userId: string, id: string, folderId: string | null) {
  return updateBookmark(userId, id, { folder_id: folderId })
}

export async function moveFolder(userId: string, id: string, parentId: string | null) {
  return updateFolder(userId, id, { parent_id: parentId })
}
