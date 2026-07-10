"use client"

type BrowseScopeMode = "global" | "desk"

type BrowseScopeConfig = {
  mode: BrowseScopeMode
  /** Carpeta activa (global o de la ventana enfocada). */
  folderId: string | null
  setFolderId: (id: string | null) => void
  /** Id de ventana cuando `mode === 'desk'`. */
  winId?: string | null
}

export function useBrowseScope(opts: {
  desktopWindowChrome: boolean
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  resolvedDeskLibPaneId: string | null
}): BrowseScopeConfig {
  const {
    desktopWindowChrome,
    selectedFolderId,
    setSelectedFolderId,
    deskFolderByWin,
    setDeskFolderByWin,
    resolvedDeskLibPaneId,
  } = opts

  const folderId = (() => {
    if (desktopWindowChrome && resolvedDeskLibPaneId) {
      return deskFolderByWin[resolvedDeskLibPaneId] ?? null
    }
    return selectedFolderId
  })()

  const setFolderId = (id: string | null) => {
    if (desktopWindowChrome && resolvedDeskLibPaneId) {
      setDeskFolderByWin((prev) => ({ ...prev, [resolvedDeskLibPaneId]: id }))
      return
    }
    setSelectedFolderId(id)
  }

  return {
    mode: desktopWindowChrome ? "desk" : "global",
    folderId,
    setFolderId,
    winId: desktopWindowChrome ? resolvedDeskLibPaneId : null,
  }
}
