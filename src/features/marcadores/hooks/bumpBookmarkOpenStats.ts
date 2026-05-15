"use client"

import type { Dispatch, SetStateAction } from "react"

import type { createClient } from "@/lib/supabase/client"

import type { Bookmark } from "../utils/types"

export async function bumpBookmarkOpenStats(
  deps: {
    demoMode: boolean
    supabase: ReturnType<typeof createClient>
    bookmarks: Bookmark[]
    setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
  },
  bookmarkId: string
) {
  const { demoMode, supabase, bookmarks, setBookmarks } = deps
  const nowIso = new Date().toISOString()
  const bumpLocal = () => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id !== bookmarkId) return b
        const nextCount = (b.open_count ?? 0) + 1
        return { ...b, opened_at: nowIso, open_count: nextCount, updated_at: nowIso }
      })
    )
  }

  if (demoMode) {
    bumpLocal()
    return
  }

  const current = bookmarks.find((b) => b.id === bookmarkId)
  const prevCount = current?.open_count ?? 0
  await supabase
    .from("bookmarks")
    .update({ opened_at: nowIso, open_count: prevCount + 1, updated_at: nowIso })
    .eq("id", bookmarkId)
  bumpLocal()
}
