"use client";

import type { GridItem } from "../types";

type Props = {
  item: GridItem;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmBanner({ item, onConfirm, onCancel }: Props) {
  const label = item.type === "folder" ? item.label : item.bookmark.title;
  const typeLabel = item.type === "folder" ? "carpeta" : "enlace";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-red-500/50 bg-red-900/30 px-3 py-2 text-sm text-red-200">
      <span>
        ¿Eliminar {typeLabel} &quot;{label}&quot;? Enter para confirmar, Esc para cancelar
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-red-600 px-3 py-1 font-medium hover:bg-red-700"
        >
          Eliminar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-600 px-3 py-1 hover:bg-zinc-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
