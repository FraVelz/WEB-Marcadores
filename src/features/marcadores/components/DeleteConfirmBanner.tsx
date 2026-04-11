"use client"

import { cn } from "@/lib/utils"
import type { GridItem } from "../utils/types"

type Props = {
  item: GridItem
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmBanner({ item, onConfirm, onCancel }: Props) {
  const label = item.type === "folder" ? item.label : item.bookmark.title
  const typeLabel = item.type === "folder" ? "carpeta" : "enlace"

  return (
    <div
      className={cn(
        "border-app-danger-border flex items-center justify-between gap-4 border-b",
        "bg-app-danger-surface text-app-danger-banner-fg px-3 py-2 text-sm"
      )}
    >
      <span>
        ¿Eliminar {typeLabel} &quot;{label}&quot;? Enter para confirmar, Esc para cancelar
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="bg-app-danger hover:bg-app-danger-hover rounded px-3 py-1 font-medium text-white"
        >
          Eliminar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border-app-input-border hover:bg-app-hover rounded border px-3 py-1"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
