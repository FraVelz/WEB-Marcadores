"use client"

import { useEffect, useEffectEvent, useId, useRef, useState } from "react"

import { MARCADORES_GLOBAL_ALERT_Z_CLASS } from "@/features/marcadores/utils/layerZIndex"
import { FOCUS_RING } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

type Props = {
  folderName: string
  setFolderName: (v: string) => void
  onRename: () => void | Promise<void>
  onCancel: () => void
}

export default function ToolbarRenameFolderSection({ folderName, setFolderName, onRename, onCancel }: Props) {
  const titleId = useId()
  const errorId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleDialogCancel = useEffectEvent((e: Event) => {
    if (submitting) {
      e.preventDefault()
      return
    }
    onCancel()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancelEvent = (e: Event) => handleDialogCancel(e)
    dialog.addEventListener("cancel", onCancelEvent)
    dialog.showModal()
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      dialog.removeEventListener("cancel", onCancelEvent)
      if (dialog.open) dialog.close()
    }
  }, [])

  const submit = async () => {
    if (submitting) return
    if (!folderName.trim()) {
      setError("El nombre no puede estar vacío.")
      inputRef.current?.focus()
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onRename()
    } catch {
      setError("No se pudo renombrar la carpeta.")
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "backdrop:bg-app-overlay m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-4",
        "fixed inset-0 flex items-center justify-center",
        MARCADORES_GLOBAL_ALERT_Z_CLASS
      )}
      aria-labelledby={titleId}
      data-testid="rename-folder-dialog"
      data-no-vim
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-none bg-transparent p-0"
        aria-label="Cancelar renombrar carpeta"
        disabled={submitting}
        onClick={onCancel}
      />
      <div
        className="border-app-border bg-app-raised relative z-10 w-full max-w-md rounded-xl border p-6 shadow-xl"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-app-fg text-lg font-semibold">
          Renombrar carpeta
        </h2>
        <label className="mt-4 block">
          <span className="text-app-fg-secondary mb-1.5 block text-sm">Nuevo nombre</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Nuevo nombre"
            aria-label="Nuevo nombre"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={folderName}
            disabled={submitting}
            onChange={(e) => {
              setFolderName(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void submit()
              }
            }}
            className={cn(
              "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2 text-sm",
              "placeholder-app-fg-label focus:border-app-focus focus:outline-none",
              error && "border-app-danger"
            )}
          />
        </label>
        {error ? (
          <p id={errorId} role="alert" className="text-app-danger-fg mt-2 text-sm">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={submitting}
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
            disabled={submitting}
            onClick={() => void submit()}
            className={cn(
              "bg-app-primary hover:bg-app-primary-hover rounded-lg px-4 py-2 text-sm font-medium text-white",
              FOCUS_RING,
              "disabled:opacity-50"
            )}
          >
            {submitting ? "Renombrando…" : "Renombrar"}
          </button>
        </div>
      </div>
    </dialog>
  )
}
