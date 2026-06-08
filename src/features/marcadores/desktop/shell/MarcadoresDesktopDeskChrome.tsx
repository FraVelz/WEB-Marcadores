"use client"

import type { ReactNode } from "react"
import { useState } from "react"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"

import { DesktopDraggableLibraryShortcut } from "@/features/marcadores/desktop/DesktopDraggableLibraryShortcut"
import { useDeskDecorMarquee } from "@/features/marcadores/desktop/useDeskDecorMarquee"
import { useBookmarkDeskCanvasTarget } from "@/lib/drag-and-drop"

import { MarcadoresGlobalAlertLayer } from "@/features/marcadores/components/MarcadoresGlobalAlertLayer"

import { DESKTOP_LIBRARY_SHORTCUT_KEY } from "./desktopShellConstants"
import { cn } from "@/lib/utils"

export type MarcadoresDesktopDeskChromeProps = {
  hostRef: React.RefObject<HTMLDivElement | null>
  deskCanvasDropHighlight: boolean
  setDeskCanvasDropHighlight: (v: boolean) => void
  floatingOverlays?: ReactNode
  onAddLibraryWindow: () => void
  children: ReactNode
}

export function MarcadoresDesktopDeskChrome({
  hostRef,
  deskCanvasDropHighlight,
  setDeskCanvasDropHighlight,
  floatingOverlays,
  onAddLibraryWindow,
  children,
}: MarcadoresDesktopDeskChromeProps) {
  const { appearance } = useAppAppearance()
  const wallpaperActive = Boolean(appearance.wallpaperDataUrl)

  const [libraryShortcutSelected, setLibraryShortcutSelected] = useState(false)
  const shortcutStorageKey = DESKTOP_LIBRARY_SHORTCUT_KEY

  const { marquee, marqueePointerHandlers } = useDeskDecorMarquee()
  const mqLeft = marquee ? Math.min(marquee.x0, marquee.x1) : 0
  const mqTop = marquee ? Math.min(marquee.y0, marquee.y1) : 0
  const mqW = marquee ? Math.abs(marquee.x1 - marquee.x0) : 0
  const mqH = marquee ? Math.abs(marquee.y1 - marquee.y0) : 0

  useBookmarkDeskCanvasTarget(hostRef, true, setDeskCanvasDropHighlight)

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative isolate min-h-0 flex-1 overflow-hidden rounded-t-md rounded-b-md",
        wallpaperActive ? "bg-transparent" : "bg-app-desktop",
        "bg-[radial-gradient(circle,rgb(0_0_0/0.05)_1px,transparent_1px)]",
        "dark:bg-[radial-gradient(circle,rgb(255_255_255/0.06)_1px,transparent_1px)]"
      )}
      aria-label="Escritorio con ventanas"
      {...marqueePointerHandlers}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setLibraryShortcutSelected(false)
        marqueePointerHandlers.onPointerDown(e)
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <DesktopDraggableLibraryShortcut
          hostRef={hostRef}
          storageKey={shortcutStorageKey}
          selected={libraryShortcutSelected}
          onSelect={() => setLibraryShortcutSelected(true)}
          onOpen={onAddLibraryWindow}
        />
      </div>

      {marquee ? (
        <div
          className={cn(
            "pointer-events-none absolute z-[6] rounded-md",
            "border border-dashed border-sky-500/40 bg-sky-400/[0.07]",
            "dark:border-amber-300/35 dark:bg-amber-400/[0.06]"
          )}
          style={{ left: mqLeft, top: mqTop, width: mqW, height: mqH }}
          aria-hidden
        />
      ) : null}

      {deskCanvasDropHighlight ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-4 z-[14] rounded-xl",
            "border-2 border-dashed border-sky-500/55 bg-sky-400/[0.06]",
            "shadow-[inset_0_0_14px_rgb(56_189_248_/_0.09)]",
            "dark:border-amber-300/45 dark:bg-amber-400/[0.07]",
            "dark:shadow-[inset_0_0_14px_rgb(251_191_36_/_0.07)]"
          )}
          aria-hidden
        />
      ) : null}

      {children}

      {floatingOverlays ? (
        <MarcadoresGlobalAlertLayer variant="desk">{floatingOverlays}</MarcadoresGlobalAlertLayer>
      ) : null}
    </div>
  )
}
