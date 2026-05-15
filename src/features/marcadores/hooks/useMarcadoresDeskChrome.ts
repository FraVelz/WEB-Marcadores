"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import {
  createDefaultDeskWindowUi,
  type DeskWindowUiState,
} from "@/features/marcadores/page/deskWindowUiState"
import { makeDeskLibWinId } from "@/features/marcadores/page/marcadoresPageStorage"

export function useMarcadoresDeskChrome(opts: {
  desktopWindowChrome: boolean
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
}) {
  const { desktopWindowChrome, selectedFolderId, setSelectedFolderId } = opts

  const [deskLibWinIds, setDeskLibWinIds] = useState<string[]>(() => [makeDeskLibWinId()])
  const [focusedDeskLibId, setFocusedDeskLibId] = useState<string | null>(null)
  const [deskFolderByWin, setDeskFolderByWin] = useState<Record<string, string | null>>({})
  const [deskUiByWin, setDeskUiByWin] = useState<Record<string, DeskWindowUiState>>({})

  const itemRefsMapRef = useRef<Map<string, React.MutableRefObject<Map<number, HTMLDivElement>>>>(new Map())
  const searchRefMapRef = useRef<Map<string, React.RefObject<HTMLInputElement | null>>>(new Map())

  const resolvedDeskLibPaneId = useMemo(() => {
    if (focusedDeskLibId && deskLibWinIds.includes(focusedDeskLibId)) return focusedDeskLibId
    return deskLibWinIds[0] ?? null
  }, [deskLibWinIds, focusedDeskLibId])

  const activeBrowseFolderId =
    desktopWindowChrome && resolvedDeskLibPaneId ? (deskFolderByWin[resolvedDeskLibPaneId] ?? null) : selectedFolderId

  const setActiveBrowseFolderId = useCallback(
    (id: string | null) => {
      if (desktopWindowChrome && resolvedDeskLibPaneId) {
        setDeskFolderByWin((prev) => ({ ...prev, [resolvedDeskLibPaneId]: id }))
      } else {
        setSelectedFolderId(id)
      }
    },
    [desktopWindowChrome, resolvedDeskLibPaneId, setSelectedFolderId]
  )

  const updateDeskUi = useCallback((winId: string, recipe: (s: DeskWindowUiState) => DeskWindowUiState) => {
    setDeskUiByWin((prev) => {
      const winPrev = prev[winId] ?? createDefaultDeskWindowUi()
      const winNext = recipe(winPrev)
      if (winNext === winPrev) return prev
      return { ...prev, [winId]: winNext }
    })
  }, [])

  const toggleDeskTreeFolderCollapse = useCallback((winId: string, folderId: string) => {
    updateDeskUi(winId, (s) => {
      const next = new Set(s.treeCollapsedIds)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return { ...s, treeCollapsedIds: next }
    })
  }, [updateDeskUi])

  const getDeskItemRefs = useCallback((winId: string) => {
    const m = itemRefsMapRef.current
    let ref = m.get(winId)
    if (!ref) {
      ref = { current: new Map() }
      m.set(winId, ref)
    }
    return ref
  }, [])

  const getDeskSearchRef = useCallback((winId: string): React.RefObject<HTMLInputElement | null> => {
    const m = searchRefMapRef.current
    let ref = m.get(winId)
    if (!ref) {
      ref = { current: null }
      m.set(winId, ref)
    }
    return ref
  }, [])

  const addDeskLibraryWindow = useCallback(() => {
    const id = makeDeskLibWinId()
    setDeskLibWinIds((prev) => [...prev, id])
    setDeskUiByWin((prev) => ({ ...prev, [id]: createDefaultDeskWindowUi() }))
    queueMicrotask(() => setFocusedDeskLibId(id))
  }, [])

  const closeDeskLibraryWindow = useCallback((id: string) => {
    itemRefsMapRef.current.delete(id)
    searchRefMapRef.current.delete(id)
    setDeskLibWinIds((prev) => (prev.length <= 1 ? prev : prev.filter((w) => w !== id)))
    setDeskFolderByWin((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setDeskUiByWin((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const focusDeskLibraryPane = useCallback((id: string) => {
    setFocusedDeskLibId(id)
  }, [])

  return {
    deskLibWinIds,
    setDeskLibWinIds,
    focusedDeskLibId,
    setFocusedDeskLibId,
    deskFolderByWin,
    setDeskFolderByWin,
    deskUiByWin,
    updateDeskUi,
    toggleDeskTreeFolderCollapse,
    getDeskItemRefs,
    getDeskSearchRef,
    resolvedDeskLibPaneId,
    activeBrowseFolderId,
    setActiveBrowseFolderId,
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
  }
}
