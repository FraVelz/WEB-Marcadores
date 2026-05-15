import { clampBounds } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { PersistedDesktopWindowV2, WindowBounds } from "@/features/marcadores/desktop/windowTypes"

import { CASCADE } from "./desktopShellConstants"

export type LibFrame = {
  bounds: WindowBounds
  minimized: boolean
  maximized: boolean
}

export function defaultLibBounds(cw: number, ch: number, index: number): WindowBounds {
  const gap = 16
  const o = (index % 6) * CASCADE
  const w = Math.floor(cw * 0.52)
  const h = ch - gap * 2
  return clampBounds({ x: gap + o, y: gap + o * 0.55, w, h }, cw, ch)
}

export function defaultDetailBounds(cw: number, ch: number): WindowBounds {
  const gap = 12
  const winW = Math.min(400, cw - gap * 2)
  const h = ch - gap * 2
  const x = cw - gap - winW
  return clampBounds({ x, y: gap, w: winW, h }, cw, ch)
}

export function toWindowBounds(w: PersistedDesktopWindowV2): WindowBounds {
  return { x: w.x, y: w.y, w: w.w, h: w.h }
}

export function mergeLibraryFrameRecord(
  prev: Record<string, LibFrame>,
  ids: string[],
  cw: number,
  ch: number
): Record<string, LibFrame> {
  const next: Record<string, LibFrame> = { ...prev }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    if (!next[id]) {
      next[id] = {
        bounds: defaultLibBounds(cw, ch, i),
        minimized: false,
        maximized: false,
      }
    } else {
      next[id] = {
        ...next[id],
        bounds: clampBounds(next[id].bounds, cw, ch),
      }
    }
  }
  const allow = new Set(ids)
  for (const k of Object.keys(next)) {
    if (!allow.has(k)) delete next[k]
  }
  return next
}
