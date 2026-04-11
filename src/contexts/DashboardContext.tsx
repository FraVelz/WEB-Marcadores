"use client"

import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DEMO_TAGS } from "@/lib/demo-data"

export type ViewMode = "grid" | "hierarchical"

export type Folder = {
  id: string
  parent_id: string | null
  name: string
  sort_order: number
  children?: Folder[]
}

type DashboardContextType = {
  /** Modo demo alineado con SSR (cookie + env). */
  demoMode: boolean
  mainRef: React.RefObject<HTMLElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
  focusMain: () => void
  focusSidebar: () => void
  allTags: string[]
  refreshTags: () => void
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
  setMainKeyDown: (handler: ((e: React.KeyboardEvent) => void) | null) => void
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>
  editFolderRef: React.MutableRefObject<((id: string, name: string) => void) | null>
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  refreshFolders: () => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children, demoMode }: { children: React.ReactNode; demoMode: boolean }) {
  const mainRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null)
  const editFolderRef = useRef<((id: string, name: string) => void) | null>(null)

  const refreshTags = useCallback(async () => {
    if (demoMode) {
      setAllTags(DEMO_TAGS)
      return
    }
    const supabase = createClient()
    const { data } = await supabase.from("bookmarks").select("tags")
    const tags = new Set<string>()
    for (const row of data || []) {
      for (const t of row.tags || []) {
        if (t?.trim()) tags.add(t.trim())
      }
    }
    setAllTags(Array.from(tags).sort())
  }, [demoMode])

  const refreshFolders = useCallback(async () => {
    if (demoMode) return
    const supabase = createClient()
    const { data } = await supabase.from("folders").select("*").order("sort_order")
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
  }, [demoMode])

  useEffect(() => {
    queueMicrotask(() => {
      void refreshTags()
    })
  }, [refreshTags])

  useEffect(() => {
    queueMicrotask(() => {
      void refreshFolders()
    })
  }, [refreshFolders])

  const setMainKeyDown = useCallback((handler: ((e: React.KeyboardEvent) => void) | null) => {
    mainKeyDownRef.current = handler
  }, [])

  const focusMain = useCallback(() => {
    mainRef.current?.focus()
  }, [])

  const focusSidebar = useCallback(() => {
    sidebarRef.current?.focus()
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        demoMode,
        mainRef,
        sidebarRef,
        focusMain,
        focusSidebar,
        allTags,
        refreshTags,
        viewMode,
        setViewMode,
        setMainKeyDown,
        mainKeyDownRef,
        editFolderRef,
        selectedFolderId,
        setSelectedFolderId,
        folders,
        setFolders,
        refreshFolders,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
