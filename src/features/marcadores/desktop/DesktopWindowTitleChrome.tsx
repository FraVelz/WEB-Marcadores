"use client"

import { clampBounds, TITLE_H } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

type Props = {
  title: string
  subtitle?: string
  minimized: boolean
  maximized: boolean
  cw: number
  ch: number
  bounds: WindowBounds
  showMinimize: boolean
  showMaximize: boolean
  showClose: boolean
  onClose?: () => void
  preMaxBoundsRef: React.MutableRefObject<WindowBounds | null>
  onBoundsChange: (b: WindowBounds) => void
  onActivate: () => void
  onToggleMinimize: () => void
  onToggleMaximize: () => void
  onTitlePointerDown: (e: React.PointerEvent) => void
  onTitleDoubleClick: () => void
}

export function DesktopWindowTitleChrome({
  title,
  subtitle,
  minimized,
  maximized,
  cw,
  ch,
  bounds,
  showMinimize,
  showMaximize,
  showClose,
  onClose,
  preMaxBoundsRef,
  onBoundsChange,
  onActivate,
  onToggleMinimize,
  onToggleMaximize,
  onTitlePointerDown,
  onTitleDoubleClick,
}: Props) {
  return (
    <div
      className={cn(
        "border-app-border relative z-10 flex shrink-0 cursor-default items-center gap-2 border-b px-2",
        minimized ? "rounded-b-lg" : ""
      )}
      style={{
        height: TITLE_H,
        backgroundColor:
          "color-mix(in srgb, var(--app-window-chrome) var(--app-desk-window-solid-pct, 100%), transparent)",
      }}
      onPointerDown={onTitlePointerDown}
      onDoubleClick={onTitleDoubleClick}
    >
      <div className="text-app-fg min-w-0 flex-1 truncate pl-1 text-xs font-semibold tracking-tight select-none">
        {title}
        {subtitle ? <span className="text-app-fg-muted ml-1 font-normal">({subtitle})</span> : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {showMinimize ? (
          <button
            type="button"
            data-window-control
            className={cn(
              "text-app-fg-muted hover:bg-app-hover flex size-7 items-center justify-center rounded",
              FOCUS_RING_ICON_BTN
            )}
            aria-label="Minimizar"
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
              onToggleMinimize()
            }}
          >
            <span className="text-sm leading-none">─</span>
          </button>
        ) : null}
        {showMaximize ? (
          <button
            type="button"
            data-window-control
            className={cn(
              "text-app-fg-muted hover:bg-app-hover flex size-7 items-center justify-center rounded",
              FOCUS_RING_ICON_BTN
            )}
            aria-label={maximized ? "Restaurar" : "Maximizar"}
            onClick={(e) => {
              e.stopPropagation()
              onActivate()
              if (maximized) {
                const prev = preMaxBoundsRef.current
                if (prev) onBoundsChange(clampBounds(prev, cw, ch))
                preMaxBoundsRef.current = null
              } else {
                preMaxBoundsRef.current = { ...clampBounds(bounds, cw, ch) }
              }
              onToggleMaximize()
            }}
          >
            <span className="text-xs leading-none">{maximized ? "❐" : "□"}</span>
          </button>
        ) : null}
        {showClose && onClose ? (
          <button
            type="button"
            data-window-control
            className={cn(
              "hover:bg-app-danger text-app-fg-muted flex size-7 items-center justify-center rounded hover:text-white",
              FOCUS_RING_ICON_BTN
            )}
            aria-label="Cerrar"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <span className="text-sm leading-none">✕</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
