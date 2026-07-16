"use client"

import { cn } from "@/lib/utils"
import { MARCADORES_GLOBAL_ALERT_Z_CLASS } from "@/features/marcadores/utils/layerZIndex"

export default function DemoBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="demo-banner"
      className={cn(
        "border-app-warn-border sticky top-0 flex flex-col items-start gap-1.5 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5",
        "bg-app-warn-surface text-app-warn-fg text-xs sm:text-sm",
        MARCADORES_GLOBAL_ALERT_Z_CLASS
      )}
    >
      <span className="flex items-center gap-2 font-semibold tracking-tight">
        <svg
          className="text-app-warn-fg size-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Modo demo</span>
      </span>
      <span className="text-app-warn-fg-accent">
        Datos de ejemplo en memoria: no son tus marcadores ni se guardan en tu cuenta.
      </span>
    </div>
  )
}
