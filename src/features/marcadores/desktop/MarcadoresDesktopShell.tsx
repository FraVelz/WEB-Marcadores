"use client"

import type { ReactNode } from "react"
import type { SetStateAction } from "react"
import { useEffect, useReducer, useRef } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import type { MarcadoresDesktopLibraryPaneShareProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import { MarcadoresDesktopLayoutBar } from "@/features/marcadores/desktop/MarcadoresDesktopLayoutBar"
import { MarcadoresDesktopTaskStrip } from "@/features/marcadores/desktop/MarcadoresDesktopTaskStrip"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import {
  applyDeskPatch,
  deskShellReducer,
  INITIAL_DESK_SHELL,
  type DeskShellState,
} from "@/features/marcadores/desktop/marcadoresDeskShellReducer"
import { MARCADORES_DESK_WINDOW_Z_START } from "@/features/marcadores/utils/layerZIndex"

import {
  MarcadoresDesktopShellCanvas,
  MIN_CANVAS,
  useDeskCanvasDropHighlight,
  useDeskPersistSchedule,
  useDeskShellDragClear,
  useDeskShellHydration,
  useDeskShellWorkflows,
} from "@/features/marcadores/desktop/shell"

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

export type MarcadoresDesktopShellProps = {
  libraryWindowIds: string[]
  setLibraryWindowIds: React.Dispatch<React.SetStateAction<string[]>>
  onAddLibraryWindow: () => void
  focusedLibraryPaneId: string | null
  onFocusLibraryPane: (id: string) => void
  /** Banners globales sobre el escritorio (errores, confirmaciones, demo). */
  floatingOverlays?: ReactNode
  libraryPaneShareProps: MarcadoresDesktopLibraryPaneShareProps

  detailOpen: boolean
  detailTitle?: string
  detailContent: ReactNode | null
  onCloseDetail: () => void
  onRequestCloseLibraryWindow: (id: string) => void
}

export function MarcadoresDesktopShell({
  libraryWindowIds,
  setLibraryWindowIds,
  onAddLibraryWindow,
  focusedLibraryPaneId,
  onFocusLibraryPane,
  floatingOverlays,
  libraryPaneShareProps,
  detailOpen,
  detailTitle,
  detailContent,
  onCloseDetail,
  onRequestCloseLibraryWindow,
}: MarcadoresDesktopShellProps) {
  const { focusMain } = useDashboard()
  const hostRef = useRef<HTMLDivElement>(null)

  const [desk, dispatchDesk] = useReducer(deskShellReducer, INITIAL_DESK_SHELL)

  const applyDesk = (updater: (s: DeskShellState) => DeskShellState) => {
    dispatchDesk({ type: "apply", updater })
  }

  const setLibFrames = (u: SetStateAction<DeskShellState["libFrames"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("libFrames", u, s) })
  }

  const setDetailFrame = (u: SetStateAction<DeskShellState["detailFrame"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("detailFrame", u, s) })
  }

  const setZLib = (u: SetStateAction<DeskShellState["zLib"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("zLib", u, s) })
  }

  const setZDetail = (u: SetStateAction<DeskShellState["zDetail"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("zDetail", u, s) })
  }

  const canvas = desk.canvas
  const libFrames = desk.libFrames
  const detailFrame = desk.detailFrame
  const zLib = desk.zLib
  const zDetail = desk.zDetail
  const deskReady = desk.deskReady

  const libraryPreMaxMap = (() => {
    const m = new Map<string, PreMaxBox>()
    for (const id of libraryWindowIds) {
      m.set(id, { current: null } satisfies PreMaxBox)
    }
    return m
  })()

  const preMaxDetail = useRef<WindowBounds | null>(null)

  const libIdsRef = useRef(libraryWindowIds)
  useEffect(() => {
    libIdsRef.current = libraryWindowIds
  }, [libraryWindowIds])

  const zSeqRef = useRef(MARCADORES_DESK_WINDOW_Z_START)
  const hydratedRef = useRef(false)

  useDeskPersistSchedule({ libraryWindowIds, libFrames, detailFrame })

  const { deskCanvasDropHighlight, setDeskCanvasDropHighlight } = useDeskCanvasDropHighlight()

  useDeskShellDragClear(() => setDeskCanvasDropHighlight(false))

  useDeskShellHydration({
    hostRef,
    setLibraryWindowIds,
    libIdsRef,
    applyDesk,
    hydratedRef,
    deskReady,
    libraryWindowIds,
    detailOpen,
    canvas,
    zSeqRef,
  })

  const {
    desktopWm,
    focusLibraryFromWin,
    setPreferLibraryInStrip,
    tileTwoColumns,
    setLibBounds,
    setDetailBounds,
    minimizeAllWindows,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  } = useDeskShellWorkflows({
    libraryWindowIds,
    libFrames,
    setLibFrames,
    setDetailFrame,
    detailFrame,
    detailOpen,
    detailTitle,
    canvas,
    libraryPreMaxMap,
    preMaxDetail,
    zSeqRef,
    setZLib,
    setZDetail,
    onFocusLibraryPane,
    focusedLibraryPaneId,
  })

  const minimizeAllAndFocusMain = () => {
    minimizeAllWindows()
    queueMicrotask(() => focusMain())
  }

  const canCloseLibrary = libraryWindowIds.length > 1
  const deskSurfaceReady = deskReady && canvas.w >= MIN_CANVAS && canvas.h >= MIN_CANVAS
  const canTileTwoColumns = libraryWindowIds.length === 2

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-app-border bg-app-toolbar flex shrink-0 items-center gap-2 overflow-x-auto border-b px-3 py-1.5">
        <MarcadoresDesktopTaskStrip surfaces={desktopWm.tasks} onFocusTask={desktopWm.focusTask} />
        <MarcadoresDesktopLayoutBar
          canTileTwoColumns={canTileTwoColumns}
          onTileTwoColumns={tileTwoColumns}
          deskSurfaceReady={deskSurfaceReady}
          onMinimizeAll={minimizeAllAndFocusMain}
          onRestoreMinimized={restoreMinimizedWindows}
          onMaximizeAll={maximizeAllWindows}
          onRestoreWindowSizes={restoreWindowSizes}
          inlineInExplorerHeader
        />
      </div>
      <MarcadoresDesktopShellCanvas
        hostRef={hostRef}
        canvas={canvas}
        deskCanvasDropHighlight={deskCanvasDropHighlight}
        setDeskCanvasDropHighlight={setDeskCanvasDropHighlight}
        floatingOverlays={floatingOverlays}
        onAddLibraryWindow={onAddLibraryWindow}
        libraryWindowIds={libraryWindowIds}
        libFrames={libFrames}
        zLib={zLib}
        zSeqRef={zSeqRef}
        setZLib={setZLib}
        setPreferLibraryInStrip={setPreferLibraryInStrip}
        setFocusedLibraryFromWin={focusLibraryFromWin}
        setLibBounds={setLibBounds}
        setLibFrames={setLibFrames}
        libraryPreMaxMap={libraryPreMaxMap}
        canCloseLibrary={canCloseLibrary}
        onRequestCloseLibraryWindow={onRequestCloseLibraryWindow}
        focusedLibraryPaneId={focusedLibraryPaneId}
        libraryPaneShareProps={libraryPaneShareProps}
        detailOpen={detailOpen}
        detailContent={detailContent}
        detailFrame={detailFrame}
        detailTitle={detailTitle}
        setDetailBounds={setDetailBounds}
        setDetailFrame={setDetailFrame}
        preMaxDetail={preMaxDetail}
        zDetail={zDetail}
        setZDetail={setZDetail}
        onCloseDetail={onCloseDetail}
      />
    </div>
  )
}
