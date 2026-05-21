"use client"

import { useCallback, useEffect } from "react"

import type { LibraryPaneUiBindings } from "@/features/marcadores/state/libraryPaneUiScope"
import type { Bookmark } from "@/features/marcadores/utils/types"

/** Registro para atajos globales + navegador de pestaña y cierre consistente del panel de detalle. */
export function useMarcadoresBookmarkRuntime(opts: {
  bookmarks: Bookmark[]
  registerMarcadoresRuntime: (
    value: {
      bookmarks: Pick<Bookmark, "id" | "title" | "url">[]
      recordBookmarkOpened: (id: string) => Promise<void>
    } | null
  ) => void
  recordBookmarkOpened: (id: string) => Promise<void>
  paneBindings: Pick<LibraryPaneUiBindings, "setDetailBookmark" | "setInfoPanelEnabled">
}) {
  const { bookmarks, registerMarcadoresRuntime, recordBookmarkOpened, paneBindings } = opts
  const { setDetailBookmark, setInfoPanelEnabled } = paneBindings

  const closeBookmarkDetailPanel = useCallback(() => {
    setDetailBookmark(null)
    setInfoPanelEnabled(false)
  }, [setDetailBookmark, setInfoPanelEnabled])

  const openBookmarkTab = useCallback(
    (b: Bookmark) => {
      window.open(b.url, "_blank", "noopener,noreferrer")
      void recordBookmarkOpened(b.id)
    },
    [recordBookmarkOpened]
  )

  useEffect(() => {
    registerMarcadoresRuntime({
      bookmarks: bookmarks.map((b) => ({ id: b.id, title: b.title, url: b.url })),
      recordBookmarkOpened,
    })
    return () => registerMarcadoresRuntime(null)
  }, [bookmarks, registerMarcadoresRuntime, recordBookmarkOpened])

  return { openBookmarkTab, closeBookmarkDetailPanel }
}
