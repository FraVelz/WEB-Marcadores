"use client"

import { useEffect, useRef } from "react"

import type { MarcadoresDesktopLayoutV2 } from "@/features/marcadores/desktop/windowTypes"

import type { LibFrame } from "./desktopShellGeometry"
import { buildPersistedLayoutPayload, persistDeskLayoutJson } from "./desktopShellPersistence"
import { DESKTOP_WM_STORAGE_KEY } from "./desktopShellConstants"

export function useDeskPersistSchedule(opts: {
  libraryWindowIds: string[]
  libFrames: Record<string, LibFrame>
  detailFrame: LibFrame | null
}) {
  const { libraryWindowIds, libFrames, detailFrame } = opts
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedulePersist = () => {
    if (typeof window === "undefined") return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      persistTimer.current = null
      const payload: MarcadoresDesktopLayoutV2 = buildPersistedLayoutPayload(libraryWindowIds, libFrames, detailFrame)
      persistDeskLayoutJson(DESKTOP_WM_STORAGE_KEY, payload)
    }, 300)
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    const timer = setTimeout(() => {
      persistTimer.current = null
      const payload: MarcadoresDesktopLayoutV2 = buildPersistedLayoutPayload(libraryWindowIds, libFrames, detailFrame)
      persistDeskLayoutJson(DESKTOP_WM_STORAGE_KEY, payload)
    }, 300)
    persistTimer.current = timer
    return () => {
      clearTimeout(timer)
      if (persistTimer.current === timer) persistTimer.current = null
    }
  }, [detailFrame, libFrames, libraryWindowIds])

  return { schedulePersist }
}
