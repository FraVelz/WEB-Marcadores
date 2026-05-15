"use client"

import { useEffect } from "react"

import { clampBounds } from "@/features/marcadores/desktop/desktopWindowGeometry"
import type { DeskShellState } from "@/features/marcadores/desktop/marcadoresDeskShellReducer"

import { MIN_CANVAS, desktopWmStorageKeyBase } from "./desktopShellConstants"
import { defaultDetailBounds, mergeLibraryFrameRecord } from "./desktopShellGeometry"
import { ensureLibFramesForIds, readParsedDeskLayout } from "./desktopShellHydrateParse"

export function useDeskShellHydration(opts: {
  hostRef: React.RefObject<HTMLDivElement | null>
  workspaceId: string | null
  setLibraryWindowIds: React.Dispatch<React.SetStateAction<string[]>>
  libIdsRef: React.MutableRefObject<string[]>
  applyDesk: (updater: (s: DeskShellState) => DeskShellState) => void
  hydratedRef: React.MutableRefObject<boolean>
  deskReady: boolean
  libraryWindowIds: string[]
  detailOpen: boolean
  canvas: { w: number; h: number }
  zSeqRef: React.MutableRefObject<number>
}) {
  const {
    hostRef,
    workspaceId,
    setLibraryWindowIds,
    libIdsRef,
    applyDesk,
    hydratedRef,
    deskReady,
    libraryWindowIds,
    detailOpen,
    canvas,
    zSeqRef,
  } = opts

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const lsKey = desktopWmStorageKeyBase(workspaceId)
    hydratedRef.current = false

    const apply = () => {
      const r = el.getBoundingClientRect()
      const w = Math.floor(r.width)
      const h = Math.floor(r.height)
      if (w < MIN_CANVAS || h < MIN_CANVAS) {
        applyDesk((s) => ({ ...s, canvas: { w, h } }))
        return
      }

      if (!hydratedRef.current) {
        hydratedRef.current = true
        const { nextLibFrames, nextDetail, loadedLibIds } = readParsedDeskLayout(lsKey, w, h)
        if (loadedLibIds?.length) setLibraryWindowIds(loadedLibIds)
        applyDesk((s) => ({
          ...s,
          canvas: { w, h },
          libFrames: ensureLibFramesForIds(
            { ...s.libFrames, ...nextLibFrames },
            loadedLibIds ?? libIdsRef.current,
            w,
            h
          ),
          detailFrame: nextDetail ?? s.detailFrame,
          deskReady: true,
        }))
        return
      }

      applyDesk((s) => ({
        ...s,
        canvas: { w, h },
        libFrames: mergeLibraryFrameRecord(s.libFrames, libIdsRef.current, w, h),
        detailFrame: s.detailFrame
          ? { ...s.detailFrame, bounds: clampBounds(s.detailFrame.bounds, w, h) }
          : s.detailFrame,
      }))
    }

    const ro = new ResizeObserver(apply)
    ro.observe(el)
    apply()

    return () => ro.disconnect()
  }, [hostRef, hydratedRef, libIdsRef, applyDesk, setLibraryWindowIds, workspaceId])

  useEffect(() => {
    if (!deskReady) return
    const el = hostRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const w = Math.floor(r.width)
    const h = Math.floor(r.height)
    if (w < MIN_CANVAS || h < MIN_CANVAS) return
    applyDesk((s) => ({
      ...s,
      libFrames: mergeLibraryFrameRecord(s.libFrames, libraryWindowIds, w, h),
    }))
  }, [libraryWindowIds, deskReady, hostRef, applyDesk])

  useEffect(() => {
    if (!detailOpen || canvas.w < MIN_CANVAS || canvas.h < MIN_CANVAS) return
    const id = requestAnimationFrame(() => {
      applyDesk((s) => {
        if (s.detailFrame) return s
        return {
          ...s,
          detailFrame: {
            bounds: defaultDetailBounds(canvas.w, canvas.h),
            minimized: false,
            maximized: false,
          },
        }
      })
    })
    return () => cancelAnimationFrame(id)
  }, [detailOpen, canvas.w, canvas.h, applyDesk])

  useEffect(() => {
    if (!detailOpen) return
    const id = requestAnimationFrame(() => {
      zSeqRef.current += 1
      applyDesk((s) => ({ ...s, zDetail: zSeqRef.current }))
    })
    return () => cancelAnimationFrame(id)
  }, [detailOpen, zSeqRef, applyDesk])
}
