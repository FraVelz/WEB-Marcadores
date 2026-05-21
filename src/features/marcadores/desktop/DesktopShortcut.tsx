"use client"

import { cn } from "@/lib/utils"

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
        "border-app-border-muted text-app-fg hover:bg-app-hover focus-visible:ring-app-focus group flex w-[6.75rem] flex-col items-center gap-1.5 rounded-md border p-2 text-center shadow-none outline-none focus-visible:ring-2",
        selected
          ? "border-sky-500/55 bg-sky-500/[0.12] shadow-[inset_0_0_0_1px_rgb(56_189_248_/_0.35)] dark:border-amber-300/45 dark:bg-amber-400/[0.1] dark:shadow-[inset_0_0_0_1px_rgb(251_191_36_/_0.25)]"
          : "border-transparent",
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
