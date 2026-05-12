"use client"

import { cn } from "@/lib/utils"

export default function DemoBanner() {
  return (
    <div
      className={cn(
        "border-app-warn-border flex flex-col items-start gap-1 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-center sm:gap-2",
        "bg-app-warn-surface text-app-warn-fg text-xs sm:text-sm"
      )}
    >
      <span className="font-medium">Modo demo</span>
      <span className="text-app-warn-fg-accent">Datos de ejemplo: no son tus marcadores.</span>
    </div>
  )
}
