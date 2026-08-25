"use client"

import { useEffect, useState, startTransition } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data"

import { computeEstadisticas } from "@/features/estadisticas/computeEstadisticas"
import type { Bookmark, FlatFolder } from "@/features/marcadores/utils/types"

function normalizeBookmarkRow(raw: Bookmark): Bookmark {
  const meta = raw.metadata ?? {}
  const metaFavorite = typeof meta.is_favorite === "boolean" ? meta.is_favorite : undefined
  return {
    ...raw,
    is_favorite: raw.is_favorite ?? metaFavorite ?? false,
    open_count: raw.open_count ?? 0,
    archived_at: raw.archived_at ?? null,
    opened_at: raw.opened_at ?? null,
    updated_at: raw.updated_at ?? null,
    tags: raw.tags ?? [],
  }
}

export function useEstadisticasData() {
  const { demoMode } = useDashboard()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<FlatFolder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    if (demoMode) {
      setBookmarks((DEMO_BOOKMARKS as Bookmark[]).map(normalizeBookmarkRow))
      setFolders(DEMO_FOLDERS)
    } else {
      const supabase = createClient()
      const { data: bData } = await supabase.from("bookmarks").select("*").is("deleted_at", null).order("title")
      setBookmarks((bData || []).map((r: Bookmark) => normalizeBookmarkRow(r)))
      const { data: fData } = await supabase.from("folders").select("*").is("deleted_at", null).order("sort_order")
      setFolders(fData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        setLoading(true)
        if (demoMode) {
          setBookmarks((DEMO_BOOKMARKS as Bookmark[]).map(normalizeBookmarkRow))
          setFolders(DEMO_FOLDERS)
        } else {
          const supabase = createClient()
          const { data: bData } = await supabase.from("bookmarks").select("*").is("deleted_at", null).order("title")
          setBookmarks((bData || []).map((r: Bookmark) => normalizeBookmarkRow(r)))
          const { data: fData } = await supabase.from("folders").select("*").is("deleted_at", null).order("sort_order")
          setFolders(fData || [])
        }
        setLoading(false)
      })()
    })
  }, [demoMode])

  const stats = computeEstadisticas(bookmarks, folders)

  return { loading, stats, demoMode, refresh: fetchData }
}
