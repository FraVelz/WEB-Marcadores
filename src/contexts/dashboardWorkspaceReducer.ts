import type { SetStateAction } from "react"

import type { WorkspaceLayoutPayload } from "@/features/marcadores/workspaces/workspaceLayout"
import { SINGLE_LAYOUT_PAYLOAD } from "@/features/marcadores/workspaces/workspaceLayout"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"

export type DashboardWorkspaceState = {
  workspaces: WorkspaceRow[]
  activeWorkspaceId: string | null
  workspaceLayout: WorkspaceLayoutPayload | null
  workspacesLoading: boolean
}

export const INITIAL_DASHBOARD_WORKSPACE: DashboardWorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  workspaceLayout: SINGLE_LAYOUT_PAYLOAD,
  workspacesLoading: true,
}

export type DashboardWorkspaceAction =
  | { type: "set_workspaces"; updater: SetStateAction<WorkspaceRow[]> }
  | { type: "set_active_id"; id: string | null }
  | { type: "set_layout"; updater: SetStateAction<WorkspaceLayoutPayload | null> }
  | { type: "set_loading"; updater: SetStateAction<boolean> }

export function dashboardWorkspaceReducer(
  s: DashboardWorkspaceState,
  a: DashboardWorkspaceAction
): DashboardWorkspaceState {
  switch (a.type) {
    case "set_workspaces":
      return { ...s, workspaces: typeof a.updater === "function" ? a.updater(s.workspaces) : a.updater }
    case "set_active_id":
      return { ...s, activeWorkspaceId: a.id }
    case "set_layout":
      return {
        ...s,
        workspaceLayout: typeof a.updater === "function" ? a.updater(s.workspaceLayout) : a.updater,
      }
    case "set_loading":
      return {
        ...s,
        workspacesLoading: typeof a.updater === "function" ? a.updater(s.workspacesLoading) : a.updater,
      }
    default:
      return s
  }
}
