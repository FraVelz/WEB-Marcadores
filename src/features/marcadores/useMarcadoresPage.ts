"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { useBookmarkModalController } from "@/features/marcadores/state/useBookmarkModalController"
import { useMarcadoresPageCommandHooks } from "@/features/marcadores/page/useMarcadoresPageCommandHooks"
import { useMarcadoresPageDataHooks } from "@/features/marcadores/page/useMarcadoresPageDataHooks"
import { useStackedExplorerToolbarRegistration } from "@/features/marcadores/stacked/useStackedExplorerToolbarRegistration"

export type MarcadoresPageModel = ReturnType<typeof useMarcadoresPage>

/**
 * Hook público de la página Marcadores: datos, comandos y modal unificado.
 */
export function useMarcadoresPage() {
  const data = useMarcadoresPageDataHooks()
  const { registerExplorerWideHeaderEnd } = useDashboard()
  const commands = useMarcadoresPageCommandHooks(data)

  useStackedExplorerToolbarRegistration({
    active: data.stackedExplorerHeaderBar,
    registerExplorerWideHeaderEnd,
  })

  const bookmarkModal = useBookmarkModalController({
    desktopWindowChrome: data.desktopWindowChrome,
    deskLibWinIds: data.deskLibWinIds,
    deskFolderByWin: data.deskFolderByWin,
    activeBrowseFolderId: data.browseScope.folderId,
    globalUi: data.globalScope.getState(),
    globalSetters: {
      setModalOpen: data.globalScope.bindings.setModalOpen,
      setEditingBookmark: data.globalScope.bindings.setEditingBookmark,
      setBookmarkModalNonce: data.globalScope.bindings.setBookmarkModalNonce,
    },
    deskUiByWin: data.deskUiByWin,
    updateDeskUi: data.updateDeskUi,
    focusMain: data.focusMain,
  })

  return {
    ...data,
    ...commands,
    bookmarkModal,
    /** Snapshot UI del panel global (vista simple). */
    globalPaneUi: data.globalScope.getState(),
  }
}

export {
  useMarcadoresPageDataHooks,
  type MarcadoresPageDataBundle,
} from "@/features/marcadores/page/useMarcadoresPageDataHooks"
