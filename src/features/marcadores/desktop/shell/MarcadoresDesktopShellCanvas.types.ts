import type { ReactNode } from "react"

import type { MarcadoresDesktopLibraryPaneShareProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import type { LibFrame } from "@/features/marcadores/desktop/shell/desktopShellGeometry"
import type { WindowBounds } from "@/features/marcadores/desktop/windowTypes"

type Canvas = { w: number; h: number }

type PreMaxBox = React.MutableRefObject<WindowBounds | null>

export type MarcadoresDesktopShellCanvasProps = {
  workspaceId: string | null
  hostRef: React.RefObject<HTMLDivElement | null>
  canvas: Canvas
  deskCanvasDropHighlight: boolean
  setDeskCanvasDropHighlight: (v: boolean) => void
  floatingOverlays?: ReactNode
  onAddLibraryWindow: () => void
  libraryWindowIds: string[]
  libFrames: Record<string, LibFrame>
  zLib: Record<string, number>
  zSeqRef: React.MutableRefObject<number>
  setZLib: React.Dispatch<React.SetStateAction<Record<string, number>>>
  /** true: la tira de tareas marca biblioteca como foco aunque el detalle siga abierto. */
  setPreferLibraryInStrip: (preferLibrary: boolean) => void
  setFocusedLibraryFromWin: (winId: string) => void
  setLibBounds: (id: string, b: WindowBounds) => void
  setLibFrames: React.Dispatch<React.SetStateAction<Record<string, LibFrame>>>
  libraryPreMaxMap: Map<string, PreMaxBox>
  canCloseLibrary: boolean
  onRequestCloseLibraryWindow: (id: string) => void
  focusedLibraryPaneId: string | null
  libraryPaneShareProps: MarcadoresDesktopLibraryPaneShareProps
  detailOpen: boolean
  detailContent: ReactNode | null
  detailFrame: LibFrame | null
  detailTitle?: string
  setDetailBounds: (b: WindowBounds) => void
  setDetailFrame: React.Dispatch<React.SetStateAction<LibFrame | null>>
  preMaxDetail: PreMaxBox
  zDetail: number
  setZDetail: React.Dispatch<React.SetStateAction<number>>
  onCloseDetail: () => void
}
