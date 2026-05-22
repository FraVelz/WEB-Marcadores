"use client"

import { useId, useMemo } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import type { WorkspaceRow } from "@/features/marcadores/workspaces/workspaceTypes"

type DeskProps = {
  variant: "desk"
  searchLibraryWide: boolean
  setSearchLibraryWide: React.Dispatch<React.SetStateAction<boolean>>
}

type StackedProps = {
  variant?: "stacked"
  duplicateClusterCount: number
}

type Props = DeskProps | StackedProps

function isDesk(p: Props): p is DeskProps {
  return p.variant === "desk"
}

export default function MarcadoresBrowseControls(props: Props) {
  const { workspaces, workspacesLoading, activeWorkspaceId, setActiveWorkspaceId } = useDashboard()

  const sortedWs = useMemo(
    () => workspaces.slice().sort((a: WorkspaceRow, b: WorkspaceRow) => a.sort_order - b.sort_order),
    [workspaces]
  )

  const deskSearchWideLibId = useId()
  const deskSearch = isDesk(props)

  const handleWorkspaceChange = (id: string) => {
    if (!id || id === activeWorkspaceId) return
    setActiveWorkspaceId(id)
  }

  return (
    <div className="border-app-border-muted bg-app-toolbar/40 flex flex-col gap-2 border-b p-2 md:flex-row md:flex-wrap md:items-center">
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

      {deskSearch ? (
        <label
          htmlFor={deskSearchWideLibId}
          aria-label="Buscar en toda la biblioteca"
          className="text-app-fg-secondary flex cursor-pointer items-center gap-2 text-xs normal-case"
        >
          <input
            id={deskSearchWideLibId}
            type="checkbox"
            className="border-app-input-border bg-app-raised-muted accent-app-primary size-3.5 shrink-0 rounded"
            checked={props.searchLibraryWide}
            onChange={(e) => props.setSearchLibraryWide(e.target.checked)}
          />
          <span>
            <span className="text-app-fg font-medium">Buscar en toda la biblioteca</span>
            <span className="text-app-fg-muted mt-0.5 block text-[11px] font-normal">
              Con texto en la búsqueda, muestra coincidencias en cualquier carpeta y la ruta debajo de cada marcador.
            </span>
          </span>
        </label>
      ) : (
        <div className="text-app-fg-muted ml-auto text-[11px] md:text-right">
          Posibles duplicados:{" "}
          <span className={props.duplicateClusterCount > 0 ? "text-app-accent font-medium" : ""}>
            {props.duplicateClusterCount}
          </span>
        </div>
      )}
    </div>
  )
}
