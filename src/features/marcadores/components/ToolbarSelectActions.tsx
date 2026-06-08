"use client"

import { cn } from "@/lib/utils"

type Props = {
  selectMode: boolean
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onEdit: () => void
  onDelete: () => void
}

export default function ToolbarSelectActions({
  selectMode,
  setSelectMode,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex min-w-0 flex-shrink-0 flex-wrap items-center gap-1">
      <button
        onClick={() => {
          setSelectMode((m) => !m)
          if (selectMode) setSelectedIds(new Set())
        }}
        className={cn(
          "rounded px-2 py-1 text-xs",
          selectMode ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
        )}
      >
        Seleccionar
      </button>
      {selectMode && selectedIds.size > 0 && (
        <>
          <button
            onClick={onEdit}
            disabled={selectedIds.size !== 1}
            className={cn(
              "text-app-fg-muted rounded px-2 py-1 text-xs disabled:opacity-50",
              "hover:bg-app-active hover:text-app-fg"
            )}
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className={cn("text-app-danger-fg rounded px-2 py-1 text-xs", "hover:bg-app-danger/20")}
          >
            Eliminar ({selectedIds.size})
          </button>
        </>
      )}
    </div>
  )
}
