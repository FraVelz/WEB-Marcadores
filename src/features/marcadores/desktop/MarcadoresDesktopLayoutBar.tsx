"use client"

import { useCallback, useEffect, useState } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import { cn } from "@/lib/utils"

function getFullscreenElement(): Element | null {
  const d = document as Document & {
    webkitFullscreenElement?: Element | null
    mozFullScreenElement?: Element | null
  }
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? d.mozFullScreenElement ?? null
}

async function requestElFullscreen(el: HTMLElement) {
  const anyEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>
    mozRequestFullScreen?: () => Promise<void>
  }
  if (el.requestFullscreen) await el.requestFullscreen()
  else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen()
  else if (anyEl.mozRequestFullScreen) await anyEl.mozRequestFullScreen()
}

async function exitDocumentFullscreen() {
  const d = document as Document & {
    webkitExitFullscreen?: () => Promise<void>
    mozCancelFullScreen?: () => Promise<void>
  }
  if (document.exitFullscreen) await document.exitFullscreen()
  else if (d.webkitExitFullscreen) await d.webkitExitFullscreen()
  else if (d.mozCancelFullScreen) await d.mozCancelFullScreen()
}

type Props = {
  /**
   * Host de pantalla completa; por defecto `dashboardFullscreenHostRef` del dashboard.
   * Solo anula si necesitas otro elemento.
   */
  fullscreenTargetRef?: React.RefObject<HTMLElement | null>
  canTileTwoColumns: boolean
  onTileTwoColumns: () => void
  deskSurfaceReady: boolean
  onMinimizeAll: () => void
  onRestoreMinimized: () => void
  onMaximizeAll: () => void
  onRestoreWindowSizes: () => void
  /** true: mismo estilo compacto dentro de la cabecera «Explorador». */
  inlineInExplorerHeader?: boolean
}

/** Acciones globales del escritorio (pantalla completa, ventanas en bloque, reparto en dos columnas). */
export function MarcadoresDesktopLayoutBar({
  fullscreenTargetRef: fullscreenTargetRefProp,
  canTileTwoColumns,
  onTileTwoColumns,
  deskSurfaceReady,
  onMinimizeAll,
  onRestoreMinimized,
  onMaximizeAll,
  onRestoreWindowSizes,
  inlineInExplorerHeader = true,
}: Props) {
  const { dashboardFullscreenHostRef } = useDashboard()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const targetRef = fullscreenTargetRefProp ?? dashboardFullscreenHostRef
    const sync = () => {
      const host = targetRef.current
      setFullscreen(host !== null && getFullscreenElement() === host)
    }
    document.addEventListener("fullscreenchange", sync)
    document.addEventListener("webkitfullscreenchange", sync)
    sync()
    return () => {
      document.removeEventListener("fullscreenchange", sync)
      document.removeEventListener("webkitfullscreenchange", sync)
    }
  }, [fullscreenTargetRefProp, dashboardFullscreenHostRef])

  const toggleFullscreen = useCallback(async () => {
    const el = (fullscreenTargetRefProp ?? dashboardFullscreenHostRef).current
    if (!el) return
    try {
      if (getFullscreenElement() === el) await exitDocumentFullscreen()
      else await requestElFullscreen(el)
    } catch {
      /* navegador puede rechazar sin usuario */
    }
  }, [fullscreenTargetRefProp, dashboardFullscreenHostRef])

  return (
    <div
      className={cn(
        "flex shrink-0 flex-nowrap items-center gap-1.5",
        inlineInExplorerHeader
          ? "min-w-0 justify-end [&::-webkit-scrollbar]:h-1"
          : "border-app-border bg-app-toolbar flex-wrap gap-2 rounded-t-md border-b px-2 py-1"
      )}
      role="toolbar"
      aria-label="Disposición del escritorio"
    >
      <span className="text-app-fg-label hidden shrink-0 text-[11px] font-medium tracking-wide uppercase md:inline">
        Escritorio
      </span>
      <button
        type="button"
        className="text-app-fg-muted hover:bg-app-active hover:text-app-fg focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2"
        title={fullscreen ? "Salir de pantalla completa (Esc)" : "Pantalla completa (Explorador + escritorio)"}
        aria-pressed={fullscreen}
        onClick={() => void toggleFullscreen()}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          {fullscreen ? (
            <path d="M9 9V5H5v4h4zm10 10v-4h-4v4h4zm0-16h-4v4h4V3zm-10 16v-4H5v4h4z" />
          ) : (
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          )}
        </svg>
        <span className="hidden sm:inline">{fullscreen ? "Salir pantalla completa" : "Pantalla completa"}</span>
      </button>

      <div className="bg-app-active mx-0.5 hidden h-5 w-px sm:block" aria-hidden />

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={cn(
          "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2",
          deskSurfaceReady
            ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
            : "text-app-fg-muted cursor-not-allowed opacity-45"
        )}
        title="Minimizar todas las ventanas del escritorio"
        onClick={() => {
          if (!deskSurfaceReady) return
          onMinimizeAll()
        }}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5h8v3H8V5zM5 10h14v9H5v-9zm2 2v5h10v-5H7zM4 17h16v2H4v-2z" />
        </svg>
        <span className="hidden md:inline">Minimizar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={cn(
          "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2",
          deskSurfaceReady
            ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
            : "text-app-fg-muted cursor-not-allowed opacity-45"
        )}
        title="Desplegar ventanas minimizadas"
        onClick={() => {
          if (!deskSurfaceReady) return
          onRestoreMinimized()
        }}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 14h16v6H4v-6zm2 2v2h12v-2H6zM7 4h10v6H7V4zm2 2v2h6V6H9z" />
        </svg>
        <span className="hidden md:inline">Mostrar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={cn(
          "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2",
          deskSurfaceReady
            ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
            : "text-app-fg-muted cursor-not-allowed opacity-45"
        )}
        title="Maximizar todas las ventanas al lienzo"
        onClick={() => {
          if (!deskSurfaceReady) return
          onMaximizeAll()
        }}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z" />
        </svg>
        <span className="hidden md:inline">Maximizar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={cn(
          "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2",
          deskSurfaceReady
            ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
            : "text-app-fg-muted cursor-not-allowed opacity-45"
        )}
        title="Restaurar tamaño de ventanas (salir de maximizado)"
        onClick={() => {
          if (!deskSurfaceReady) return
          onRestoreWindowSizes()
        }}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M15 14h6v6h-2v-2.59l-5.61 5.61-1.41-1.41L17.59 16H15v-2zm-11-2 5.61-5.61 1.41 1.41L6.41 13H9v2H3V9h2v2.59zM9 21H3v-6h2v3.59l14.71-14.7 1.41 1.41L6.41 19H10v2z" />
        </svg>
        <span className="hidden lg:inline">Tamaño normal</span>
      </button>

      <div className="bg-app-active mx-0.5 hidden h-5 w-px sm:block" aria-hidden />

      <button
        type="button"
        disabled={!canTileTwoColumns}
        className={cn(
          "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2",
          canTileTwoColumns
            ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
            : "text-app-fg-muted cursor-not-allowed opacity-45"
        )}
        title={
          canTileTwoColumns
            ? "Colocar las dos ventanas de Marcadores mitad y mitad"
            : "Activa solo con dos ventanas de biblioteca abiertas"
        }
        onClick={() => {
          if (!canTileTwoColumns) return
          onTileTwoColumns()
        }}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 5h8v14H4V5zm10 0h6v14h-6V5zm2 2v10h2V7h-2zM6 7v10h4V7H6z" />
        </svg>
        <span className="hidden sm:inline">Dos columnas</span>
      </button>
    </div>
  )
}
