"use client"

import { useMemo } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"
import {
  DEFAULT_ZONE_LAYOUT,
  SINGLE_LAYOUT_PAYLOAD,
  type WorkspaceLayoutPayload,
} from "@/features/marcadores/workspaces/workspaceLayout"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

import { FILTER_PRESETS } from "../views/filterPresets"

import { cn } from "@/lib/utils"

type Props = {
  browseMode: BrowseMode
  setBrowseMode: (m: BrowseMode) => void
  activeViewAst: ViewAst | null
  setActiveViewAst: (ast: ViewAst | null) => void
  duplicateClusterCount: number
}

export default function MarcadoresBrowseControls(props: Props) {
  const {
    workspaces,
    workspacesLoading,
    activeWorkspaceId,
    setActiveWorkspaceId,
    workspaceLayout,
    persistWorkspaceLayout,
  } = useDashboard()

  const sortedWs = useMemo(
    () => workspaces.slice().sort((a: WorkspaceRow, b: WorkspaceRow) => a.sort_order - b.sort_order),
    [workspaces]
  )

  const zonesActive = workspaceLayout?.template === "zones"

  const handleWorkspaceChange = (id: string) => {
    if (!id || id === activeWorkspaceId) return
    setActiveWorkspaceId(id)
  }

  const handleToggleZonesTemplate = async () => {
    const payload: WorkspaceLayoutPayload = zonesActive ? SINGLE_LAYOUT_PAYLOAD : DEFAULT_ZONE_LAYOUT()
    await persistWorkspaceLayout(payload)
  }

  return (
    <div className="border-app-border-muted bg-app-toolbar/40 flex flex-col gap-2 border-b px-2 py-2 md:flex-row md:flex-wrap md:items-center">
      <label className="text-app-fg-label flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
        Workspace
        <select
          className="border-app-input-border bg-app-raised-muted text-app-fg hover:border-app-accent max-w-[12rem] rounded-md border px-2 py-1 text-xs normal-case outline-none md:max-w-none"
          value={activeWorkspaceId ?? ""}
          disabled={workspacesLoading || sortedWs.length === 0}
          onChange={(e) => handleWorkspaceChange(e.target.value)}
        >
          {sortedWs.length === 0 ? <option value="">Sin workspaces</option> : null}
          {sortedWs.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <span className="text-app-fg-label text-[11px] font-semibold tracking-wide uppercase">Modo</span>
        <div className="flex flex-wrap gap-1">
          <ModeChip
            label="Carpetas"
            active={props.browseMode === "folder"}
            onClick={() => props.setBrowseMode("folder")}
          />
          <ModeChip
            label="Filtro global"
            active={props.browseMode === "filter"}
            onClick={() => props.setBrowseMode("filter")}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-end">
        <div className="flex flex-wrap items-center gap-1">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={props.browseMode !== "filter"}
              onClick={() => {
                props.setBrowseMode("filter")
                props.setActiveViewAst(preset.ast ?? null)
              }}
              title={preset.hint}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] transition-colors md:text-xs",
                props.browseMode === "filter"
                  ? "border-app-border-muted bg-app-raised-muted text-app-fg-secondary hover:border-app-accent"
                  : "text-app-fg-muted border-transparent opacity-60"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleToggleZonesTemplate()}
          className={cn(
            "border-app-border-muted text-app-fg-secondary hover:border-app-accent flex items-center rounded-md border px-2 py-1 text-[11px] md:text-xs",
            zonesActive && "border-app-accent bg-app-selection ring-app-focus ring-1"
          )}
        >
          Paneles zonas
        </button>

        <div className="text-app-fg-muted text-[11px] md:text-right">
          Posibles duplicados:{" "}
          <span className={props.duplicateClusterCount > 0 ? "text-app-accent font-medium" : ""}>
            {props.duplicateClusterCount}
          </span>
        </div>
      </div>
    </div>
  )
}

function ModeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-1 text-[11px] transition-colors md:text-xs",
        active ? "border-app-accent bg-app-selection ring-app-focus ring-1" : "border-app-border-muted bg-app-toolbar"
      )}
    >
      {label}
    </button>
  )
}
