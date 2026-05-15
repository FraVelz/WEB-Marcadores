"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"

import { MarcadoresDesktopLayoutBar } from "@/features/marcadores/desktop/MarcadoresDesktopLayoutBar"
import { MarcadoresDesktopTaskStrip } from "@/features/marcadores/desktop/MarcadoresDesktopTaskStrip"
import type { DesktopWmExtras } from "@/features/marcadores/desktop/windowTypes"

export function useDeskExplorerToolbarRegistration(opts: {
  registerExplorerWideHeaderEnd: (node: ReactNode | null) => void
  desktopWm: DesktopWmExtras
  canTileTwoColumns: boolean
  tileTwoColumns: () => void
  deskSurfaceReady: boolean
  minimizeAllWindows: () => void
  restoreMinimizedWindows: () => void
  maximizeAllWindows: () => void
  restoreWindowSizes: () => void
}) {
  const {
    registerExplorerWideHeaderEnd,
    desktopWm,
    canTileTwoColumns,
    tileTwoColumns,
    deskSurfaceReady,
    minimizeAllWindows,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  } = opts

  const explorerHeaderDeskToolbar = useMemo(() => {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <MarcadoresDesktopTaskStrip surfaces={desktopWm.tasks} onFocusTask={desktopWm.focusTask} />
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
    canTileTwoColumns,
    desktopWm,
    deskSurfaceReady,
    maximizeAllWindows,
    minimizeAllWindows,
    restoreMinimizedWindows,
    restoreWindowSizes,
    tileTwoColumns,
  ])

  useEffect(() => {
    registerExplorerWideHeaderEnd(explorerHeaderDeskToolbar)
    return () => {
      registerExplorerWideHeaderEnd(null)
    }
  }, [explorerHeaderDeskToolbar, registerExplorerWideHeaderEnd])
}
