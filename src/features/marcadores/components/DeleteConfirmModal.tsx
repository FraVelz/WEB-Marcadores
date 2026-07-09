"use client"

import { useEffect, useId, useRef, useState } from "react"

import { MARCADORES_GLOBAL_ALERT_Z_CLASS } from "@/features/marcadores/utils/layerZIndex"
import type { GridItem } from "@/features/marcadores/utils/types"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"
import { FOCUS_RING } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

type Props = {
  item: GridItem
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmModal({ item, onConfirm, onCancel }: Props) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [deleting, setDeleting] = useState(false)

  const isFolder = item.type === "folder"
  const label = isFolder ? item.label : item.bookmark.title || "Sin título"
  const typeLabel = isFolder ? "carpeta" : "enlace"

  useHotkeys("esc", () => onCancel(), { enabled: !deleting }, [onCancel, deleting])

  useEffect(() => {
    requestAnimationFrame(() => cancelRef.current?.focus())
  }, [])

  const handleConfirm = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await onConfirm()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div
      className={cn("bg-app-overlay fixed inset-0 flex items-center justify-center p-4", MARCADORES_GLOBAL_ALERT_Z_CLASS)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-none bg-transparent p-0"
        aria-label="Cancelar eliminación"
        disabled={deleting}
        onClick={onCancel}
      />
      <div
        className={cn(
          "border-app-border bg-app-raised relative z-10 w-full max-w-md rounded-xl border p-6 shadow-xl"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "bg-app-danger-surface text-app-danger-fg flex size-11 shrink-0 items-center justify-center rounded-full"
            )}
            aria-hidden
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
              <path d="M10 11v6M14 11v6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-app-fg text-lg font-semibold">
              ¿Eliminar {typeLabel}?
            </h2>
            <p id={descriptionId} className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
              <span className="text-app-fg font-medium">&quot;{label}&quot;</span> se eliminará de forma permanente.
              {isFolder ? " Los marcadores dentro se moverán a la carpeta superior." : null}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className={cn(
              "border-app-input-border text-app-fg-secondary rounded-lg border px-4 py-2 text-sm",
              FOCUS_RING,
              "hover:bg-app-raised-muted disabled:opacity-50"
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleConfirm()}
            className={cn(
              "bg-app-danger hover:bg-app-danger-hover rounded-lg px-4 py-2 text-sm font-medium text-white",
              FOCUS_RING,
              "disabled:opacity-50"
            )}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}
