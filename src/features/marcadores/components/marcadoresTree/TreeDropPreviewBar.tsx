"use client"

import { cnLines } from "@/lib/utils"

export function TreeDropPreviewBar({ line }: { line: string }) {
  return (
    <div
      className={cnLines(
        "border-app-border bg-app-toolbar text-app-fg border-t px-3 py-2 text-sm",
        "shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      )}
      aria-live="polite"
    >
      <span className="text-app-fg-label">Destino al soltar: </span>
      <span className="font-medium">{line}</span>
    </div>
  )
}
