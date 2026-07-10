"use client"

import { clampBounds } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

import { MIN_CANVAS } from "./desktopShellConstants"
import type { LibFrame } from "./desktopShellGeometry"

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

export function useDeskBulkWindowTransforms(opts: {
  canvas: { w: number; h: number }
  libraryWindowIds: string[]
  libraryPreMaxMap: Map<string, PreMaxBox>
  preMaxDetail: PreMaxBox
  setLibFrames: React.Dispatch<React.SetStateAction<Record<string, LibFrame>>>
  setDetailFrame: React.Dispatch<React.SetStateAction<LibFrame | null>>
}) {
  const { canvas, libraryWindowIds, libraryPreMaxMap, preMaxDetail, setLibFrames, setDetailFrame } = opts

  const minimizeAllWindows = () => {
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (cur) next[wid] = { ...cur, minimized: true }
      }
      return next
    })
    setDetailFrame((prev) => (prev ? { ...prev, minimized: true } : prev))
  }

  const restoreMinimizedWindows = () => {
    setLibFrames((prev) => {
      const next = { ...prev }
      for (const wid of libraryWindowIds) {
        const cur = next[wid]
        if (cur) next[wid] = { ...cur, minimized: false }
      }
      return next
    })
    setDetailFrame((prev) => (prev ? { ...prev, minimized: false } : prev))
  }

  const maximizeAllWindows = () => {
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
  }

  const restoreWindowSizes = () => {
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
      if (prev.maximized && preMaxDetail.current) {
        bounds = clampBounds(preMaxDetail.current, cw, ch)
      }
      preMaxDetail.current = null
      return { ...prev, maximized: false, bounds }
    })
  }

  return {
    minimizeAllWindows,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  }
}
