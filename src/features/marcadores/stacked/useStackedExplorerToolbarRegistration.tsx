"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"

import { MarcadoresFullscreenToggleButton } from "@/features/marcadores/components/MarcadoresFullscreenToggleButton"

/** Pantalla completa en la cabecera «Explorador» (misma barra que el modo escritorio). */
export function useStackedExplorerToolbarRegistration(opts: {
  active: boolean
  registerExplorerWideHeaderEnd: (node: ReactNode | null) => void
}) {
  const { active, registerExplorerWideHeaderEnd } = opts

  const explorerHeaderToolbar = useMemo(() => {
    if (!active) return null
    return (
      <div className="flex min-w-0 items-center justify-end">
        <MarcadoresFullscreenToggleButton variant="labeled" />
      </div>
    )
  }, [active])

  useEffect(() => {
    registerExplorerWideHeaderEnd(explorerHeaderToolbar)
    return () => registerExplorerWideHeaderEnd(null)
  }, [explorerHeaderToolbar, registerExplorerWideHeaderEnd])
}
