"use client"

import { cn } from "@/lib/utils"

import { type MarcadoresViewMode, useMarcadoresViewMode } from "@/features/marcadores/hooks/useMarcadoresViewMode"

const OPTIONS: { value: MarcadoresViewMode; label: string }[] = [
  { value: "escritorio", label: "Escritorio" },
  { value: "simple", label: "Simple" },
]

type MarcadoresViewModeToggleProps = {
  className?: string
  /** Cabecera móvil: botones más pequeños. */
  compact?: boolean
}

export function MarcadoresViewModeToggle({ className, compact }: MarcadoresViewModeToggleProps) {
  const { mode, setMode } = useMarcadoresViewMode()

  return (
    <div
      role="radiogroup"
      aria-label="Modo de vista de Marcadores"
      className={cn(
        "border-app-border bg-app-canvas/80 flex shrink-0 items-center gap-0.5 rounded-md border p-0.5 backdrop-blur-sm",
        compact ? "scale-95" : "",
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const selected = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cn(
              "rounded px-2 font-medium whitespace-nowrap transition-colors",
              compact ? "min-h-7 py-1 text-[10px]" : "min-h-8 py-1.5 text-xs",
              selected
                ? "bg-app-nav-active text-app-fg shadow-sm"
                : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
            )}
            onClick={() => setMode(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
