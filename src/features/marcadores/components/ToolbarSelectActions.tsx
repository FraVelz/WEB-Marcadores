"use client";

type Props = {
  selectMode: boolean;
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onEdit: () => void;
  onDelete: () => void;
};

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
          setSelectMode((m) => !m);
          if (selectMode) setSelectedIds(new Set());
        }}
        className={`rounded px-2 py-1 text-xs ${
          selectMode ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"
        }`}
      >
        Seleccionar
      </button>
      {selectMode && selectedIds.size > 0 && (
        <>
          <button
            onClick={onEdit}
            disabled={selectedIds.size !== 1}
            className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-600 hover:text-white disabled:opacity-50"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-600/20"
          >
            Eliminar ({selectedIds.size})
          </button>
        </>
      )}
    </div>
  );
}
