"use client"

import { useEffect, useEffectEvent, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { sortedUniqueTagsFromRows } from "@/lib/bookmark-tags"
import { DEMO_TAGS } from "@/lib/demo-data"

import type { Folder } from "@/contexts/dashboardTypes"

export function useDashboardBookmarksTree(demoMode: boolean) {
  const [allTags, setAllTags] = useState<string[]>([])
  const [folders, setFolders] = useState<Folder[]>([])

  const refreshTags = async () => {
    if (demoMode) {
      setAllTags(DEMO_TAGS)
      return
    }
    const supabase = createClient()
    const { data } = await supabase.from("bookmarks").select("tags").is("deleted_at", null)
    setAllTags(sortedUniqueTagsFromRows(data || []))
  }

  const setAllTagsFromBookmarks = (rows: { tags?: string[] | null }[]) => {
    setAllTags(sortedUniqueTagsFromRows(rows))
  }

  const refreshFolders = async () => {
    if (demoMode) return
    const supabase = createClient()
    const { data } = await supabase.from("folders").select("*").is("deleted_at", null).order("sort_order")
    if (!data) return
    const byParent: Record<string, Folder[]> = {}
    for (const f of data) {
      const pid = f.parent_id || "root"
      if (!byParent[pid]) byParent[pid] = []
      byParent[pid].push({ ...f, children: [] })
    }
    const buildTree = (parentId: string): Folder[] => {
      const list = byParent[parentId] || []
      return list.sort((a, b) => a.sort_order - b.sort_order).map((f) => ({ ...f, children: buildTree(f.id) }))
    }
    setFolders(buildTree("root"))
  }

  const refreshTagsEffect = useEffectEvent(() => {
    void refreshTags()
  })

  useEffect(() => {
    if (!demoMode) return
    queueMicrotask(() => {
      refreshTagsEffect()
    })
  }, [demoMode])

  const refreshFoldersEffect = useEffectEvent(() => {
    void refreshFolders()
  })

  useEffect(() => {
    queueMicrotask(() => {
      refreshFoldersEffect()
    })
  }, [demoMode])

  return {
    allTags,
    folders,
    setFolders,
    refreshTags,
    setAllTagsFromBookmarks,
    refreshFolders,
  }
}
