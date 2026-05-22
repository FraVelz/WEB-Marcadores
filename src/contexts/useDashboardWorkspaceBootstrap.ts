"use client"

import { useCallback, useEffect } from "react"

import { createClient } from "@/lib/supabase/client"
import type { AuthResponse } from "@supabase/supabase-js"
import type { WorkspaceLayoutPayload } from "@/features/marcadores/workspaces/workspaceLayout"
import { normalizeWorkspaceLayout, SINGLE_LAYOUT_PAYLOAD } from "@/features/marcadores/workspaces/workspaceLayout"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"
import { DEMO_WORKSPACES } from "@/lib/demo-data"
import { readTabScopedItem } from "@/lib/tabScopedStorage"

export const ACTIVE_WS_KEY = "marcadores_active_workspace_id"

const DEMO_LAYOUT_PREFIX = "marcadores_demo_workspace_layout."

export function layoutStorageKeyBase(workspaceId: string, demoMode: boolean) {
  if (demoMode) return `${DEMO_LAYOUT_PREFIX}${workspaceId}`
  return `${ACTIVE_WS_KEY}.layout.${workspaceId}`
}

type RemoteWorkspaceBootstrap = { kind: "guest" } | { kind: "ok"; workspaces: WorkspaceRow[]; activeId: string | null }

function fetchRemoteWorkspaceBootstrap(storedActiveWs: string | null): Promise<RemoteWorkspaceBootstrap> {
  if (typeof window === "undefined") {
    return Promise.resolve({ kind: "guest" })
  }

  const supabase = createClient()

  return supabase.auth.getUser().then(async (authResult: AuthResponse) => {
    const { user } = authResult.data
    if (user === null) {
      return { kind: "guest" } satisfies RemoteWorkspaceBootstrap
    }

    const uid = user.id
    const { data: rows } = await supabase.from("workspaces").select("*").eq("user_id", uid).order("sort_order")

    const rowsOk = rows !== null && rows !== undefined && rows.length > 0
    let workspaces: WorkspaceRow[]
    if (rowsOk) {
      workspaces = rows as WorkspaceRow[]
    } else {
      const inserts = [
        { name: "Personal", sort_order: 0 },
        { name: "Trabajo", sort_order: 1 },
        { name: "Investigación", sort_order: 2 },
      ].map((r) => ({ ...r, user_id: uid }))

      const { data: inserted, error } = await supabase.from("workspaces").insert(inserts).select("*")
      const insCount = inserted === null ? 0 : inserted.length
      workspaces = error === null && inserted !== null && insCount > 0 ? inserted : []
    }

    let activeId: string | null = null
    let i = 0
    while (i < workspaces.length) {
      const id = workspaces[i].id
      i += 1
      const matchStored = storedActiveWs !== null && id === storedActiveWs
      if (matchStored) {
        activeId = id
        break
      }
    }
    const firstId = workspaces.length > 0 ? workspaces[0].id : null
    if (activeId === null) {
      activeId = firstId
    }

    return { kind: "ok", workspaces, activeId } satisfies RemoteWorkspaceBootstrap
  })
}

export function useDashboardWorkspaceBootstrap(opts: {
  demoMode: boolean
  setWorkspaces: React.Dispatch<React.SetStateAction<WorkspaceRow[]>>
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string | null) => void
  setWorkspaceLayout: React.Dispatch<React.SetStateAction<WorkspaceLayoutPayload | null>>
  setWorkspacesLoading: React.Dispatch<React.SetStateAction<boolean>>
  workspacesLoading: boolean
}) {
  const {
    demoMode,
    setWorkspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setWorkspaceLayout,
    setWorkspacesLoading,
    workspacesLoading,
  } = opts

  const loadLayoutPayload = useCallback(
    async (workspaceId: string) => {
      if (demoMode) {
        try {
          const raw = readTabScopedItem(layoutStorageKeyBase(workspaceId, true))
          if (raw) setWorkspaceLayout(normalizeWorkspaceLayout(JSON.parse(raw)))
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
      if (data?.payload) setWorkspaceLayout(normalizeWorkspaceLayout(data.payload))
      else setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
    },
    [demoMode, setWorkspaceLayout]
  )

  const bootstrapWorkspaces = useCallback(async () => {
    setWorkspacesLoading(true)
    let storedActiveWs: string | null = null
    if (typeof window !== "undefined") {
      try {
        storedActiveWs = readTabScopedItem(ACTIVE_WS_KEY)
      } catch {
        storedActiveWs = null
      }
    }
    if (demoMode) {
      const rows = DEMO_WORKSPACES.map((w) => ({ id: w.id, name: w.name, sort_order: w.sort_order }))
      setWorkspaces(rows)
      const fromStored = storedActiveWs !== null && rows.some((x) => x.id === storedActiveWs) ? storedActiveWs : null
      const fallbackDemo = rows.length > 0 ? rows[0].id : null
      const pick = fromStored ?? fallbackDemo
      setActiveWorkspaceId(pick)
      setWorkspacesLoading(false)
      return
    }

    let remote: RemoteWorkspaceBootstrap
    try {
      remote = await fetchRemoteWorkspaceBootstrap(storedActiveWs)
    } catch {
      /* demo / red */
      setWorkspacesLoading(false)
      return
    }
    if (remote.kind === "guest") {
      setWorkspaces([])
      setActiveWorkspaceId(null)
      setWorkspaceLayout(SINGLE_LAYOUT_PAYLOAD)
      setWorkspacesLoading(false)
      return
    }
    setWorkspaces(remote.workspaces)
    setActiveWorkspaceId(remote.activeId)
    setWorkspacesLoading(false)
  }, [demoMode, setActiveWorkspaceId, setWorkspaceLayout, setWorkspaces, setWorkspacesLoading])

  useEffect(() => {
    void bootstrapWorkspaces()
  }, [bootstrapWorkspaces])

  useEffect(() => {
    const id = activeWorkspaceId
    if (!id || workspacesLoading) return
    void loadLayoutPayload(id)
  }, [activeWorkspaceId, loadLayoutPayload, workspacesLoading])

  const reloadWorkspacesAndLayout = useCallback(async () => {
    await bootstrapWorkspaces()
  }, [bootstrapWorkspaces])

  return { reloadWorkspacesAndLayout }
}
