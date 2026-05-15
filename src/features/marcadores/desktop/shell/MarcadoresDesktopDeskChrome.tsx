"use client"

import type { ReactNode } from "react"

import { DesktopShortcut } from "@/features/marcadores/desktop/DesktopShortcut"
import { isBookmarkDragTransfer } from "@/features/marcadores/utils/parseDragPayload"

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
  return (
    <div
      ref={hostRef}
      className={cn(
        "bg-app-desktop relative isolate min-h-0 flex-1 overflow-hidden rounded-t-md rounded-b-md",
        "bg-[radial-gradient(circle,rgb(0_0_0/0.05)_1px,transparent_1px)]",
        "dark:bg-[radial-gradient(circle,rgb(255_255_255/0.06)_1px,transparent_1px)]"
      )}
      aria-label="Escritorio con ventanas"
      onDragEnter={(e) => {
        if (!isBookmarkDragTransfer(e.dataTransfer)) return
        setDeskCanvasDropHighlight(true)
      }}
      onDragOver={(e) => {
        if (!isBookmarkDragTransfer(e.dataTransfer)) return
        e.preventDefault()
        setDeskCanvasDropHighlight(true)
      }}
      onDragLeave={(e) => {
        const rt = e.relatedTarget as Node | null
        if (rt && hostRef.current?.contains(rt)) return
        setDeskCanvasDropHighlight(false)
      }}
      onDrop={(e) => {
        setDeskCanvasDropHighlight(false)
        e.preventDefault()
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="pointer-events-auto absolute top-3 left-3 flex flex-col gap-3">
          <DesktopShortcut label="Marcadores" icon={<span aria-hidden>📚</span>} onDoubleClick={onAddLibraryWindow} />
        </div>
      </div>

      {floatingOverlays ? (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-[80] flex flex-col items-center gap-2 p-2">
          <div className="pointer-events-auto flex w-full max-w-lg flex-col items-center gap-2">{floatingOverlays}</div>
        </div>
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
    </div>
  )
}
