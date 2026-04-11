"use client"

import { cn } from "@/lib/utils"

export default function DemoBanner() {
  return (
    <div
      className={cn(
        "border-app-warn-border flex items-center justify-center gap-2 border-b",
        "bg-app-warn-surface text-app-warn-fg px-3 py-2 text-sm"
      )}
    >
      <span className="font-medium">Modo demo</span>
      <span className="text-app-warn-fg-accent">— Datos de ejemplo. No son tus marcadores.</span>
    </div>
  )
}
