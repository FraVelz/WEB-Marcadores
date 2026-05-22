"use client"

import type { ReactNode } from "react"
import type { SetStateAction } from "react"
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import type { MarcadoresDesktopLibraryPaneShareProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import { useMarcadoresExplorerHeaderSlot } from "@/features/marcadores/hooks/useMarcadoresExplorerHeaderSlot"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"
import {
  applyDeskPatch,
  deskShellReducer,
  INITIAL_DESK_SHELL,
  type DeskShellState,
} from "@/features/marcadores/desktop/marcadoresDeskShellReducer"
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
  const { registerExplorerWideHeaderEnd, focusMain } = useDashboard()
  const hostRef = useRef<HTMLDivElement>(null)

  const [desk, dispatchDesk] = useReducer(deskShellReducer, INITIAL_DESK_SHELL)

  const applyDesk = useCallback((updater: (s: DeskShellState) => DeskShellState) => {
    dispatchDesk({ type: "apply", updater })
  }, [])

  const setLibFrames = useCallback((u: SetStateAction<DeskShellState["libFrames"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("libFrames", u, s) })
  }, [])

  const setDetailFrame = useCallback((u: SetStateAction<DeskShellState["detailFrame"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("detailFrame", u, s) })
  }, [])

  const setZLib = useCallback((u: SetStateAction<DeskShellState["zLib"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("zLib", u, s) })
  }, [])

  const setZDetail = useCallback((u: SetStateAction<DeskShellState["zDetail"]>) => {
    dispatchDesk({ type: "apply", updater: (s) => applyDeskPatch("zDetail", u, s) })
  }, [])

  const canvas = desk.canvas
  const libFrames = desk.libFrames
  const detailFrame = desk.detailFrame
  const zLib = desk.zLib
  const zDetail = desk.zDetail
  const deskReady = desk.deskReady

  const libraryPreMaxMap = useMemo(() => {
    const m = new Map<string, PreMaxBox>()
    for (const id of libraryWindowIds) {
      m.set(id, { current: null } satisfies PreMaxBox)
    }
    return m
  }, [libraryWindowIds])

  const preMaxDetail = useRef<WindowBounds | null>(null)

  const libIdsRef = useRef(libraryWindowIds)
  useEffect(() => {
    libIdsRef.current = libraryWindowIds
  }, [libraryWindowIds])

  const zSeqRef = useRef(120)
  const hydratedRef = useRef(false)

  useDeskPersistSchedule({ libraryWindowIds, libFrames, detailFrame })

  const { deskCanvasDropHighlight, setDeskCanvasDropHighlight } = useDeskCanvasDropHighlight()

  useDeskShellDragClear(useCallback(() => setDeskCanvasDropHighlight(false), [setDeskCanvasDropHighlight]))

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

  const minimizeAllAndFocusMain = useCallback(() => {
    minimizeAllWindows()
    queueMicrotask(() => focusMain())
  }, [focusMain, minimizeAllWindows])

  const canCloseLibrary = libraryWindowIds.length > 1
  const deskSurfaceReady = deskReady && canvas.w >= MIN_CANVAS && canvas.h >= MIN_CANVAS
  const canTileTwoColumns = libraryWindowIds.length === 2

  useMarcadoresExplorerHeaderSlot({
    variant: "desk",
    registerExplorerWideHeaderEnd,
    desktopWm,
    canTileTwoColumns,
    tileTwoColumns,
    deskSurfaceReady,
    minimizeAllWindows: minimizeAllAndFocusMain,
    restoreMinimizedWindows,
    maximizeAllWindows,
    restoreWindowSizes,
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
