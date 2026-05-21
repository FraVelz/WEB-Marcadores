"use client"

import { useMemo } from "react"

import type { DeskLibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { createDeskPaneScope, type LibraryPaneUiScope } from "@/features/marcadores/state/libraryPaneUiScope"

/** Scope del panel activo: ventana enfocada en escritorio o panel global en vista simple. */
export function useResolvedLibraryPaneScope(opts: {
  desktopWindowChrome: boolean
  resolvedDeskLibPaneId: string | null
  globalScope: LibraryPaneUiScope
  deskUiByWin: Record<string, DeskLibraryPaneUiState>
  updateDeskUi: (id: string, recipe: (s: DeskLibraryPaneUiState) => DeskLibraryPaneUiState) => void
  getDeskItemRefs: (id: string) => LibraryPaneUiScope["itemRefs"]
  getDeskSearchRef: (id: string) => LibraryPaneUiScope["searchRef"]
}): LibraryPaneUiScope {
  const {
    desktopWindowChrome,
    resolvedDeskLibPaneId,
    globalScope,
    deskUiByWin,
    updateDeskUi,
    getDeskItemRefs,
    getDeskSearchRef,
  } = opts

  return useMemo(() => {
    if (desktopWindowChrome && resolvedDeskLibPaneId) {
      return createDeskPaneScope(resolvedDeskLibPaneId, deskUiByWin, updateDeskUi, getDeskItemRefs, getDeskSearchRef)
    }
    return globalScope
  }, [
    desktopWindowChrome,
    resolvedDeskLibPaneId,
    globalScope,
    deskUiByWin,
    updateDeskUi,
    getDeskItemRefs,
    getDeskSearchRef,
  ])
}
