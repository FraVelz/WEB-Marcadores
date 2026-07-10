"use client"

import { clampBounds, DESKTOP_MARGIN } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { DesktopSurfaceTask, DesktopWmExtras, WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import { DESKTOP_DETAIL_WINDOW_ID } from "@/features/marcadores/desktop/windowTypes"

import { useDeskBulkWindowTransforms } from "./useDeskBulkWindowTransforms"
import { useDeskSurfaceStripFocus } from "./useDeskSurfaceStripFocus"
import { MIN_CANVAS, TILE_COLUMN_GAP } from "./desktopShellConstants"
import type { LibFrame } from "./desktopShellGeometry"

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

export function useDeskShellWorkflows(opts: {
  libraryWindowIds: string[]
  libFrames: Record<string, LibFrame>
  setLibFrames: React.Dispatch<React.SetStateAction<Record<string, LibFrame>>>
  setDetailFrame: React.Dispatch<React.SetStateAction<LibFrame | null>>
  detailFrame: LibFrame | null
  detailOpen: boolean
  detailTitle?: string
  canvas: { w: number; h: number }
  libraryPreMaxMap: Map<string, PreMaxBox>
  preMaxDetail: PreMaxBox
  zSeqRef: React.MutableRefObject<number>
  setZLib: React.Dispatch<React.SetStateAction<Record<string, number>>>
  setZDetail: React.Dispatch<React.SetStateAction<number>>
  onFocusLibraryPane: (id: string) => void
  focusedLibraryPaneId: string | null
}) {
  const {
    libraryWindowIds,
    libFrames,
    setLibFrames,
    setDetailFrame,
    detailFrame,
    detailOpen,
    detailTitle,
    canvas,
    libraryPreMaxMap,
    preMaxDetail,
    zSeqRef,
    setZLib,
    setZDetail,
    onFocusLibraryPane,
    focusedLibraryPaneId,
  } = opts

  const { focusedSurface, setPreferLibraryInStrip } = useDeskSurfaceStripFocus({
    detailOpen,
    detailFrame,
    focusedLibraryPaneId,
    libraryWindowIds,
  })

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

  const tileTwoColumns = () => {
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
    const xRight = g + wLeft + TILE_COLUMN_GAP
    const rightBounds = clampBounds({ x: xRight, y: g, w: wRight, h }, cw, ch)

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
  }

  const focusTask = (id: string) => {
    if (id === DESKTOP_DETAIL_WINDOW_ID) {
      zSeqRef.current += 1
      setZDetail(zSeqRef.current)
      setPreferLibraryInStrip(false)
      setDetailFrame((prev) => (prev?.minimized ? { ...prev, minimized: false } : prev))
      return
    }
    zSeqRef.current += 1
    setZLib((z) => ({ ...z, [id]: zSeqRef.current }))
    setPreferLibraryInStrip(true)
    setLibFrames((prev) => {
      const cur = prev[id]
      if (!cur?.minimized) return prev
      return { ...prev, [id]: { ...cur, minimized: false } }
    })
    onFocusLibraryPane(id)
  }

  const { minimizeAllWindows, restoreMinimizedWindows, maximizeAllWindows, restoreWindowSizes } =
    useDeskBulkWindowTransforms({
      canvas,
      libraryWindowIds,
      libraryPreMaxMap,
      preMaxDetail,
      setLibFrames,
      setDetailFrame,
    })

  const desktopWm = ((): DesktopWmExtras => {
    const tasks: DesktopSurfaceTask[] = libraryWindowIds.map((wid, idx) => {
      const f = libFrames[wid]
      return {
        id: wid,
        title: "Marcadores",
        subtitle: libraryWindowIds.length > 1 ? `#${idx + 1}` : undefined,
        minimized: f?.minimized ?? false,
        maximized: f?.maximized ?? false,
        isFocused: focusedSurface.kind === "library" && focusedSurface.id === wid && !(f?.minimized ?? false),
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
        isFocused: focusedSurface.kind === "detail" && !detailFrame.minimized,
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
  })()

  const focusLibraryFromWin = (winId: string) => {
    onFocusLibraryPane(winId)
  }

  return {
    desktopWm,
    focusTask,
    focusLibraryFromWin,
    setPreferLibraryInStrip,
    tileTwoColumns,
    setLibBounds,
    setDetailBounds,
    minimizeAllWindows,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  }
}
