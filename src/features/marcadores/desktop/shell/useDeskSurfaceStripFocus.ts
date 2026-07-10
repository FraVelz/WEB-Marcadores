"use client"

import { useState } from "react"

export type DeskFocusedSurface = { kind: "library"; id: string } | { kind: "detail" }

export function useDeskSurfaceStripFocus(opts: {
  detailOpen: boolean
  detailFrame: unknown | null
  focusedLibraryPaneId: string | null
  libraryWindowIds: string[]
}) {
  const { detailOpen, detailFrame, focusedLibraryPaneId, libraryWindowIds } = opts

  const [preferLibraryWhileDetailOpen, setPreferLibraryWhileDetailOpen] = useState(false)

  const focusedSurface = ((): DeskFocusedSurface => {
    if (detailOpen && detailFrame && !preferLibraryWhileDetailOpen) return { kind: "detail" }
    const first = libraryWindowIds[0] ?? ""
    const id = focusedLibraryPaneId && libraryWindowIds.includes(focusedLibraryPaneId) ? focusedLibraryPaneId : first
    return { kind: "library", id }
  })()

  const setPreferLibraryInStrip = (preferLibrary: boolean) => {
    setPreferLibraryWhileDetailOpen(preferLibrary)
  }

  return { focusedSurface, setPreferLibraryInStrip }
}
