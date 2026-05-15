"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { DesktopShortcut } from "@/features/marcadores/desktop/DesktopShortcut"
import { DesktopWindowFrame, clampBounds, DESKTOP_MARGIN } from "@/features/marcadores/desktop/DesktopWindowFrame"
import { MarcadoresDesktopLayoutBar } from "@/features/marcadores/desktop/MarcadoresDesktopLayoutBar"
import { MarcadoresDesktopTaskStrip } from "@/features/marcadores/desktop/MarcadoresDesktopTaskStrip"
import { isBookmarkDragTransfer } from "@/features/marcadores/utils/parseDragPayload"
import { useDashboard } from "@/contexts/DashboardContext"
import type {
  DesktopSurfaceTask,
  DesktopWmExtras,
  MarcadoresDesktopLayoutV1,
  MarcadoresDesktopLayoutV2,
  PersistedDesktopWindowV2,
  WindowBounds,
} from "@/features/marcadores/desktop/windowTypes"
import { DESKTOP_DETAIL_WINDOW_ID } from "@/features/marcadores/desktop/windowTypes"

import { cn } from "@/lib/utils"
import { readTabScopedItem, writeTabScopedItem } from "@/lib/tabScopedStorage"

const MIN_CANVAS = 64
const CASCADE = 26
/** Hueco entre ventanas al usar «Dos columnas». */
const TILE_COLUMN_GAP = 8

function desktopWmStorageKeyBase(workspaceId: string | null) {
  return `marcadores_wm_${workspaceId ?? "default"}`
}

function defaultLibBounds(cw: number, ch: number, index: number): WindowBounds {
  const gap = 16
  const o = (index % 6) * CASCADE
  const w = Math.floor(cw * 0.52)
  const h = ch - gap * 2
  return clampBounds({ x: gap + o, y: gap + o * 0.55, w, h }, cw, ch)
}

function defaultDetailBounds(cw: number, ch: number): WindowBounds {
  const gap = 12
  const w = Math.min(400, cw - gap * 2)
  const h = ch - gap * 2
  const x = cw - gap - w
  return clampBounds({ x, y: gap, w, h }, cw, ch)
}

function toWindowBounds(w: PersistedDesktopWindowV2): WindowBounds {
  return { x: w.x, y: w.y, w: w.w, h: w.h }
}

type LibFrame = {
  bounds: WindowBounds
  minimized: boolean
  maximized: boolean
}

function mergeLibraryFrameRecord(
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

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

export type MarcadoresDesktopShellProps = {
  workspaceId: string | null
  libraryWindowIds: string[]
  setLibraryWindowIds: React.Dispatch<React.SetStateAction<string[]>>
  onAddLibraryWindow: () => void
  focusedLibraryPaneId: string | null
  onFocusLibraryPane: (id: string) => void
  /** Banners globales sobre el escritorio (errores, confirmaciones, demo). */
  floatingOverlays?: ReactNode
  renderLibraryPane: (windowId: string, focused: boolean) => ReactNode

  detailOpen: boolean
  detailTitle?: string
  detailContent: ReactNode | null
  onCloseDetail: () => void
  onRequestCloseLibraryWindow: (id: string) => void
}

export function MarcadoresDesktopShell({
  workspaceId,
  libraryWindowIds,
  setLibraryWindowIds,
  onAddLibraryWindow,
  focusedLibraryPaneId,
  onFocusLibraryPane,
  floatingOverlays,
  renderLibraryPane,
  detailOpen,
  detailTitle,
  detailContent,
  onCloseDetail,
  onRequestCloseLibraryWindow,
}: MarcadoresDesktopShellProps) {
  const { registerExplorerWideHeaderEnd } = useDashboard()
  const hostRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState({ w: 0, h: 0 })

  const [libFrames, setLibFrames] = useState<Record<string, LibFrame>>({})
  const [detailFrame, setDetailFrame] = useState<LibFrame | null>(null)

  const libraryPreMaxMap = useMemo(() => {
    const m = new Map<string, PreMaxBox>()
    for (const id of libraryWindowIds) {
      m.set(id, { current: null } satisfies React.MutableRefObject<WindowBounds | null>)
    }
    return m
  }, [libraryWindowIds])

  const preMaxDetail = useRef<WindowBounds | null>(null)

  const libIdsRef = useRef(libraryWindowIds)

  useEffect(() => {
    libIdsRef.current = libraryWindowIds
  }, [libraryWindowIds])

  const zSeq = useRef(120)
  const [zLib, setZLib] = useState<Record<string, number>>({})
  const [zDetail, setZDetail] = useState(115)

  type FocusedSurface = { kind: "library"; id: string } | { kind: "detail" }
  const [focusedSurface, setFocusedSurface] = useState<FocusedSurface>(() => ({
    kind: "library",
    id: libraryWindowIds[0] ?? "",
  }))

  useEffect(() => {
    setFocusedSurface((prev) => {
      if (prev.kind === "detail") return prev
      if (prev.kind === "library" && libraryWindowIds.includes(prev.id)) return prev
      return { kind: "library", id: libraryWindowIds[0] ?? "" }
    })
  }, [libraryWindowIds])

  useEffect(() => {
    if (!detailOpen) {
      setFocusedSurface((prev) => (prev.kind === "detail" ? { kind: "library", id: libraryWindowIds[0] ?? "" } : prev))
    }
  }, [detailOpen, libraryWindowIds])

  useEffect(() => {
    setFocusedSurface((prev) => {
      if (prev.kind === "detail") return prev
      const id = focusedLibraryPaneId
      if (!id) return prev
      if (prev.kind === "library" && prev.id === id) return prev
      return { kind: "library", id }
    })
  }, [focusedLibraryPaneId])

  const key = useMemo(() => desktopWmStorageKeyBase(workspaceId), [workspaceId])
  const hydratedRef = useRef(false)
  const [deskReady, setDeskReady] = useState(false)
  const [deskCanvasDropHighlight, setDeskCanvasDropHighlight] = useState(false)

  useEffect(() => {
    const clear = () => setDeskCanvasDropHighlight(false)
    window.addEventListener("dragend", clear)
    return () => window.removeEventListener("dragend", clear)
  }, [])

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedulePersist = useCallback(() => {
    if (typeof window === "undefined") return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      persistTimer.current = null
      try {
        const wins: PersistedDesktopWindowV2[] = []
        for (const id of libraryWindowIds) {
          const f = libFrames[id]
          if (!f) continue
          wins.push({
            id,
            kind: "library",
            ...f.bounds,
            minimized: f.minimized,
            maximized: f.maximized,
          })
        }
        if (detailFrame) {
          wins.push({
            id: DESKTOP_DETAIL_WINDOW_ID,
            kind: "detail",
            ...detailFrame.bounds,
            minimized: detailFrame.minimized,
            maximized: detailFrame.maximized,
          })
        }
        const payload: MarcadoresDesktopLayoutV2 = {
          v: 2,
          libraryWindowIds: [...libraryWindowIds],
          windows: wins,
        }
        writeTabScopedItem(key, JSON.stringify(payload))
      } catch {
        /* ignore */
      }
    }, 300)
  }, [detailFrame, key, libFrames, libraryWindowIds])

  useEffect(() => {
    schedulePersist()
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [schedulePersist])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const lsKey = desktopWmStorageKeyBase(workspaceId)
    hydratedRef.current = false
    const apply = () => {
      const r = el.getBoundingClientRect()
      const w = Math.floor(r.width)
      const h = Math.floor(r.height)
      setCanvas({ w, h })
      if (w < MIN_CANVAS || h < MIN_CANVAS) return

      if (!hydratedRef.current) {
        hydratedRef.current = true

        const nextLibFrames: Record<string, LibFrame> = {}
        let nextDetail: LibFrame | null = null
        let loadedLibIds: string[] | null = null

        try {
          const raw = typeof window !== "undefined" ? readTabScopedItem(lsKey) : null
          if (raw) {
            const parsed = JSON.parse(raw) as MarcadoresDesktopLayoutV2 | MarcadoresDesktopLayoutV1
            if (parsed && typeof parsed === "object" && "v" in parsed && parsed.v === 2) {
              const v2 = parsed as MarcadoresDesktopLayoutV2
              loadedLibIds = v2.libraryWindowIds?.length ? [...v2.libraryWindowIds] : null
              for (const win of v2.windows || []) {
                if (win.kind === "library") {
                  nextLibFrames[win.id] = {
                    bounds: clampBounds(toWindowBounds(win), w, h),
                    minimized: !!win.minimized,
                    maximized: !!win.maximized,
                  }
                } else if (win.kind === "detail" && win.id === DESKTOP_DETAIL_WINDOW_ID) {
                  nextDetail = {
                    bounds: clampBounds(toWindowBounds(win), w, h),
                    minimized: !!win.minimized,
                    maximized: !!win.maximized,
                  }
                }
              }
            } else if (parsed && typeof parsed === "object" && "v" in parsed && parsed.v === 1) {
              const v1 = parsed as MarcadoresDesktopLayoutV1
              const nid = `lib-${crypto.randomUUID().slice(0, 8)}`
              loadedLibIds = [nid]
              nextLibFrames[nid] = {
                bounds: clampBounds({ x: v1.library.x, y: v1.library.y, w: v1.library.w, h: v1.library.h }, w, h),
                minimized: !!v1.library.minimized,
                maximized: !!v1.library.maximized,
              }
              if (v1.detail) {
                nextDetail = {
                  bounds: clampBounds({ x: v1.detail.x, y: v1.detail.y, w: v1.detail.w, h: v1.detail.h }, w, h),
                  minimized: !!v1.detail.minimized,
                  maximized: !!v1.detail.maximized,
                }
              }
            }
          }
        } catch {
          /* ignore */
        }

        if (loadedLibIds && loadedLibIds.length > 0) {
          setLibraryWindowIds(loadedLibIds)
        }

        setLibFrames((prev) => {
          const merged: Record<string, LibFrame> = { ...prev, ...nextLibFrames }
          const finalIds = loadedLibIds ?? libIdsRef.current
          for (let i = 0; i < finalIds.length; i++) {
            const id = finalIds[i]
            if (!merged[id]) {
              merged[id] = {
                bounds: defaultLibBounds(w, h, i),
                minimized: false,
                maximized: false,
              }
            }
          }
          const allow = new Set(finalIds)
          for (const k of Object.keys(merged)) {
            if (!allow.has(k)) delete merged[k]
          }
          return merged
        })

        setDetailFrame((prev) => nextDetail ?? prev)
        setDeskReady(true)
        return
      }

      setLibFrames((prev) => mergeLibraryFrameRecord(prev, libIdsRef.current, w, h))

      setDetailFrame((prev) => {
        if (!prev) return prev
        return { ...prev, bounds: clampBounds(prev.bounds, w, h) }
      })
    }

    const ro = new ResizeObserver(apply)
    ro.observe(el)
    apply()

    return () => ro.disconnect()
  }, [setLibraryWindowIds, workspaceId])

  useEffect(() => {
    if (!deskReady) return
    const el = hostRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const w = Math.floor(r.width)
    const h = Math.floor(r.height)
    if (w < MIN_CANVAS || h < MIN_CANVAS) return
    setLibFrames((prev) => mergeLibraryFrameRecord(prev, libraryWindowIds, w, h))
  }, [libraryWindowIds, deskReady])

  useEffect(() => {
    if (!detailOpen || canvas.w < MIN_CANVAS || canvas.h < MIN_CANVAS) return
    const id = requestAnimationFrame(() => {
      setDetailFrame((prev) => {
        if (prev) return prev
        return {
          bounds: defaultDetailBounds(canvas.w, canvas.h),
          minimized: false,
          maximized: false,
        }
      })
    })
    return () => cancelAnimationFrame(id)
  }, [detailOpen, canvas.w, canvas.h])

  useEffect(() => {
    if (!detailOpen) return
    const id = requestAnimationFrame(() => {
      zSeq.current += 1
      setZDetail(zSeq.current)
    })
    return () => cancelAnimationFrame(id)
  }, [detailOpen])

  const setLibBounds = (id: string, b: WindowBounds) => {
    setLibFrames((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      return { ...prev, [id]: { ...cur, bounds: b } }
    })
  }

  const setDetailBounds = (b: WindowBounds) => {
    setDetailFrame((prev) => (prev ? { ...prev, bounds: b } : prev))
  }

  const tileTwoColumns = useCallback(() => {
    if (libraryWindowIds.length !== 2) return
    const cw = canvas.w
    const ch = canvas.h
    if (cw < MIN_CANVAS || ch < MIN_CANVAS) return
    const [leftId, rightId] = libraryWindowIds
    const g = DESKTOP_MARGIN
    const usableW = cw - g * 2 - TILE_COLUMN_GAP
    const wLeft = Math.floor(usableW / 2)
    const wRight = usableW - wLeft
    const h = ch - g * 2
    const leftBounds = clampBounds({ x: g, y: g, w: wLeft, h }, cw, ch)
    const rightBounds = clampBounds({ x: g + wLeft + TILE_COLUMN_GAP, y: g, w: wRight, h }, cw, ch)

    setLibFrames((prev) => {
      const a = prev[leftId]
      const b = prev[rightId]
      if (!a || !b) return prev
      return {
        ...prev,
        [leftId]: { ...a, bounds: leftBounds, maximized: false, minimized: false },
        [rightId]: { ...b, bounds: rightBounds, maximized: false, minimized: false },
      }
    })
  }, [canvas.w, canvas.h, libraryWindowIds])

  const focusTask = useCallback(
    (id: string) => {
      if (id === DESKTOP_DETAIL_WINDOW_ID) {
        zSeq.current += 1
        setZDetail(zSeq.current)
        setFocusedSurface({ kind: "detail" })
        return
      }
      zSeq.current += 1
      setZLib((z) => ({ ...z, [id]: zSeq.current }))
      setFocusedSurface({ kind: "library", id })
      onFocusLibraryPane(id)
    },
    [onFocusLibraryPane]
  )

  const minimizeAllWindows = useCallback(() => {
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (cur) next[wid] = { ...cur, minimized: true }
      }
      return next
    })
    setDetailFrame((prev) => (prev ? { ...prev, minimized: true } : prev))
  }, [libraryWindowIds])

  const restoreMinimizedWindows = useCallback(() => {
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (cur) next[wid] = { ...cur, minimized: false }
      }
      return next
    })
    setDetailFrame((prev) => (prev ? { ...prev, minimized: false } : prev))
  }, [libraryWindowIds])

  const maximizeAllWindows = useCallback(() => {
    const { w: cw, h: ch } = canvas
    if (cw < MIN_CANVAS || ch < MIN_CANVAS) return
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (!cur) continue
        const refBox = libraryPreMaxMap.get(wid)
        if (!cur.maximized && refBox) refBox.current = { ...clampBounds(cur.bounds, cw, ch) }
        next[wid] = { ...cur, minimized: false, maximized: true }
      }
      return next
    })
    setDetailFrame((prev) => {
      if (!prev) return prev
      if (!prev.maximized) preMaxDetail.current = { ...clampBounds(prev.bounds, cw, ch) }
      return { ...prev, minimized: false, maximized: true }
    })
  }, [canvas, libraryWindowIds, libraryPreMaxMap])

  const restoreWindowSizes = useCallback(() => {
    const { w: cw, h: ch } = canvas
    if (cw < MIN_CANVAS || ch < MIN_CANVAS) return
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (!cur) continue
        const refBox = libraryPreMaxMap.get(wid)
        let bounds = cur.bounds
        if (cur.maximized && refBox?.current) bounds = clampBounds(refBox.current, cw, ch)
        else bounds = clampBounds(cur.bounds, cw, ch)
        if (refBox) refBox.current = null
        next[wid] = { ...cur, maximized: false, bounds }
      }
      return next
    })
    setDetailFrame((prev) => {
      if (!prev) return prev
      let bounds = prev.bounds
      if (prev.maximized && preMaxDetail.current) bounds = clampBounds(preMaxDetail.current, cw, ch)
      preMaxDetail.current = null
      return { ...prev, maximized: false, bounds }
    })
  }, [canvas, libraryWindowIds, libraryPreMaxMap])

  const desktopWm = useMemo((): DesktopWmExtras => {
    const tasks: DesktopSurfaceTask[] = libraryWindowIds.map((wid, idx) => {
      const f = libFrames[wid]
      return {
        id: wid,
        title: "Marcadores",
        subtitle: libraryWindowIds.length > 1 ? `#${idx + 1}` : undefined,
        minimized: f?.minimized ?? false,
        maximized: f?.maximized ?? false,
        isFocused: focusedSurface.kind === "library" && focusedSurface.id === wid,
        kind: "library",
      }
    })
    if (detailOpen && detailFrame) {
      tasks.push({
        id: DESKTOP_DETAIL_WINDOW_ID,
        title: "Propiedades",
        subtitle: detailTitle,
        minimized: detailFrame.minimized,
        maximized: detailFrame.maximized,
        isFocused: focusedSurface.kind === "detail",
        kind: "detail",
      })
    }
    return {
      tasks,
      focusTask,
      minimizeAll: minimizeAllWindows,
      restoreMinimized: restoreMinimizedWindows,
      maximizeAll: maximizeAllWindows,
      restoreWindowSizes,
    }
  }, [
    detailFrame,
    detailOpen,
    detailTitle,
    focusTask,
    focusedSurface,
    libFrames,
    libraryWindowIds,
    maximizeAllWindows,
    minimizeAllWindows,
    restoreMinimizedWindows,
    restoreWindowSizes,
  ])

  const canCloseLibrary = libraryWindowIds.length > 1
  const deskSurfaceReady = deskReady && canvas.w >= MIN_CANVAS && canvas.h >= MIN_CANVAS

  const canTileTwoColumns = libraryWindowIds.length === 2
  const explorerHeaderDeskToolbar = useMemo(() => {
    const headerDeskTasks = desktopWm.tasks
    const headerFocusDeskTask = desktopWm.focusTask
    return (
      <div className="flex min-w-0 items-center gap-2">
        <MarcadoresDesktopTaskStrip surfaces={headerDeskTasks} onFocusTask={headerFocusDeskTask} />
        <MarcadoresDesktopLayoutBar
          canTileTwoColumns={canTileTwoColumns}
          onTileTwoColumns={tileTwoColumns}
          deskSurfaceReady={deskSurfaceReady}
          onMinimizeAll={minimizeAllWindows}
          onRestoreMinimized={restoreMinimizedWindows}
          onMaximizeAll={maximizeAllWindows}
          onRestoreWindowSizes={restoreWindowSizes}
          inlineInExplorerHeader
        />
      </div>
    )
  }, [
    desktopWm,
    canTileTwoColumns,
    tileTwoColumns,
    deskSurfaceReady,
    minimizeAllWindows,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  ])

  useEffect(() => {
    registerExplorerWideHeaderEnd(explorerHeaderDeskToolbar)
    return () => {
      registerExplorerWideHeaderEnd(null)
    }
  }, [explorerHeaderDeskToolbar, registerExplorerWideHeaderEnd])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={hostRef}
        className={cn(
          "bg-app-desktop relative isolate min-h-0 flex-1 overflow-hidden rounded-t-md rounded-b-md",
          "bg-[radial-gradient(circle,rgb(0_0_0/0.05)_1px,transparent_1px)]",
          "dark:bg-[radial-gradient(circle,rgb(255_255_255/0.06)_1px,transparent_1px)]"
        )}
        aria-label="Escritorio con ventanas"
        onDragEnter={(e) => {
          if (!isBookmarkDragTransfer(e.dataTransfer)) return
          setDeskCanvasDropHighlight(true)
        }}
        onDragOver={(e) => {
          if (!isBookmarkDragTransfer(e.dataTransfer)) return
          e.preventDefault()
          setDeskCanvasDropHighlight(true)
        }}
        onDragLeave={(e) => {
          const rt = e.relatedTarget as Node | null
          if (rt && hostRef.current?.contains(rt)) return
          setDeskCanvasDropHighlight(false)
        }}
        onDrop={(e) => {
          setDeskCanvasDropHighlight(false)
          e.preventDefault()
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="pointer-events-auto absolute top-3 left-3 flex flex-col gap-3">
            <DesktopShortcut label="Marcadores" icon={<span aria-hidden>📚</span>} onDoubleClick={onAddLibraryWindow} />
          </div>
        </div>

        {floatingOverlays ? (
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-[80] flex flex-col items-center gap-2 p-2">
            <div className="pointer-events-auto flex w-full max-w-lg flex-col items-center gap-2">
              {floatingOverlays}
            </div>
          </div>
        ) : null}

        {deskCanvasDropHighlight ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-4 z-[14] rounded-xl",
              "border-2 border-dashed border-sky-500/55 bg-sky-400/[0.06]",
              "shadow-[inset_0_0_14px_rgb(56_189_248_/_0.09)]",
              "dark:border-amber-300/45 dark:bg-amber-400/[0.07]",
              "dark:shadow-[inset_0_0_14px_rgb(251_191_36_/_0.07)]"
            )}
            aria-hidden
          />
        ) : null}

        {canvas.w > 0 && canvas.h > 0 ? (
          <>
            {}
            {libraryWindowIds.map((winId, idx) => {
              const frame = libFrames[winId]
              if (!frame) return null
              const subtitle = libraryWindowIds.length > 1 ? `#${idx + 1}` : undefined
              return (
                <DesktopWindowFrame
                  key={winId}
                  title="Marcadores"
                  subtitle={subtitle}
                  canvasSize={canvas}
                  bounds={frame.bounds}
                  onBoundsChange={(b) => setLibBounds(winId, b)}
                  minimized={frame.minimized}
                  maximized={frame.maximized}
                  onToggleMinimize={() =>
                    setLibFrames((p) => ({
                      ...p,
                      [winId]: { ...p[winId], minimized: !p[winId].minimized },
                    }))
                  }
                  onToggleMaximize={() =>
                    setLibFrames((p) => ({
                      ...p,
                      [winId]: { ...p[winId], maximized: !p[winId].maximized },
                    }))
                  }
                  preMaxBoundsRef={libraryPreMaxMap.get(winId)!}
                  zIndex={zLib[winId] ?? 10 + idx}
                  onActivate={() => {
                    zSeq.current += 1
                    setZLib((z) => ({ ...z, [winId]: zSeq.current }))
                    setFocusedSurface({ kind: "library", id: winId })
                    onFocusLibraryPane(winId)
                  }}
                  showClose={canCloseLibrary}
                  onClose={
                    canCloseLibrary
                      ? () => {
                          onRequestCloseLibraryWindow(winId)
                        }
                      : undefined
                  }
                  isolateBookmarkDragBubble
                  onDismissDesktopDropHighlight={() => setDeskCanvasDropHighlight(false)}
                >
                  <div
                    className="bg-app-sidebar flex min-h-0 flex-1 flex-col overflow-hidden"
                    onPointerDownCapture={() => {
                      zSeq.current += 1
                      setZLib((z) => ({ ...z, [winId]: zSeq.current }))
                      setFocusedSurface({ kind: "library", id: winId })
                      onFocusLibraryPane(winId)
                    }}
                  >
                    {renderLibraryPane(winId, focusedLibraryPaneId === winId)}
                  </div>
                </DesktopWindowFrame>
              )
            })}
            {}

            {detailOpen && detailContent && detailFrame ? (
              <DesktopWindowFrame
                title="Propiedades"
                subtitle={detailTitle}
                canvasSize={canvas}
                bounds={detailFrame.bounds}
                onBoundsChange={setDetailBounds}
                minimized={detailFrame.minimized}
                maximized={detailFrame.maximized}
                onToggleMinimize={() => setDetailFrame((p) => (p ? { ...p, minimized: !p.minimized } : p))}
                onToggleMaximize={() => setDetailFrame((p) => (p ? { ...p, maximized: !p.maximized } : p))}
                preMaxBoundsRef={preMaxDetail}
                zIndex={zDetail}
                onActivate={() => {
                  zSeq.current += 1
                  setZDetail(zSeq.current)
                  setFocusedSurface({ kind: "detail" })
                }}
                showClose
                onClose={onCloseDetail}
                isolateBookmarkDragBubble
                onDismissDesktopDropHighlight={() => setDeskCanvasDropHighlight(false)}
              >
                <div className="bg-app-sidebar flex min-h-0 flex-1 flex-col overflow-hidden">{detailContent}</div>
              </DesktopWindowFrame>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
