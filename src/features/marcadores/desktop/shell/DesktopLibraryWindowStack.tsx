"use client"

import { MarcadoresDesktopLibraryPaneBody } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import type { MarcadoresDesktopLibraryPaneShareProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import { DesktopWindowFrame } from "@/features/marcadores/desktop/DesktopWindowFrame"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

import type { LibFrame } from "./desktopShellGeometry"

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

type Props = {
  canvas: { w: number; h: number }
  libraryWindowIds: string[]
  libFrames: Record<string, LibFrame>
  zLib: Record<string, number>
  zSeqRef: React.MutableRefObject<number>
  setZLib: React.Dispatch<React.SetStateAction<Record<string, number>>>
  setPreferLibraryInStrip: (preferLibrary: boolean) => void
  setFocusedLibraryFromWin: (winId: string) => void
  setLibBounds: (id: string, b: WindowBounds) => void
  setLibFrames: React.Dispatch<React.SetStateAction<Record<string, LibFrame>>>
  libraryPreMaxMap: Map<string, PreMaxBox>
  canCloseLibrary: boolean
  onRequestCloseLibraryWindow: (id: string) => void
  focusedLibraryPaneId: string | null
  libraryPaneShareProps: MarcadoresDesktopLibraryPaneShareProps
  setDeskCanvasDropHighlight: (v: boolean) => void
  /** Al minimizar ventana: devolver foco al área principal (cabecera del explorer). */
  onWillBecomeMinimized?: () => void
}

export function DesktopLibraryWindowStack(props: Props) {
  const {
    canvas,
    libraryWindowIds,
    libFrames,
    zLib,
    zSeqRef,
    setZLib,
    setPreferLibraryInStrip,
    setFocusedLibraryFromWin,
    setLibBounds,
    setLibFrames,
    libraryPreMaxMap,
    canCloseLibrary,
    onRequestCloseLibraryWindow,
    focusedLibraryPaneId,
    libraryPaneShareProps,
    setDeskCanvasDropHighlight,
    onWillBecomeMinimized,
  } = props

  return (
    <>
      {libraryWindowIds.map((winId, idx) => {
        const frame = libFrames[winId]
        if (!frame) return null
        const subtitle = libraryWindowIds.length > 1 ? `#${idx + 1}` : undefined
        return (
          <DesktopWindowFrame
            key={winId}
            title="Marcadores"
            subtitle={subtitle}
            canvasSize={canvas}
            bounds={frame.bounds}
            onBoundsChange={(b) => setLibBounds(winId, b)}
            minimized={frame.minimized}
            maximized={frame.maximized}
            onToggleMinimize={() =>
              setLibFrames((p) => ({
                ...p,
                [winId]: { ...p[winId], minimized: !p[winId].minimized },
              }))
            }
            onToggleMaximize={() =>
              setLibFrames((p) => ({
                ...p,
                [winId]: { ...p[winId], maximized: !p[winId].maximized },
              }))
            }
            preMaxBoundsRef={libraryPreMaxMap.get(winId)!}
            zIndex={zLib[winId] ?? 10 + idx}
            onActivate={() => {
              zSeqRef.current += 1
              setZLib((z) => ({ ...z, [winId]: zSeqRef.current }))
              setPreferLibraryInStrip(true)
              setFocusedLibraryFromWin(winId)
            }}
            showClose={canCloseLibrary}
            onClose={canCloseLibrary ? () => onRequestCloseLibraryWindow(winId) : undefined}
            isolateBookmarkDragBubble
            onDismissDesktopDropHighlight={() => setDeskCanvasDropHighlight(false)}
            onWillBecomeMinimized={onWillBecomeMinimized}
          >
            <div
              className="bg-app-sidebar flex min-h-0 flex-1 flex-col overflow-hidden"
              onPointerDownCapture={() => {
                zSeqRef.current += 1
                setZLib((z) => ({ ...z, [winId]: zSeqRef.current }))
                setPreferLibraryInStrip(true)
                setFocusedLibraryFromWin(winId)
              }}
            >
              <MarcadoresDesktopLibraryPaneBody
                {...libraryPaneShareProps}
                winId={winId}
                focused={focusedLibraryPaneId === winId}
              />
            </div>
          </DesktopWindowFrame>
        )
      })}
    </>
  )
}
