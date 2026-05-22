"use client"

import { useCallback, useMemo, useRef, useState, type SetStateAction } from "react"

import { createDefaultLibraryPaneUi, type LibraryPaneUiState } from "@/features/marcadores/state/libraryPaneUiState"
import { createLibraryPaneBindings, type LibraryPaneUiScope } from "@/features/marcadores/state/libraryPaneUiScope"

/** Estado UI del panel global (vista simple); escritorio usa `deskUiByWin`. */
export function useMarcadoresPageUiState() {
  const [paneUi, setPaneUi] = useState<LibraryPaneUiState>(createDefaultLibraryPaneUi)

  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const searchRef = useRef<HTMLInputElement>(null)

  const patchState = useCallback((recipe: (s: LibraryPaneUiState) => LibraryPaneUiState) => {
    setPaneUi((s) => {
      const next = recipe(s)
      return next === s ? s : next
    })
  }, [])

  const bindings = useMemo(
    () =>
      createLibraryPaneBindings(
        <Key extends keyof LibraryPaneUiState>(key: Key, action: SetStateAction<LibraryPaneUiState[Key]>) => {
          setPaneUi((s) => {
            const next =
              typeof action === "function"
                ? (action as (x: LibraryPaneUiState[Key]) => LibraryPaneUiState[Key])(s[key])
                : action
            if (Object.is(next, s[key])) return s
            return { ...s, [key]: next }
          })
        }
      ),
    []
  )

  const globalScope: LibraryPaneUiScope = {
    getState: () => paneUi,
    patch: patchState,
    bindings,
    itemRefs,
    searchRef,
  }

  return { globalScope }
}
