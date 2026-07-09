"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { useMarcadoresExplorerHeaderSlot } from "@/features/marcadores/hooks/useMarcadoresExplorerHeaderSlot"
import { useMarcadoresPageCommands } from "@/features/marcadores/page/useMarcadoresPageCommands"
import {
  useMarcadoresPageDataHooks,
  type MarcadoresPageCore,
} from "@/features/marcadores/page/useMarcadoresPageDataHooks"
import { useBookmarkModalController } from "@/features/marcadores/state/useBookmarkModalController"

export type MarcadoresPageModel = MarcadoresPageCore &
  ReturnType<typeof useMarcadoresPageCommands> & {
    bookmarkModal: ReturnType<typeof useBookmarkModalController>
  }

/**
 * Hook público de la página Marcadores: datos, comandos y modal unificado.
 */
export function useMarcadoresPage(): MarcadoresPageModel {
  const core = useMarcadoresPageDataHooks()
  const { registerExplorerWideHeaderEnd } = useDashboard()
  const commands = useMarcadoresPageCommands(core)

  useMarcadoresExplorerHeaderSlot({
    variant: "simple",
    active: false,
    registerExplorerWideHeaderEnd,
  })

  const bookmarkModal = useBookmarkModalController({
    desktopWindowChrome: core.desktopWindowChrome,
    libraryPaneScope: core.libraryPaneScope,
    deskLibWinIds: core.deskLibWinIds,
    deskFolderByWin: core.deskFolderByWin,
    activeBrowseFolderId: core.browseScope.folderId,
    deskUiByWin: core.deskUiByWin,
    updateDeskUi: core.updateDeskUi,
    focusMain: core.focusMain,
  })

  return {
    ...core,
    ...commands,
    bookmarkModal,
  }
}
