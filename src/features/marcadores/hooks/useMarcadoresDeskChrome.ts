"use client"

import { useCallback, useMemo, useState } from "react"

import type { Folder } from "@/contexts/DashboardContext"

import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import { buildMarcadoresFlatList } from "@/features/marcadores/hooks/useMarcadoresData"
import { makeDeskLibWinId } from "@/features/marcadores/page/marcadoresPageStorage"
import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"
import { getFolderPath } from "@/features/marcadores/utils/utils"

export function useMarcadoresDeskChrome(opts: {
  desktopWindowChrome: boolean
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
}) {
  const { desktopWindowChrome, selectedFolderId, setSelectedFolderId } = opts

  const [deskLibWinIds, setDeskLibWinIds] = useState<string[]>(() => [makeDeskLibWinId()])
  const [focusedDeskLibId, setFocusedDeskLibId] = useState<string | null>(null)
  const [deskFolderByWin, setDeskFolderByWin] = useState<Record<string, string | null>>({})

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

  const addDeskLibraryWindow = useCallback(() => {
    const id = makeDeskLibWinId()
    setDeskLibWinIds((prev) => [...prev, id])
    queueMicrotask(() => setFocusedDeskLibId(id))
  }, [])

  const closeDeskLibraryWindow = useCallback((id: string) => {
    setDeskLibWinIds((prev) => (prev.length <= 1 ? prev : prev.filter((w) => w !== id)))
    setDeskFolderByWin((prev) => {
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
    resolvedDeskLibPaneId,
    activeBrowseFolderId,
    setActiveBrowseFolderId,
    addDeskLibraryWindow,
    closeDeskLibraryWindow,
    focusDeskLibraryPane,
  }
}

/** Mapas por ventana del escritorio; requiere datos ya cargados (`useMarcadoresData`). */
export function useMarcadoresDeskPaneDerivedMap(opts: {
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
  browseMode: BrowseMode
  folders: Folder[]
  filteredBookmarks: Bookmark[]
}): Record<string, { flatList: GridItem[]; breadcrumb: { id: string | null; label: string }[] }> | null {
  const { desktopWindowChrome, deskLibWinIds, deskFolderByWin, browseMode, folders, filteredBookmarks } = opts

  return useMemo(() => {
    if (!desktopWindowChrome) return null
    const m: Record<string, { flatList: GridItem[]; breadcrumb: { id: string | null; label: string }[] }> = {}
    for (const id of deskLibWinIds) {
      const fid = deskFolderByWin[id] ?? null
      m[id] = {
        flatList: buildMarcadoresFlatList(folders, filteredBookmarks, fid, browseMode),
        breadcrumb: getFolderPath(folders, fid),
      }
    }
    return m
  }, [browseMode, deskFolderByWin, deskLibWinIds, desktopWindowChrome, filteredBookmarks, folders])
}
