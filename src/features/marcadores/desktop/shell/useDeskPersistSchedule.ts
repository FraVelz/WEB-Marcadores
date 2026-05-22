"use client"

import { useCallback, useEffect, useRef } from "react"

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

  const schedulePersist = useCallback(() => {
    if (typeof window === "undefined") return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      persistTimer.current = null
      const payload: MarcadoresDesktopLayoutV2 = buildPersistedLayoutPayload(libraryWindowIds, libFrames, detailFrame)
      persistDeskLayoutJson(DESKTOP_WM_STORAGE_KEY, payload)
    }, 300)
  }, [detailFrame, libFrames, libraryWindowIds])

  useEffect(() => {
    schedulePersist()
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [schedulePersist])

  return { schedulePersist }
}
