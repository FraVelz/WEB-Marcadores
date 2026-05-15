"use client"

import { createContext, use, useRef, useCallback, useState, useEffect, useEffectEvent } from "react"

import { createClient } from "@/lib/supabase/client"

import type { WorkspaceLayoutPayload } from "@/features/marcadores/workspaces/workspaceLayout"
import { SINGLE_LAYOUT_PAYLOAD } from "@/features/marcadores/workspaces/workspaceLayout"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"
import { DEMO_TAGS, DEMO_WORKSPACES } from "@/lib/demo-data"
import { sortedUniqueTagsFromRows } from "@/lib/bookmark-tags"
import { useSidebarTreeCollapse } from "@/layouts/dashboard/hooks/useSidebarTreeCollapse"

export type Folder = {
  id: string
  parent_id: string | null
  name: string
  sort_order: number
  children?: Folder[]
}

type ViewMode = "grid" | "hierarchical"

export type MarcadoresRuntimeSnap = {
  bookmarks: Array<{ id: string; title: string; url: string }>
  recordBookmarkOpened: (id: string) => Promise<void>
}

const ACTIVE_WS_KEY = "marcadores_active_workspace_id"
const DEMO_LAYOUT_PREFIX = "marcadores_demo_workspace_layout."

type DashboardContextType = {
  demoMode: boolean
  mainRef: React.RefObject<HTMLElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
  focusMain: () => void
  focusSidebar: () => void
  allTags: string[]
  refreshTags: () => void
  setAllTagsFromBookmarks: (rows: { tags?: string[] | null }[]) => void
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
  workspaces: WorkspaceRow[]
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string | null) => void
  workspaceLayout: WorkspaceLayoutPayload | null
  workspacesLoading: boolean
  reloadWorkspacesAndLayout: () => Promise<void>
  persistWorkspaceLayout: (payload: WorkspaceLayoutPayload) => Promise<void>

  commandPaletteOpen: boolean
  setCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>

  registerMarcadoresRuntime: (snapshot: MarcadoresRuntimeSnap | null) => void
  marcadoresPalette: MarcadoresRuntimeSnap | null

  /** Árbol de carpetas (Marcadores): colapsar / teclado desde el panel interno */
  explorerCollapsedIds: Set<string>
  setExplorerCollapsedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  toggleExplorerCollapsed: (folderId: string) => void
  explorerFlatSidebarItems: (string | null)[]
  /** Solo la instancia enfocada del escritorio debe enlazar esta ref para atajos „n“. */
  marcadoresExplorerPanelRef: React.RefObject<HTMLDivElement | null>
  /**
   * Contenedor de la columna principal (Explorador + cabecera móvil + main).
   * Pantalla completa del escritorio lo usa para mantener visible la barra superior de la app.
   */
  dashboardFullscreenHostRef: React.RefObject<HTMLDivElement | null>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

function layoutStorageKey(workspaceId: string, demoMode: boolean) {
  if (demoMode) return `${DEMO_LAYOUT_PREFIX}${workspaceId}`
  return ACTIVE_WS_KEY + ".layout." + workspaceId
}

export function DashboardProvider({ children, demoMode }: { children: React.ReactNode; demoMode: boolean }) {
  const mainRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const marcadoresExplorerPanelRef = useRef<HTMLDivElement>(null)
  const dashboardFullscreenHostRef = useRef<HTMLDivElement>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const {
    collapsedIds: explorerCollapsedIds,
    setCollapsedIds: setExplorerCollapsedIds,
    flatSidebarItems: explorerFlatSidebarItems,
    toggleCollapsed: toggleExplorerCollapsed,
  } = useSidebarTreeCollapse(folders)

  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null)
  const editFolderRef = useRef<((id: string, name: string) => void) | null>(null)

  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([])
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null)
  const [workspaceLayout, setWorkspaceLayout] = useState<WorkspaceLayoutPayload | null>(SINGLE_LAYOUT_PAYLOAD)
  const [workspacesLoading, setWorkspacesLoading] = useState(true)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const [marcadoresPalette, setMarcadoresPalette] = useState<MarcadoresRuntimeSnap | null>(null)

  const registerMarcadoresRuntime = useCallback((snapshot: MarcadoresRuntimeSnap | null) => {
    queueMicrotask(() => {
      setMarcadoresPalette(snapshot)
    })
  }, [])

  const setActiveWorkspaceId = useCallback(
    (id: string | null) => {
      setActiveWorkspaceIdState(id)
      if (typeof window === "undefined" || id === null) return
      try {
        localStorage.setItem(ACTIVE_WS_KEY, id)
      } catch {
        /* ignore quota */
      }
    },
    [setActiveWorkspaceIdState]
  )

  const loadLayoutPayload = useCallback(
    async (workspaceId: string) => {
      if (demoMode) {
        try {
          const raw = localStorage.getItem(layoutStorageKey(workspaceId, true))
          if (raw) setWorkspaceLayout(JSON.parse(raw) as WorkspaceLayoutPayload)
          else setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
        } catch {
          setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
        }
        return
      }
      const supabase = createClient()
      const { data } = await supabase
        .from("workspace_layouts")
        .select("payload")
        .eq("workspace_id", workspaceId)
        .maybeSingle()
      if (data?.payload) setWorkspaceLayout(data.payload as WorkspaceLayoutPayload)
      else setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
    },
    [demoMode]
  )

  const bootstrapWorkspaces = useCallback(async () => {
    setWorkspacesLoading(true)
    try {
      if (demoMode) {
        const rows = DEMO_WORKSPACES.map((w) => ({ id: w.id, name: w.name, sort_order: w.sort_order }))
        setWorkspaces(rows)
        const stored = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_WS_KEY) : null
        const pick = (stored && rows.some((x) => x.id === stored) ? stored : null) ?? rows[0]?.id ?? null
        setActiveWorkspaceId(pick)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setWorkspaces([])
        setActiveWorkspaceId(null)
        setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
        setWorkspacesLoading(false)
        return
      }

      let { data: rows } = await supabase.from("workspaces").select("*").eq("user_id", user.id).order("sort_order")

      const list = rows || []
      if (list.length === 0) {
        const inserts = [
          { name: "Personal", sort_order: 0 },
          { name: "Trabajo", sort_order: 1 },
          { name: "Investigación", sort_order: 2 },
        ].map((r) => ({ ...r, user_id: user.id }))

        const { data: inserted, error } = await supabase.from("workspaces").insert(inserts).select("*")
        if (!error && inserted?.length) {
          rows = inserted
        } else {
          rows = []
        }
      }

      const normalized = rows || []

      const stored = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_WS_KEY) : null
      const pick =
        (stored && normalized.some((x: WorkspaceRow) => x.id === stored) ? stored : null) ?? normalized[0]?.id ?? null

      setWorkspaces(normalized)
      setActiveWorkspaceId(pick)
    } finally {
      setWorkspacesLoading(false)
    }
  }, [demoMode, setActiveWorkspaceId])

  const reloadWorkspacesAndLayout = useCallback(async () => {
    await bootstrapWorkspaces()
  }, [bootstrapWorkspaces])

  const persistWorkspaceLayout = useCallback(
    async (payload: WorkspaceLayoutPayload) => {
      setWorkspaceLayout(payload)
      if (!activeWorkspaceId) return

      if (demoMode) {
        try {
          localStorage.setItem(layoutStorageKey(activeWorkspaceId, true), JSON.stringify(payload))
        } catch {
          /* ignore */
        }
        return
      }

      const supabase = createClient()
      await supabase.from("workspace_layouts").upsert(
        {
          workspace_id: activeWorkspaceId,
          payload,
          revision: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      )
    },
    [activeWorkspaceId, demoMode]
  )

  useEffect(() => {
    void bootstrapWorkspaces()
  }, [bootstrapWorkspaces])

  useEffect(() => {
    const id = activeWorkspaceId
    if (!id || workspacesLoading) return
    void loadLayoutPayload(id)
  }, [activeWorkspaceId, workspacesLoading, loadLayoutPayload])

  const refreshTags = useCallback(async () => {
    if (demoMode) {
      setAllTags(DEMO_TAGS)
      return
    }
    const supabase = createClient()
    const { data } = await supabase.from("bookmarks").select("tags")
    setAllTags(sortedUniqueTagsFromRows(data || []))
  }, [demoMode])

  const setAllTagsFromBookmarks = useCallback((rows: { tags?: string[] | null }[]) => {
    setAllTags(sortedUniqueTagsFromRows(rows))
  }, [])

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

  const setMainKeyDown = useCallback((handler: ((e: React.KeyboardEvent) => void) | null) => {
    mainKeyDownRef.current = handler
  }, [])

  const focusMain = useCallback(() => {
    mainRef.current?.focus()
  }, [])

  const focusSidebar = useCallback(() => {
    marcadoresExplorerPanelRef.current?.focus()
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
        setAllTagsFromBookmarks,
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
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        workspaceLayout,
        workspacesLoading,
        reloadWorkspacesAndLayout,
        persistWorkspaceLayout,

        commandPaletteOpen,
        setCommandPaletteOpen,
        registerMarcadoresRuntime,
        marcadoresPalette,

        explorerCollapsedIds,
        setExplorerCollapsedIds,
        toggleExplorerCollapsed,
        explorerFlatSidebarItems,
        marcadoresExplorerPanelRef,
        dashboardFullscreenHostRef,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = use(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")

  return ctx
}
