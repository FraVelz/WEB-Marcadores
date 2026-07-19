"use client"

import type { Dispatch, SetStateAction } from "react"

import type { BookmarkFormData } from "@/features/marcadores/components/bookmark/BookmarkModal"
import { splitCommaTags } from "@/lib/comma-tags"
import { BOOKMARK_URL_ERROR, isHttpUrl } from "@/lib/isHttpUrl"
import type { createClient } from "@/lib/supabase/client"

import type { Bookmark } from "../utils/types"

export async function persistMarcadoresBookmarkModal(
  deps: {
    demoMode: boolean
    supabase: ReturnType<typeof createClient>
    setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
    setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>
    refreshTags: () => void
    fetchData: () => Promise<void>
  },
  data: BookmarkFormData,
  editingBookmark: Bookmark | null
) {
  const { demoMode, supabase, setBookmarks, setDetailBookmark, refreshTags, fetchData } = deps

  if (!isHttpUrl(data.url)) {
    throw new Error(BOOKMARK_URL_ERROR)
  }

  const tags = data.tags ? splitCommaTags(data.tags) : []
  const folder_id = data.folder_id || null
  let metadata: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(data.metadata?.trim() || "{}")
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      metadata = parsed as Record<string, unknown>
    } else {
      throw new Error("metadata must be a JSON object")
    }
  } catch {
    throw new Error("Metadata JSON inválido")
  }

  if (demoMode) {
    if (editingBookmark) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === editingBookmark.id
            ? {
                ...b,
                title: data.title,
                url: data.url,
                description: data.description || undefined,
                folder_id,
                tags,
                metadata,
              }
            : b
        )
      )
      setDetailBookmark((prev) =>
        prev?.id === editingBookmark.id
          ? {
              ...prev,
              title: data.title,
              url: data.url,
              description: data.description,
              folder_id,
              tags,
              metadata,
            }
          : prev
      )
    } else {
      setBookmarks((prev) => [
        ...prev,
        {
          id: `demo-${Date.now()}`,
          title: data.title,
          url: data.url,
          description: data.description || undefined,
          folder_id,
          tags,
          metadata,
          created_at: new Date().toISOString(),
        },
      ])
    }
    refreshTags()
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Debes iniciar sesión")

  const payload = {
    title: data.title,
    url: data.url,
    description: data.description || null,
    folder_id,
    tags: data.tags ? splitCommaTags(data.tags) : [],
    metadata,
  }

  if (editingBookmark) {
    await supabase.from("bookmarks").update(payload).eq("id", editingBookmark.id)
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, ...payload })
  }
  await fetchData()
  refreshTags()
}
