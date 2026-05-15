"use client"

import { cnLines } from "@/lib/utils"

export function EmptyTreeState({ onAddBookmark, onNewFolder }: { onAddBookmark: () => void; onNewFolder: () => void }) {
  return (
    <div className="text-app-fg-label flex flex-col items-center justify-center py-16">
      <svg className="text-app-empty-icon mb-4 size-16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v12h4v4h10V11h-7v8h-2v-8h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5zM7 15H4v-4h3v4zm10 6h3v4h-3v-4z" />
      </svg>
      <p className="text-sm">No hay carpetas ni marcadores</p>
      <button
        type="button"
        onClick={onAddBookmark}
        className="bg-app-primary hover:bg-app-primary-hover mt-2 rounded px-4 py-2 text-sm text-white"
      >
        Agregar marcador
      </button>
      <button
        type="button"
        onClick={onNewFolder}
        className={cnLines(
          "border-app-input-border text-app-fg-secondary mt-2 rounded border px-4 py-2 text-sm",
          "hover:bg-app-raised-muted"
        )}
      >
        Nueva carpeta
      </button>
    </div>
  )
}
