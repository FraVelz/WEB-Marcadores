"use client"

import type { Dispatch, SetStateAction } from "react"

import type { BookmarkFormData } from "@/features/marcadores/components/bookmark/BookmarkModal"
import { splitCommaTags } from "@/lib/comma-tags"
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
  const tags = data.tags ? splitCommaTags(data.tags) : []
  const folder_id = data.folder_id || null

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
              }
            : b
        )
      )
      setDetailBookmark((prev) =>
        prev?.id === editingBookmark.id
          ? { ...prev, title: data.title, url: data.url, description: data.description, folder_id, tags }
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
  }

  if (editingBookmark) {
    await supabase.from("bookmarks").update(payload).eq("id", editingBookmark.id)
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, ...payload })
  }
  await fetchData()
  refreshTags()
}
