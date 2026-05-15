import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

export const TITLE_H = 36
const MIN_W = 280
const MIN_H = 200
export const DESKTOP_MARGIN = 8
/** Grosor de la zona de agarre en bordes (px), estilo ventana de escritorio. */
export const EDGE_HIT = 6

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

export function clampBounds(b: WindowBounds, cw: number, ch: number): WindowBounds {
  if (!Number.isFinite(cw) || !Number.isFinite(ch) || cw <= 0 || ch <= 0) {
    return {
      x: DESKTOP_MARGIN,
      y: DESKTOP_MARGIN,
      w: Math.max(MIN_W, b.w),
      h: Math.max(MIN_H, b.h),
    }
  }

  const capW = Math.max(1, cw - DESKTOP_MARGIN * 2)
  const capH = Math.max(1, ch - DESKTOP_MARGIN * 2)
  const w = Math.min(Math.max(MIN_W, b.w), capW)
  const h = Math.min(Math.max(MIN_H, b.h), capH)

  const minX = DESKTOP_MARGIN
  const minY = DESKTOP_MARGIN
  const maxX = cw - DESKTOP_MARGIN - w
  const maxY = ch - DESKTOP_MARGIN - h
  const x = Math.min(Math.max(minX, b.x), Math.max(minX, maxX))
  const y = Math.min(Math.max(minY, b.y), Math.max(minY, maxY))
  return { x, y, w, h }
}

export function maxInset(cw: number, ch: number): WindowBounds {
  if (!Number.isFinite(cw) || !Number.isFinite(ch) || cw <= 0 || ch <= 0) {
    return { x: DESKTOP_MARGIN, y: DESKTOP_MARGIN, w: MIN_W, h: MIN_H }
  }
  return {
    x: DESKTOP_MARGIN,
    y: DESKTOP_MARGIN,
    w: Math.max(1, cw - DESKTOP_MARGIN * 2),
    h: Math.max(1, ch - DESKTOP_MARGIN * 2),
  }
}

/** Arrastre de borde o esquina acotado al lienzo actual. */
export function resizeBoundsByEdge(
  orig: WindowBounds,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  cw: number,
  ch: number
): WindowBounds {
  return clampBounds(applyResize(orig, edge, dx, dy), cw, ch)
}
