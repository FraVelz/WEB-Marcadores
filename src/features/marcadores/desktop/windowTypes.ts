export type WindowBounds = { x: number; y: number; w: number; h: number }

export type PersistedWindowState = WindowBounds & {
  minimized?: boolean
  maximized?: boolean
}

/** @deprecated migrar a v2 */
export type MarcadoresDesktopLayoutV1 = {
  v: 1
  library: PersistedWindowState
  detail?: PersistedWindowState
}

export type DesktopWindowKind = "library" | "detail"

export type PersistedDesktopWindowV2 = PersistedWindowState & {
  id: string
  kind: DesktopWindowKind
}

export type MarcadoresDesktopLayoutV2 = {
  v: 2
  libraryWindowIds: string[]
  windows: PersistedDesktopWindowV2[]
}
