"use client"

import { useEffect } from "react"

import { readTabScopedItem, writeTabScopedItem } from "@/lib/tabScopedStorage"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

import { workspacePrefsStorageKey, type StoredWorkspacePrefs } from "./marcadoresPageStorage"

export function useMarcadoresWorkspacePrefs(
  activeWorkspaceId: string | null,
  browseMode: BrowseMode,
  activeViewAst: ViewAst | null,
  setBrowseMode: React.Dispatch<React.SetStateAction<BrowseMode>>,
  setActiveViewAst: React.Dispatch<React.SetStateAction<ViewAst | null>>
): void {
  useEffect(() => {
    if (!activeWorkspaceId) return
    queueMicrotask(() => {
      if (typeof window === "undefined") return
      let raw: string | null
      try {
        raw = readTabScopedItem(workspacePrefsStorageKey(activeWorkspaceId))
      } catch {
        return
      }
      if (!raw) return
      let parsed: StoredWorkspacePrefs
      try {
        parsed = JSON.parse(raw) as StoredWorkspacePrefs
      } catch {
        return
      }
      const mode = parsed.browseMode
      if (mode === "folder" || mode === "filter") {
        setBrowseMode(mode)
      }
      if (Object.prototype.hasOwnProperty.call(parsed, "activeViewAst")) {
        setActiveViewAst(parsed.activeViewAst ?? null)
      }
    })
  }, [activeWorkspaceId, setActiveViewAst, setBrowseMode])

  useEffect(() => {
    if (!activeWorkspaceId || typeof window === "undefined") return
    try {
      const payload: StoredWorkspacePrefs = { browseMode, activeViewAst }
      writeTabScopedItem(workspacePrefsStorageKey(activeWorkspaceId), JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [activeWorkspaceId, browseMode, activeViewAst])
}
