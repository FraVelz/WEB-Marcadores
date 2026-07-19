"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

import type { FlatFolder } from "../utils/types"

type Props = {
  selectMode: boolean
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  /** Ids de carpetas vivas; si hay exactamente una seleccionada, el botón dice Renombrar. */
  folders?: FlatFolder[]
  onEdit: () => void
  onDelete: () => void
}

export default function ToolbarSelectActions({
  selectMode,
  setSelectMode,
  selectedIds,
  setSelectedIds,
  folders = [],
  onEdit,
  onDelete,
}: Props) {
  const folderIdSet = new Set(folders.map((f) => f.id))
  const singleId = selectedIds.size === 1 ? [...selectedIds][0] : null
  const canRenameFolder = singleId != null && folderIdSet.has(singleId)
  const canEditBookmark = singleId != null && !canRenameFolder
  const canPrimaryEdit = canRenameFolder || canEditBookmark

  return (
    <div className="flex min-w-0 flex-shrink-0 flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setSelectMode((m) => !m)
          if (selectMode) setSelectedIds(new Set())
        }}
        className={cn(
          "rounded px-2 py-1 text-xs",
          FOCUS_RING,
          selectMode ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
        )}
      >
        Seleccionar
      </button>
      {selectMode && selectedIds.size > 0 && (
        <>
          <button
            type="button"
            onClick={onEdit}
            disabled={!canPrimaryEdit}
            className={cn(
              "text-app-fg-muted rounded px-2 py-1 text-xs disabled:opacity-50",
              FOCUS_RING,
              "hover:bg-app-active hover:text-app-fg"
            )}
          >
            {canRenameFolder ? "Renombrar" : "Editar"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cn("text-app-danger-fg rounded px-2 py-1 text-xs", FOCUS_RING, "hover:bg-app-danger/20")}
          >
            Eliminar ({selectedIds.size})
          </button>
        </>
      )}
    </div>
  )
}
