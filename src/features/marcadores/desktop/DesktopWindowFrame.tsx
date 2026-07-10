"use client"

import type { ReactNode } from "react"
import { useRef } from "react"

import { DesktopWindowResizeHandles } from "@/features/marcadores/desktop/DesktopWindowResizeHandles"
import { DesktopWindowTitleChrome } from "@/features/marcadores/desktop/DesktopWindowTitleChrome"
import {
  clampBounds,
  maxInset,
  resizeBoundsByEdge,
  type ResizeEdge,
} from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import { useBookmarkDragBubbleBlocker } from "@/lib/drag-and-drop"

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
  /** Al pasar a minimizada (antes del toggle): p. ej. devolver foco al lienzo principal. */
  onWillBecomeMinimized?: () => void
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
  onWillBecomeMinimized,
}: Props) {
  const { w: cw, h: ch } = canvasSize
  const dragCleanupRef = useRef<(() => void) | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)

  useBookmarkDragBubbleBlocker(frameRef, isolateBookmarkDragBubble, onDismissDesktopDropHighlight)

  const endDrag = () => {
    dragCleanupRef.current?.()
    dragCleanupRef.current = null
  }

  const visualBounds = maximized && !minimized && cw > 0 && ch > 0 ? maxInset(cw, ch) : clampBounds(bounds, cw, ch)

  const handleToggleMinimize = () => {
    if (!minimized) {
      onWillBecomeMinimized?.()
    }
    onToggleMinimize()
  }

  const attachWindowDrag = (kind: "move" | ResizeEdge, orig: WindowBounds, startX: number, startY: number) => {
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
  }

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

  return (
    <div
      ref={frameRef}
      className={cn(
        "border-app-border-muted absolute flex flex-col overflow-hidden rounded-lg border shadow-2xl",
        minimized && "hidden"
      )}
      style={{
        left: visualBounds.x,
        top: visualBounds.y,
        width: visualBounds.w,
        height: visualBounds.h,
        zIndex,
        backgroundColor: "color-mix(in srgb, var(--app-raised) var(--app-desk-window-solid-pct, 100%), transparent)",
      }}
      onPointerDown={() => onActivate()}
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
        onToggleMinimize={handleToggleMinimize}
        onToggleMaximize={onToggleMaximize}
        onTitlePointerDown={onTitlePointerDown}
        onTitleDoubleClick={onTitleDoubleClick}
      />

      {!minimized ? <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div> : null}
    </div>
  )
}
