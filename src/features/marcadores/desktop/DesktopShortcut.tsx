"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING, KEYBOARD_SELECTED } from "@/lib/focusStyles"

type Props = {
  label: string
  icon: React.ReactNode
  onDoubleClick: () => void
  /** Estilo “icono seleccionado” tipo escritorio. */
  selected?: boolean
  className?: string
}

export function DesktopShortcut({ label, icon, onDoubleClick, selected, className }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "border-app-border-muted text-app-fg hover:bg-app-hover group flex w-[6.75rem] flex-col items-center gap-1.5 rounded-md border p-2 text-center shadow-none",
        FOCUS_RING,
        selected ? KEYBOARD_SELECTED : "border-transparent",
        className
      )}
      onDoubleClick={(e) => {
        e.preventDefault()
        onDoubleClick()
      }}
      title={`${label} (doble clic para abrir)`}
    >
      <span className="bg-app-raised group-hover:bg-app-sidebar flex size-14 items-center justify-center rounded-lg border border-white/10 text-3xl shadow-md">
        {icon}
      </span>
      <span className="text-app-fg line-clamp-2 w-full max-w-[6.75rem] text-xs leading-tight font-medium">{label}</span>
    </button>
  )
}
