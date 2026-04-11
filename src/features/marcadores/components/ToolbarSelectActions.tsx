"use client"

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
    <div className="ml-auto flex items-center gap-1">
      <button
        onClick={() => {
          setSelectMode((m) => !m)
          if (selectMode) setSelectedIds(new Set())
        }}
        className={`rounded px-2 py-1 text-xs ${
          selectMode ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
        }`}
      >
        Seleccionar
      </button>
      {selectMode && selectedIds.size > 0 && (
        <>
          <button
            onClick={onEdit}
            disabled={selectedIds.size !== 1}
            className="text-app-fg-muted hover:bg-app-active hover:text-app-fg rounded px-2 py-1 text-xs disabled:opacity-50"
          >
            Editar
          </button>
          <button onClick={onDelete} className="text-app-danger-fg hover:bg-app-danger/20 rounded px-2 py-1 text-xs">
            Eliminar ({selectedIds.size})
          </button>
        </>
      )}
    </div>
  )
}
