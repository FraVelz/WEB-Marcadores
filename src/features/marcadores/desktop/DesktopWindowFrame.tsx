"use client"

import type { ReactNode } from "react"
import { useCallback, useRef } from "react"

import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

import { cn } from "@/lib/utils"

const TITLE_H = 36
const MIN_W = 280
const MIN_H = 200
const DESKTOP_MARGIN = 8

function clampBounds(b: WindowBounds, cw: number, ch: number): WindowBounds {
  const maxW = Math.max(MIN_W, cw - DESKTOP_MARGIN * 2)
  const maxH = Math.max(MIN_H, ch - DESKTOP_MARGIN * 2)
  const w = Math.min(Math.max(MIN_W, b.w), maxW)
  const h = Math.min(Math.max(MIN_H, b.h), maxH)
  const x = Math.min(Math.max(DESKTOP_MARGIN, b.x), cw - DESKTOP_MARGIN - w)
  const y = Math.min(Math.max(DESKTOP_MARGIN, b.y), ch - DESKTOP_MARGIN - h)
  return { x, y, w, h }
}

function maxInset(cw: number, ch: number): WindowBounds {
  return {
    x: DESKTOP_MARGIN,
    y: DESKTOP_MARGIN,
    w: cw - DESKTOP_MARGIN * 2,
    h: ch - DESKTOP_MARGIN * 2,
  }
}

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  canvasSize: { w: number; h: number }
  bounds: WindowBounds
  onBoundsChange: (b: WindowBounds) => void
  minimized: boolean
  maximized: boolean
  onToggleMinimize: () => void
  onToggleMaximize: () => void
  preMaxBoundsRef: React.MutableRefObject<WindowBounds | null>
  zIndex: number
  onActivate: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
  onClose?: () => void
}

export function DesktopWindowFrame({
  title,
  subtitle,
  children,
  canvasSize,
  bounds,
  onBoundsChange,
  minimized,
  maximized,
  onToggleMinimize,
  onToggleMaximize,
  preMaxBoundsRef,
  zIndex,
  onActivate,
  showMinimize = true,
  showMaximize = true,
  showClose = false,
  onClose,
}: Props) {
  const { w: cw, h: ch } = canvasSize
  const dragCleanupRef = useRef<(() => void) | null>(null)

  const endDrag = useCallback(() => {
    dragCleanupRef.current?.()
    dragCleanupRef.current = null
  }, [])

  const visualBounds = minimized
    ? { ...bounds, h: TITLE_H }
    : maximized && cw > 0 && ch > 0
      ? maxInset(cw, ch)
      : clampBounds(bounds, cw, ch)

  const attachWindowDrag = useCallback(
    (kind: "move" | "resize", orig: WindowBounds, startX: number, startY: number) => {
      endDrag()

      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (kind === "move") {
          onBoundsChange(clampBounds({ x: orig.x + dx, y: orig.y + dy, w: orig.w, h: orig.h }, cw, ch))
        } else {
          onBoundsChange(clampBounds({ ...orig, w: orig.w + dx, h: orig.h + dy }, cw, ch))
        }
      }

      const onUp = () => endDrag()

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onUp)

      dragCleanupRef.current = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onUp)
      }
    },
    [cw, ch, endDrag, onBoundsChange]
  )

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest("[data-window-control]")) return
    onActivate()
    if (minimized || maximized) return
    e.preventDefault()
    attachWindowDrag("move", { ...bounds }, e.clientX, e.clientY)
  }

  const onResizePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || minimized || maximized) return
    e.preventDefault()
    e.stopPropagation()
    onActivate()
    attachWindowDrag("resize", { ...bounds }, e.clientX, e.clientY)
  }

  const onTitleDoubleClick = () => {
    if (!showMaximize) return
    if (maximized) {
      const prev = preMaxBoundsRef.current
      if (prev) onBoundsChange(clampBounds(prev, cw, ch))
      preMaxBoundsRef.current = null
      onToggleMaximize()
    } else {
      preMaxBoundsRef.current = { ...clampBounds(bounds, cw, ch) }
      onToggleMaximize()
    }
  }

  return (
    <div
      className={cn(
        "border-app-border-muted bg-app-raised absolute flex flex-col overflow-hidden rounded-lg border shadow-2xl",
        minimized && "opacity-95"
      )}
      style={{
        left: visualBounds.x,
        top: visualBounds.y,
        width: visualBounds.w,
        height: visualBounds.h,
        zIndex,
      }}
      onPointerDown={() => onActivate()}
    >
      <div
        className={cn(
          "bg-app-window-chrome border-app-border flex shrink-0 cursor-default items-center gap-2 border-b px-2",
          minimized ? "rounded-b-lg" : ""
        )}
        style={{ height: TITLE_H }}
        onPointerDown={onTitlePointerDown}
        onDoubleClick={onTitleDoubleClick}
      >
        <div className="text-app-fg min-w-0 flex-1 truncate pl-1 text-xs font-semibold tracking-tight select-none">
          {title}
          {subtitle ? <span className="text-app-fg-muted ml-1 font-normal">— {subtitle}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {showMinimize ? (
            <button
              type="button"
              data-window-control
              className="text-app-fg-muted hover:bg-app-hover flex size-7 items-center justify-center rounded"
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
              className="text-app-fg-muted hover:bg-app-hover flex size-7 items-center justify-center rounded"
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
              className="hover:bg-app-danger text-app-fg-muted flex size-7 items-center justify-center rounded hover:text-white"
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

      {!minimized ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          {!maximized ? (
            <button
              type="button"
              aria-label="Redimensionar"
              className="absolute right-0.5 bottom-0.5 size-3 cursor-nwse-resize opacity-60 hover:opacity-100"
              onPointerDown={onResizePointerDown}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export { TITLE_H, clampBounds, maxInset, MIN_W, MIN_H, DESKTOP_MARGIN }
