"use client"

import { useMemo } from "react"

import type { DashboardContextType } from "@/contexts/dashboardContextContract"

import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData"
import { useMarcadoresDeskPaneDerivedMap } from "@/features/marcadores/hooks/useMarcadoresDeskChrome"
import { useMarcadoresPageUiState } from "@/features/marcadores/page/useMarcadoresPageUiState"
import { buildDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"

type DashPick = Pick<DashboardContextType, "setFolders" | "refreshFolders" | "refreshTags">
type Ui = ReturnType<typeof useMarcadoresPageUiState>

export function useMarcadoresPageBookmarksBootstrap(p: {
  u: Ui
  dash: DashPick
  activeBrowseFolderId: string | null
  desktopWindowChrome: boolean
  deskLibWinIds: string[]
  deskFolderByWin: Record<string, string | null>
}) {
  const dataOpts = useMemo(
    () => ({ browseMode: p.u.browseMode, activeViewAst: p.u.activeViewAst }),
    [p.u.browseMode, p.u.activeViewAst]
  )

  const data = useMarcadoresData(
    p.u.searchValue,
    p.activeBrowseFolderId,
    p.dash.setFolders,
    p.dash.refreshFolders,
    dataOpts
  )

  const desktopPaneDerived = useMarcadoresDeskPaneDerivedMap({
    desktopWindowChrome: p.desktopWindowChrome,
    deskLibWinIds: p.deskLibWinIds,
    deskFolderByWin: p.deskFolderByWin,
    browseMode: p.u.browseMode,
    folders: data.folders,
    filteredBookmarks: data.filteredBookmarks,
  })

  const actions = useMarcadoresActions({
    bookmarks: data.bookmarks,
    setBookmarks: data.setBookmarks,
    folders: data.folders,
    setFolders: data.setFolders,
    setCtxFolders: p.dash.setFolders,
    refreshFolders: p.dash.refreshFolders,
    refreshTags: p.dash.refreshTags,
    fetchData: data.fetchData,
    selectedFolderId: p.activeBrowseFolderId,
    setDetailBookmark: p.u.setDetailBookmark,
  })

  const duplicateClusterCount = useMemo(() => buildDuplicateClusters(data.bookmarks).length, [data.bookmarks])

  return { ...data, desktopPaneDerived, duplicateClusterCount, ...actions }
}
