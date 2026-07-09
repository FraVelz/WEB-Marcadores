"use client"

import type { RefObject } from "react"

import { useDashboardFullscreenToggle } from "@/features/marcadores/hooks/useDashboardFullscreenToggle"
import { DESKTOP_LAYOUT_TOOL_BTN_ROW, FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

type Props = {
  fullscreenTargetRef?: RefObject<HTMLElement | null>
  /** `toolbar`: icono como el resto de la barra simple; `labeled`: texto + icono (escritorio). */
  variant?: "toolbar" | "labeled"
  className?: string
}

export function MarcadoresFullscreenToggleButton({ fullscreenTargetRef, variant = "toolbar", className }: Props) {
  const { fullscreen, toggleFullscreen } = useDashboardFullscreenToggle(fullscreenTargetRef)

  const title = fullscreen
    ? "Salir de pantalla completa (Esc)"
    : variant === "labeled"
      ? "Pantalla completa (Explorador + contenido)"
      : "Pantalla completa"

  return (
    <button
      type="button"
      className={cn(
        variant === "labeled"
          ? cn(DESKTOP_LAYOUT_TOOL_BTN_ROW, "text-app-fg-muted hover:bg-app-active hover:text-app-fg")
          : cn("text-app-fg-muted hover:bg-app-active hover:text-app-fg rounded p-1.5", FOCUS_RING_ICON_BTN),
        className
      )}
      title={title}
      aria-pressed={fullscreen}
      aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      onClick={() => void toggleFullscreen()}
    >
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {fullscreen ? (
          <path d="M9 9V5H5v4h4zm10 10v-4h-4v4h4zm0-16h-4v4h4V3zm-10 16v-4H5v4h4z" />
        ) : (
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        )}
      </svg>
      {variant === "labeled" ? (
        <span className="hidden sm:inline">{fullscreen ? "Salir pantalla completa" : "Pantalla completa"}</span>
      ) : null}
    </button>
  )
}
