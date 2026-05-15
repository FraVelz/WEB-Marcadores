"use client"

import { useCallback, useEffect, useState } from "react"

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
  /** Host de pantalla completa: debe envolver también la barra superior del escritorio. */
  fullscreenTargetRef: React.RefObject<HTMLElement | null>
  canTileTwoColumns: boolean
  onTileTwoColumns: () => void
}

/** Acciones globales del escritorio (pantalla completa del lienzo, reparto en dos columnas). */
export function MarcadoresDesktopLayoutBar({ fullscreenTargetRef, canTileTwoColumns, onTileTwoColumns }: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const host = fullscreenTargetRef.current
      setFullscreen(host !== null && getFullscreenElement() === host)
    }
    document.addEventListener("fullscreenchange", sync)
    document.addEventListener("webkitfullscreenchange", sync)
    sync()
    return () => {
      document.removeEventListener("fullscreenchange", sync)
      document.removeEventListener("webkitfullscreenchange", sync)
    }
  }, [fullscreenTargetRef])

  const toggleFullscreen = useCallback(async () => {
    const el = fullscreenTargetRef.current
    if (!el) return
    try {
      if (getFullscreenElement() === el) await exitDocumentFullscreen()
      else await requestElFullscreen(el)
    } catch {
      /* navegador puede rechazar sin usuario */
    }
  }, [fullscreenTargetRef])

  return (
    <div
      className={cn(
        "border-app-border bg-app-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b px-2 py-1",
        "rounded-t-md"
      )}
      role="toolbar"
      aria-label="Disposición del escritorio"
    >
      <span className="text-app-fg-label mr-1 hidden text-[11px] font-medium tracking-wide uppercase sm:inline">
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
