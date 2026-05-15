"use client"

import { DesktopWindowFrame } from "@/features/marcadores/desktop/DesktopWindowFrame"

import { DesktopLibraryWindowStack } from "./DesktopLibraryWindowStack"
import { MarcadoresDesktopDeskChrome } from "./MarcadoresDesktopDeskChrome"
import type { MarcadoresDesktopShellCanvasProps } from "./MarcadoresDesktopShellCanvas.types"

export function MarcadoresDesktopShellCanvas({
  workspaceId,
  hostRef,
  canvas,
  deskCanvasDropHighlight,
  setDeskCanvasDropHighlight,
  floatingOverlays,
  onAddLibraryWindow,
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
  detailOpen,
  detailContent,
  detailFrame,
  detailTitle,
  setDetailBounds,
  setDetailFrame,
  preMaxDetail,
  zDetail,
  setZDetail,
  onCloseDetail,
}: MarcadoresDesktopShellCanvasProps) {
  const { w: cw, h: ch } = canvas
  const ready = cw > 0 && ch > 0

  return (
    <MarcadoresDesktopDeskChrome
      workspaceId={workspaceId}
      hostRef={hostRef}
      deskCanvasDropHighlight={deskCanvasDropHighlight}
      setDeskCanvasDropHighlight={setDeskCanvasDropHighlight}
      floatingOverlays={floatingOverlays}
      onAddLibraryWindow={onAddLibraryWindow}
    >
      {ready ? (
        <>
          <DesktopLibraryWindowStack
            canvas={canvas}
            libraryWindowIds={libraryWindowIds}
            libFrames={libFrames}
            zLib={zLib}
            zSeqRef={zSeqRef}
            setZLib={setZLib}
            setPreferLibraryInStrip={setPreferLibraryInStrip}
            setFocusedLibraryFromWin={setFocusedLibraryFromWin}
            setLibBounds={setLibBounds}
            setLibFrames={setLibFrames}
            libraryPreMaxMap={libraryPreMaxMap}
            canCloseLibrary={canCloseLibrary}
            onRequestCloseLibraryWindow={onRequestCloseLibraryWindow}
            focusedLibraryPaneId={focusedLibraryPaneId}
            libraryPaneShareProps={libraryPaneShareProps}
            setDeskCanvasDropHighlight={setDeskCanvasDropHighlight}
            onWillBecomeMinimized={libraryPaneShareProps.focusMain}
          />

          {detailOpen && detailContent && detailFrame ? (
            <DesktopWindowFrame
              title="Propiedades"
              subtitle={detailTitle}
              canvasSize={canvas}
              bounds={detailFrame.bounds}
              onBoundsChange={setDetailBounds}
              minimized={detailFrame.minimized}
              maximized={detailFrame.maximized}
              onToggleMinimize={() => setDetailFrame((p) => (p ? { ...p, minimized: !p.minimized } : p))}
              onToggleMaximize={() => setDetailFrame((p) => (p ? { ...p, maximized: !p.maximized } : p))}
              preMaxBoundsRef={preMaxDetail}
              zIndex={zDetail}
              onActivate={() => {
                zSeqRef.current += 1
                setZDetail(zSeqRef.current)
                setPreferLibraryInStrip(false)
              }}
              showClose
              onClose={onCloseDetail}
              isolateBookmarkDragBubble
              onDismissDesktopDropHighlight={() => setDeskCanvasDropHighlight(false)}
              onWillBecomeMinimized={libraryPaneShareProps.focusMain}
            >
              <div className="bg-app-sidebar flex min-h-0 flex-1 flex-col overflow-hidden">{detailContent}</div>
            </DesktopWindowFrame>
          ) : null}
        </>
      ) : null}
    </MarcadoresDesktopDeskChrome>
  )
}
