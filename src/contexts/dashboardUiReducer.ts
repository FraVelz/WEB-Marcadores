import type { ReactNode } from "react"
import type { SetStateAction } from "react"

import type { MarcadoresRuntimeSnap } from "@/contexts/dashboardContextContract"
import type { ViewMode } from "@/contexts/dashboardContextContract"

export type DashboardUiState = {
  viewMode: ViewMode
  selectedFolderId: string | null
  commandPaletteOpen: boolean
  marcadoresPalette: MarcadoresRuntimeSnap | null
  explorerWideHeaderEndSlot: ReactNode | null
}

export const INITIAL_DASHBOARD_UI: DashboardUiState = {
  viewMode: "hierarchical",
  selectedFolderId: null,
  commandPaletteOpen: false,
  marcadoresPalette: null,
  explorerWideHeaderEndSlot: null,
}

export type DashboardUiAction =
  | { type: "view_mode"; mode: ViewMode }
  | { type: "selected_folder"; id: string | null }
  | { type: "command_palette"; updater: SetStateAction<boolean> }
  | { type: "marcadores_palette"; updater: SetStateAction<MarcadoresRuntimeSnap | null> }
  | { type: "explorer_header_slot"; updater: SetStateAction<ReactNode | null> }

export function dashboardUiReducer(s: DashboardUiState, a: DashboardUiAction): DashboardUiState {
  switch (a.type) {
    case "view_mode":
      return { ...s, viewMode: a.mode }
    case "selected_folder":
      return { ...s, selectedFolderId: a.id }
    case "command_palette":
      return {
        ...s,
        commandPaletteOpen: typeof a.updater === "function" ? a.updater(s.commandPaletteOpen) : a.updater,
      }
    case "marcadores_palette":
      return {
        ...s,
        marcadoresPalette: typeof a.updater === "function" ? a.updater(s.marcadoresPalette) : a.updater,
      }
    case "explorer_header_slot":
      return {
        ...s,
        explorerWideHeaderEndSlot: typeof a.updater === "function" ? a.updater(s.explorerWideHeaderEndSlot) : a.updater,
      }
    default:
      return s
  }
}
