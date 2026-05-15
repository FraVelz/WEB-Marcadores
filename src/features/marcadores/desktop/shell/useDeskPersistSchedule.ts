"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"

import type { MarcadoresDesktopLayoutV2 } from "@/features/marcadores/desktop/windowTypes"

import type { LibFrame } from "./desktopShellGeometry"
import { buildPersistedLayoutPayload, persistDeskLayoutJson } from "./desktopShellPersistence"
import { desktopWmStorageKeyBase } from "./desktopShellConstants"

export function useDeskPersistSchedule(opts: {
  workspaceId: string | null
  libraryWindowIds: string[]
  libFrames: Record<string, LibFrame>
  detailFrame: LibFrame | null
}) {
  const { workspaceId, libraryWindowIds, libFrames, detailFrame } = opts
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const key = useMemo(() => desktopWmStorageKeyBase(workspaceId), [workspaceId])

  const schedulePersist = useCallback(() => {
    if (typeof window === "undefined") return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      persistTimer.current = null
      const payload: MarcadoresDesktopLayoutV2 = buildPersistedLayoutPayload(libraryWindowIds, libFrames, detailFrame)
      persistDeskLayoutJson(key, payload)
    }, 300)
  }, [detailFrame, key, libFrames, libraryWindowIds])

  useEffect(() => {
    schedulePersist()
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [schedulePersist])

  return { schedulePersist }
}
