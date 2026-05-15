import type { SetStateAction } from "react"

import type { LibFrame } from "@/features/marcadores/desktop/shell/desktopShellGeometry"

export type DeskShellState = {
  canvas: { w: number; h: number }
  libFrames: Record<string, LibFrame>
  detailFrame: LibFrame | null
  zLib: Record<string, number>
  zDetail: number
  deskReady: boolean
}

export const INITIAL_DESK_SHELL: DeskShellState = {
  canvas: { w: 0, h: 0 },
  libFrames: {},
  detailFrame: null,
  zLib: {},
  zDetail: 115,
  deskReady: false,
}

export type DeskShellAction = {
  type: "apply"
  updater: (s: DeskShellState) => DeskShellState
}

export function applyDeskPatch<T extends keyof DeskShellState>(
  kind: T,
  u: SetStateAction<DeskShellState[T]>,
  s: DeskShellState
): DeskShellState {
  const prev = s[kind]
  const next = typeof u === "function" ? (u as (p: DeskShellState[T]) => DeskShellState[T])(prev) : u
  return next === prev ? s : { ...s, [kind]: next }
}

export function deskShellReducer(s: DeskShellState, a: DeskShellAction): DeskShellState {
  return a.type === "apply" ? a.updater(s) : s
}
