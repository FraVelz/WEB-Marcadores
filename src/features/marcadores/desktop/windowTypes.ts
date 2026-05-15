export type WindowBounds = { x: number; y: number; w: number; h: number }

type PersistedWindowState = WindowBounds & {
  minimized?: boolean
  maximized?: boolean
}

/** @deprecated migrar a v2 */
export type MarcadoresDesktopLayoutV1 = {
  v: 1
  library: PersistedWindowState
  detail?: PersistedWindowState
}

export const DESKTOP_DETAIL_WINDOW_ID = "__desk_detail__"

export type PersistedDesktopWindowV2 = PersistedWindowState & {
  id: string
  kind: "library" | "detail"
}

export type MarcadoresDesktopLayoutV2 = {
  v: 2
  libraryWindowIds: string[]
  windows: PersistedDesktopWindowV2[]
}

export type DesktopSurfaceTask = {
  id: string
  title: string
  subtitle?: string
  minimized: boolean
  maximized: boolean
  /** Ventana seleccionada (z-order alto / panel activo del escritorio). */
  isFocused: boolean
  kind: "library" | "detail"
}

/** API expuesta desde el escritorio (cabecera tipo barra de tareas y acciones en bloque). */
export type DesktopWmExtras = {
  tasks: DesktopSurfaceTask[]
  focusTask: (id: string) => void
  minimizeAll: () => void
  restoreMinimized: () => void
  maximizeAll: () => void
  restoreWindowSizes: () => void
}
