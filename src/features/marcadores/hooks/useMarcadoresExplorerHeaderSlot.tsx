"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

import { MarcadoresDesktopLayoutBar } from "@/features/marcadores/desktop/MarcadoresDesktopLayoutBar"
import { MarcadoresDesktopTaskStrip } from "@/features/marcadores/desktop/MarcadoresDesktopTaskStrip"
import type { DesktopWmExtras } from "@/features/marcadores/desktop/windowTypes"
import { MarcadoresFullscreenToggleButton } from "@/features/marcadores/components/MarcadoresFullscreenToggleButton"

type SimpleConfig = {
  variant: "simple"
  active: boolean
  registerExplorerWideHeaderEnd: (node: ReactNode | null) => void
}

type DeskConfig = {
  variant: "desk"
  registerExplorerWideHeaderEnd: (node: ReactNode | null) => void
  desktopWm: DesktopWmExtras
  canTileTwoColumns: boolean
  tileTwoColumns: () => void
  deskSurfaceReady: boolean
  minimizeAllWindows: () => void
  restoreMinimizedWindows: () => void
  maximizeAllWindows: () => void
  restoreWindowSizes: () => void
}

/** Registra herramientas en la cabecera global del explorador (simple o escritorio). */
export function useMarcadoresExplorerHeaderSlot(config: SimpleConfig | DeskConfig) {
  const register = config.registerExplorerWideHeaderEnd

  const toolbar = (() => {
    if (config.variant === "simple") {
      if (!config.active) return null
      return (
        <div className="flex min-w-0 items-center justify-end">
          <MarcadoresFullscreenToggleButton variant="labeled" />
        </div>
      )
    }

    return (
      <div className="flex min-w-0 items-center gap-2">
        <MarcadoresDesktopTaskStrip surfaces={config.desktopWm.tasks} onFocusTask={config.desktopWm.focusTask} />
        <MarcadoresDesktopLayoutBar
          canTileTwoColumns={config.canTileTwoColumns}
          onTileTwoColumns={config.tileTwoColumns}
          deskSurfaceReady={config.deskSurfaceReady}
          onMinimizeAll={config.minimizeAllWindows}
          onRestoreMinimized={config.restoreMinimizedWindows}
          onMaximizeAll={config.maximizeAllWindows}
          onRestoreWindowSizes={config.restoreWindowSizes}
          inlineInExplorerHeader
        />
      </div>
    )
  })()

  useEffect(() => {
    register(toolbar)
    return () => register(null)
  }, [register, toolbar])
}
