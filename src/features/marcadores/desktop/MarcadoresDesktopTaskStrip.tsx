"use client"

import type { DesktopSurfaceTask } from "@/features/marcadores/desktop/windowTypes"

import { cn } from "@/lib/utils"

type Props = {
  surfaces: DesktopSurfaceTask[]
  onFocusTask: (id: string) => void
}

/** Píldoras horizontales tipo barra de tareas para cambiar/enfocar ventanas del escritorio. */
export function MarcadoresDesktopTaskStrip({ surfaces, onFocusTask }: Props) {
  if (surfaces.length === 0) return null

  return (
    <div className="flex min-w-0 shrink items-center gap-2">
      <div
        className="flex min-w-0 shrink items-center gap-1 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:h-1"
        role="list"
        aria-label="Ventanas abiertas en el escritorio"
      >
        {surfaces.map((task) => (
          <button
            key={task.id}
            type="button"
            role="listitem"
            onClick={() => onFocusTask(task.id)}
            title={task.minimized ? "Minimizada — clic para recuperar y enfocar" : "Enfocar esta ventana"}
            className={cn(
              "border-app-border-muted flex max-w-[min(18rem,calc(100vw-14rem))] shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-left transition-colors outline-none select-none",
              "focus-visible:ring-app-focus focus-visible:ring-2",
              task.isFocused
                ? "border-app-accent bg-app-selection shadow-sm"
                : "bg-app-toolbar/95 hover:border-app-accent-muted hover:bg-app-hover dark:bg-app-raised/80",
              task.minimized ? "opacity-75" : "opacity-100"
            )}
          >
            <span className="shrink-0 text-sm leading-none" aria-hidden>
              {task.kind === "detail" ? "◆" : "📚"}
            </span>
            <span className="text-app-fg min-w-0 truncate text-[11px] font-semibold">
              {task.title}
              {task.subtitle ? <span className="text-app-fg-muted ml-1 font-normal">({task.subtitle})</span> : null}
            </span>
            {task.minimized || task.maximized ? (
              <span className="text-app-fg-muted shrink-0 text-[9px] uppercase tabular-nums">
                {task.minimized ? "min" : "max"}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="bg-app-active hidden h-5 w-px shrink-0 sm:block" aria-hidden />
    </div>
  )
}
