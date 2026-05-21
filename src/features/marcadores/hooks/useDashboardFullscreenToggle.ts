"use client"

import { useCallback, useEffect, useState, type RefObject } from "react"

import { useDashboard } from "@/contexts/DashboardContext"
import {
  isElementFullscreen,
  subscribeFullscreenChange,
  toggleElementFullscreen,
} from "@/features/marcadores/desktop/desktopFullscreenDom"

/** Estado y toggle de pantalla completa sobre el host del dashboard (vista simple o escritorio). */
export function useDashboardFullscreenToggle(fullscreenTargetRef?: RefObject<HTMLElement | null>) {
  const { dashboardFullscreenHostRef } = useDashboard()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const targetRef = fullscreenTargetRef ?? dashboardFullscreenHostRef
    const sync = () => setFullscreen(isElementFullscreen(targetRef.current))
    const unsub = subscribeFullscreenChange(sync)
    sync()
    return unsub
  }, [fullscreenTargetRef, dashboardFullscreenHostRef])

  const toggleFullscreen = useCallback(async () => {
    const targetRef = fullscreenTargetRef ?? dashboardFullscreenHostRef
    await toggleElementFullscreen(targetRef.current)
    setFullscreen(isElementFullscreen(targetRef.current))
  }, [fullscreenTargetRef, dashboardFullscreenHostRef])

  return { fullscreen, toggleFullscreen }
}
