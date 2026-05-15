"use client"

import type { ReactNode } from "react"
import { useCallback, useRef } from "react"

import { DesktopWindowResizeHandles } from "@/features/marcadores/desktop/DesktopWindowResizeHandles"
import { DesktopWindowTitleChrome } from "@/features/marcadores/desktop/DesktopWindowTitleChrome"
import {
  TITLE_H,
  clampBounds,
  maxInset,
  resizeBoundsByEdge,
  type ResizeEdge,
} from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import { isBookmarkDragTransfer } from "@/features/marcadores/utils/parseDragPayload"

import { cn } from "@/lib/utils"

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
  /** Aislar burbuja de drag de marcadores; al pasar por el marco, `onDismissDesktopDropHighlight`. */
  isolateBookmarkDragBubble?: boolean
  onDismissDesktopDropHighlight?: () => void
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
  isolateBookmarkDragBubble = false,
  onDismissDesktopDropHighlight,
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
    (kind: "move" | ResizeEdge, orig: WindowBounds, startX: number, startY: number) => {
      endDrag()

      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (kind === "move") {
          onBoundsChange(clampBounds({ x: orig.x + dx, y: orig.y + dy, w: orig.w, h: orig.h }, cw, ch))
        } else {
          onBoundsChange(resizeBoundsByEdge(orig, kind, dx, dy, cw, ch))
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

  const onResizePointerDown = (edge: ResizeEdge) => (e: React.PointerEvent) => {
    if (e.button !== 0 || minimized || maximized) return
    e.preventDefault()
    e.stopPropagation()
    onActivate()
    attachWindowDrag(edge, { ...bounds }, e.clientX, e.clientY)
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

  const isolateBookmarkDragHandlers = isolateBookmarkDragBubble
    ? {
        onDragEnter: (e: React.DragEvent) => {
          if (isBookmarkDragTransfer(e.dataTransfer)) {
            e.stopPropagation()
            onDismissDesktopDropHighlight?.()
          }
        },
        onDragOver: (e: React.DragEvent) => {
          if (isBookmarkDragTransfer(e.dataTransfer)) {
            e.preventDefault()
            e.stopPropagation()
            onDismissDesktopDropHighlight?.()
          }
        },
      }
    : {}

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
      {...isolateBookmarkDragHandlers}
    >
      <DesktopWindowResizeHandles
        minimized={minimized}
        maximized={maximized}
        onResizePointerDown={onResizePointerDown}
      />

      <DesktopWindowTitleChrome
        title={title}
        subtitle={subtitle}
        minimized={minimized}
        maximized={maximized}
        cw={cw}
        ch={ch}
        bounds={bounds}
        showMinimize={showMinimize}
        showMaximize={showMaximize}
        showClose={showClose}
        onClose={onClose}
        preMaxBoundsRef={preMaxBoundsRef}
        onBoundsChange={onBoundsChange}
        onActivate={onActivate}
        onToggleMinimize={onToggleMinimize}
        onToggleMaximize={onToggleMaximize}
        onTitlePointerDown={onTitlePointerDown}
        onTitleDoubleClick={onTitleDoubleClick}
      />

      {!minimized ? <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div> : null}
    </div>
  )
}
