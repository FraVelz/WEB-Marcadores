import { readTabScopedItem } from "@/lib/tabScopedStorage"
import { clampBounds } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type {
  MarcadoresDesktopLayoutV1,
  MarcadoresDesktopLayoutV2,
  PersistedDesktopWindowV2,
} from "@/features/marcadores/desktop/windowTypes"
import { DESKTOP_DETAIL_WINDOW_ID } from "@/features/marcadores/desktop/windowTypes"

import type { LibFrame } from "./desktopShellGeometry"
import { defaultLibBounds, toWindowBounds } from "./desktopShellGeometry"

function boundsPersisted(win: PersistedDesktopWindowV2, cw: number, ch: number) {
  return clampBounds(toWindowBounds(win), cw, ch)
}

type ParsedDeskHydration = {
  nextLibFrames: Record<string, LibFrame>
  nextDetail: LibFrame | null
  loadedLibIds: string[] | null
}

/** Lee layout v1/v2 desde string JSON; devuelve fragmentos listos para fusionar. */
function parseDeskLayoutFromStorage(raw: string | null, cw: number, ch: number): ParsedDeskHydration {
  const nextLibFrames: Record<string, LibFrame> = {}
  let nextDetail: LibFrame | null = null
  let loadedLibIds: string[] | null = null
  if (!raw) return { nextLibFrames, nextDetail, loadedLibIds }

  const parsed = JSON.parse(raw) as MarcadoresDesktopLayoutV2 | MarcadoresDesktopLayoutV1
  if (!parsed || typeof parsed !== "object" || !("v" in parsed)) {
    return { nextLibFrames, nextDetail, loadedLibIds }
  }
  if (parsed.v === 2) {
    const v2 = parsed as MarcadoresDesktopLayoutV2
    loadedLibIds = v2.libraryWindowIds?.length ? [...v2.libraryWindowIds] : null
    for (const win of v2.windows || []) {
      if (win.kind === "library") {
        nextLibFrames[win.id] = {
          bounds: boundsPersisted(win, cw, ch),
          minimized: !!win.minimized,
          maximized: !!win.maximized,
        }
      } else if (win.kind === "detail" && win.id === DESKTOP_DETAIL_WINDOW_ID) {
        nextDetail = {
          bounds: boundsPersisted(win, cw, ch),
          minimized: !!win.minimized,
          maximized: !!win.maximized,
        }
      }
    }
    return { nextLibFrames, nextDetail, loadedLibIds }
  }
  if (parsed.v !== 1) return { nextLibFrames, nextDetail, loadedLibIds }

  const v1 = parsed as MarcadoresDesktopLayoutV1
  const nid = `lib-${crypto.randomUUID().slice(0, 8)}`
  loadedLibIds = [nid]
  nextLibFrames[nid] = {
    bounds: clampBounds({ x: v1.library.x, y: v1.library.y, w: v1.library.w, h: v1.library.h }, cw, ch),
    minimized: !!v1.library.minimized,
    maximized: !!v1.library.maximized,
  }
  if (v1.detail) {
    nextDetail = {
      bounds: clampBounds({ x: v1.detail.x, y: v1.detail.y, w: v1.detail.w, h: v1.detail.h }, cw, ch),
      minimized: !!v1.detail.minimized,
      maximized: !!v1.detail.maximized,
    }
  }
  return { nextLibFrames, nextDetail, loadedLibIds }
}

export function readParsedDeskLayout(lsKey: string, cw: number, ch: number): ParsedDeskHydration {
  try {
    const raw = typeof window !== "undefined" ? readTabScopedItem(lsKey) : null
    if (!raw) return { nextLibFrames: {}, nextDetail: null, loadedLibIds: null }
    return parseDeskLayoutFromStorage(raw, cw, ch)
  } catch {
    return { nextLibFrames: {}, nextDetail: null, loadedLibIds: null }
  }
}

export function ensureLibFramesForIds(
  merged: Record<string, LibFrame>,
  finalIds: string[],
  cw: number,
  ch: number
): Record<string, LibFrame> {
  const next = { ...merged }
  for (let i = 0; i < finalIds.length; i++) {
    const id = finalIds[i]
    if (!next[id]) {
      next[id] = { bounds: defaultLibBounds(cw, ch, i), minimized: false, maximized: false }
    }
  }
  const allow = new Set(finalIds)
  for (const k of Object.keys(next)) {
    if (!allow.has(k)) delete next[k]
  }
  return next
}
