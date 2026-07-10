"use client"

import { MarcadoresFullscreenToggleButton } from "@/features/marcadores/components/MarcadoresFullscreenToggleButton"
import {
  DESKTOP_LAYOUT_TOOL_BTN_ROW,
  desktopLayoutToolBtnState,
} from "@/features/marcadores/desktop/marcadoresDesktopLayoutBar.styles"

import { cn } from "@/lib/utils"

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
  fullscreenTargetRef,
  canTileTwoColumns,
  onTileTwoColumns,
  deskSurfaceReady,
  onMinimizeAll,
  onRestoreMinimized,
  onMaximizeAll,
  onRestoreWindowSizes,
  inlineInExplorerHeader = true,
}: Props) {
  const deskReadyBtn = cn(DESKTOP_LAYOUT_TOOL_BTN_ROW, desktopLayoutToolBtnState(deskSurfaceReady))

  const tileBtn = cn(DESKTOP_LAYOUT_TOOL_BTN_ROW, desktopLayoutToolBtnState(canTileTwoColumns))

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
      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={deskReadyBtn}
        title="Minimizar todas las ventanas del escritorio"
        aria-label="Minimizar todas las ventanas del escritorio"
        onClick={() => deskSurfaceReady && onMinimizeAll()}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5h8v3H8V5zM5 10h14v9H5v-9zm2 2v5h10v-5H7zM4 17h16v2H4v-2z" />
        </svg>
        <span className="hidden md:inline">Minimizar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={deskReadyBtn}
        title="Desplegar ventanas minimizadas"
        aria-label="Desplegar ventanas minimizadas"
        onClick={() => deskSurfaceReady && onRestoreMinimized()}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 14h16v6H4v-6zm2 2v2h12v-2H6zM7 4h10v6H7V4zm2 2v2h6V6H9z" />
        </svg>
        <span className="hidden md:inline">Mostrar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={deskReadyBtn}
        title="Maximizar todas las ventanas al lienzo"
        aria-label="Maximizar todas las ventanas al lienzo"
        onClick={() => deskSurfaceReady && onMaximizeAll()}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z" />
        </svg>
        <span className="hidden md:inline">Maximizar todo</span>
      </button>

      <button
        type="button"
        disabled={!deskSurfaceReady}
        className={deskReadyBtn}
        title="Restaurar tamaño de ventanas (salir de maximizado)"
        aria-label="Restaurar tamaño de ventanas (salir de maximizado)"
        onClick={() => deskSurfaceReady && onRestoreWindowSizes()}
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
        className={tileBtn}
        title={
          canTileTwoColumns
            ? "Colocar las dos ventanas de Marcadores mitad y mitad"
            : "Activa solo con dos ventanas de biblioteca abiertas"
        }
        aria-label={
          canTileTwoColumns
            ? "Colocar las dos ventanas de Marcadores mitad y mitad"
            : "Activa solo con dos ventanas de biblioteca abiertas"
        }
        onClick={() => canTileTwoColumns && onTileTwoColumns()}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 5h8v14H4V5zm10 0h6v14h-6V5zm2 2v10h2V7h-2zM6 7v10h4V7H6z" />
        </svg>
        <span className="hidden sm:inline">Dos columnas</span>
      </button>

      <div className="bg-app-active mx-0.5 hidden h-5 w-px sm:block" aria-hidden />

      <span className="text-app-fg-label hidden shrink-0 text-[11px] font-medium tracking-wide uppercase md:inline">
        Escritorio
      </span>

      <MarcadoresFullscreenToggleButton fullscreenTargetRef={fullscreenTargetRef} variant="labeled" />
    </div>
  )
}
