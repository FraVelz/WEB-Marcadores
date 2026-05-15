import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

export type StoredWorkspacePrefs = {
  browseMode?: BrowseMode
  activeViewAst?: ViewAst | null
}

export function workspacePrefsStorageKey(workspaceId: string): string {
  return `marcadores_ws_prefs_${workspaceId}`
}

export function makeDeskLibWinId(): string {
  return `lib-${crypto.randomUUID().slice(0, 10)}`
}
