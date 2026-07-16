"use client"

import { useId, useRef, useState } from "react"

import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

import type { ImportSummary } from "../hooks/persistMarcadoresImport"

type Props = {
  onExportJson: () => void
  onImportFile: (file: File) => Promise<ImportSummary>
  busy?: boolean
}

export function ToolbarImportExportSection({ onExportJson, onImportFile, busy = false }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const iconBtn = cn(
    "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded-lg p-2 transition-colors disabled:opacity-50",
    FOCUS_RING_ICON_BTN
  )

  const handlePick = () => {
    setError(null)
    inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setImporting(true)
    setError(null)
    setStatus(null)
    try {
      const summary = await onImportFile(file)
      setStatus(
        `Importado: ${summary.bookmarksCreated} enlaces, ${summary.foldersCreated} carpetas` +
          (summary.skippedLinks ? ` (${summary.skippedLinks} omitidos)` : "")
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo importar el archivo")
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const disabled = busy || importing

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={iconBtn}
          title="Exportar JSON"
          aria-label="Exportar marcadores a JSON"
          disabled={disabled}
          onClick={onExportJson}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.84v4h5.66V9h3.84L12 2z" />
          </svg>
        </button>
        <button
          type="button"
          className={iconBtn}
          title="Importar HTML Netscape o JSON"
          aria-label="Importar HTML Netscape o JSON"
          disabled={disabled}
          onClick={handlePick}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5 4h14v2H5V4zm7 4l6.67 7h-3.84v5H9.17v-5H5.33L12 8z" />
          </svg>
        </button>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".html,.htm,.json,text/html,application/json"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {status ? <p className="text-app-fg-muted text-[11px]">{status}</p> : null}
      {error ? (
        <p className="text-app-danger-fg text-[11px]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
