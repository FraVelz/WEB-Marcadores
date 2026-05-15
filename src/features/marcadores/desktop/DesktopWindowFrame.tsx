"use client"

import type { ReactNode } from "react"
import { useCallback, useRef } from "react"

import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import { isBookmarkDragTransfer } from "@/features/marcadores/utils/parseDragPayload"

import { cn } from "@/lib/utils"

const TITLE_H = 36
const MIN_W = 280
const MIN_H = 200
const DESKTOP_MARGIN = 8
/** Grosor de la zona de agarre en bordes (px), estilo ventana de escritorio. */
const EDGE_HIT = 6

export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

function applyResize(orig: WindowBounds, edge: ResizeEdge, dx: number, dy: number): WindowBounds {
  let { x, y, w, h } = orig
  switch (edge) {
    case "e":
      w = orig.w + dx
      break
    case "w":
      x = orig.x + dx
      w = orig.w - dx
      break
    case "s":
      h = orig.h + dy
      break
    case "n":
      y = orig.y + dy
      h = orig.h - dy
      break
    case "se":
      w = orig.w + dx
      h = orig.h + dy
      break
    case "sw":
      x = orig.x + dx
      w = orig.w - dx
      h = orig.h + dy
      break
    case "ne":
      w = orig.w + dx
      y = orig.y + dy
      h = orig.h - dy
      break
    case "nw":
      x = orig.x + dx
      w = orig.w - dx
      y = orig.y + dy
      h = orig.h - dy
      break
  }
  return { x, y, w, h }
}

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
  /** Evita que arrastrar marcadores burbujee al lienzo del escritorio (resaltado del fondo). */
  isolateBookmarkDragBubble?: boolean
  /** Al arrastrar sobre el marco de la ventana, oculta el resaltado del fondo del escritorio. */
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
          onBoundsChange(clampBounds(applyResize(orig, kind, dx, dy), cw, ch))
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
      {!minimized && !maximized ? (
        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
          {/* Esquinas (encima de bordes para cursor diagonal) */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar esquina superior izquierda"
            className="pointer-events-auto absolute top-0 left-0 z-10 cursor-nwse-resize"
            style={{ width: EDGE_HIT, height: EDGE_HIT, padding: 0, border: "none", background: "transparent" }}
            onPointerDown={onResizePointerDown("nw")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar esquina superior derecha"
            className="pointer-events-auto absolute top-0 right-0 z-10 cursor-nesw-resize"
            style={{ width: EDGE_HIT, height: EDGE_HIT, padding: 0, border: "none", background: "transparent" }}
            onPointerDown={onResizePointerDown("ne")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar esquina inferior izquierda"
            className="pointer-events-auto absolute bottom-0 left-0 z-10 cursor-nesw-resize"
            style={{ width: EDGE_HIT, height: EDGE_HIT, padding: 0, border: "none", background: "transparent" }}
            onPointerDown={onResizePointerDown("sw")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar esquina inferior derecha"
            className="pointer-events-auto absolute right-0 bottom-0 z-10 cursor-nwse-resize"
            style={{ width: EDGE_HIT, height: EDGE_HIT, padding: 0, border: "none", background: "transparent" }}
            onPointerDown={onResizePointerDown("se")}
          />
          {/* Bordes (dejamos hueco en esquinas) */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar borde superior"
            className="pointer-events-auto absolute top-0 z-[9] cursor-ns-resize"
            style={{
              height: EDGE_HIT,
              left: EDGE_HIT,
              right: EDGE_HIT,
              padding: 0,
              border: "none",
              background: "transparent",
            }}
            onPointerDown={onResizePointerDown("n")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar borde inferior"
            className="pointer-events-auto absolute bottom-0 z-[9] cursor-ns-resize"
            style={{
              height: EDGE_HIT,
              left: EDGE_HIT,
              right: EDGE_HIT,
              padding: 0,
              border: "none",
              background: "transparent",
            }}
            onPointerDown={onResizePointerDown("s")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar borde izquierdo"
            className="pointer-events-auto absolute left-0 z-[9] cursor-ew-resize"
            style={{
              width: EDGE_HIT,
              top: EDGE_HIT,
              bottom: EDGE_HIT,
              padding: 0,
              border: "none",
              background: "transparent",
            }}
            onPointerDown={onResizePointerDown("w")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Redimensionar borde derecho"
            className="pointer-events-auto absolute right-0 z-[9] cursor-ew-resize"
            style={{
              width: EDGE_HIT,
              top: EDGE_HIT,
              bottom: EDGE_HIT,
              padding: 0,
              border: "none",
              background: "transparent",
            }}
            onPointerDown={onResizePointerDown("e")}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "bg-app-window-chrome border-app-border relative z-10 flex shrink-0 cursor-default items-center gap-2 border-b px-2",
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

      {!minimized ? <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div> : null}
    </div>
  )
}

export { TITLE_H, clampBounds, maxInset, MIN_W, MIN_H, DESKTOP_MARGIN, EDGE_HIT }
