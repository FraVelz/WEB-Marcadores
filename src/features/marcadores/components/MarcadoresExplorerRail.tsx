"use client"

import { useEffect, useRef, useState } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import ExplorerTree from "@/features/marcadores/components/explorer/ExplorerTree"
import { useDashboardSidebarHotkeys } from "@/layouts/dashboard/hooks/useDashboardSidebarHotkeys"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN, HOTKEY_SCOPE_FOCUS } from "@/lib/focusStyles"
import { readTabScopedItem, writeTabScopedItem } from "@/lib/tabScopedStorage"

const OPEN_KEY = "marcadores_explorer_rail_open"

type Props = {
  /**
   * Cuando hay varias ventanas de biblioteca, solo la enfocada enlaza `marcadoresExplorerPanelRef`
   * para atajos (p. ej. tecla n). En layout apilado siempre true.
   */
  registerGlobalExplorerRef?: boolean
  folderSelection?: { folderId: string | null; onFolderChange: (id: string | null) => void } | null
  folderBookmarkCounts?: Map<string | null, number>
}

export function MarcadoresExplorerRail({
  registerGlobalExplorerRef = true,
  folderSelection = null,
  folderBookmarkCounts,
}: Props) {
  const {
    folders,
    selectedFolderId: ctxFolderId,
    setSelectedFolderId: setCtxFolderId,
    explorerCollapsedIds,
    setExplorerCollapsedIds,
    toggleExplorerCollapsed,
    explorerFlatSidebarItems,
    marcadoresExplorerPanelRef,
    editFolderRef,
    focusMain,
  } = useDashboard()

  const selectedFolderId = folderSelection ? folderSelection.folderId : ctxFolderId
  const setSelectedFolderId = folderSelection ? folderSelection.onFolderChange : setCtxFolderId

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true
    try {
      return readTabScopedItem(OPEN_KEY) !== "0"
    } catch {
      return true
    }
  })
  const innerRef = useRef<HTMLDivElement>(null)

  const persistOpen = (next: boolean) => {
    setOpen(next)
    if (typeof window === "undefined") return
    const value = next ? "1" : "0"
    try {
      writeTabScopedItem(OPEN_KEY, value)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!registerGlobalExplorerRef) return
    const el = innerRef.current
    if (!el) return
    marcadoresExplorerPanelRef.current = el
    return () => {
      if (marcadoresExplorerPanelRef.current === el) {
        marcadoresExplorerPanelRef.current = null
      }
    }
  }, [registerGlobalExplorerRef, marcadoresExplorerPanelRef])

  useDashboardSidebarHotkeys({
    elementRef: innerRef,
    enabled: open,
    flatSidebarItems: explorerFlatSidebarItems,
    selectedFolderId,
    setSelectedFolderId,
    folders,
    collapsedIds: explorerCollapsedIds,
    setCollapsedIds: setExplorerCollapsedIds,
    focusMain,
    editFolderRef,
  })

  if (folders.length === 0) {
    return null
  }

  return (
    <div className="border-app-border bg-app-sidebar flex h-full max-h-full min-h-0 shrink-0 flex-col border-r">
      {!open ? (
        <div className="flex w-10 flex-col items-center gap-1 py-2">
          <button
            type="button"
            className={cn(
              "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-2 text-xs",
              FOCUS_RING_ICON_BTN
            )}
            aria-label="Mostrar carpetas"
            title="Mostrar carpetas"
            onClick={() => persistOpen(true)}
          >
            <span aria-hidden className="text-base">
              ›
            </span>
          </button>
          <span className="text-app-fg-muted rotate-180 text-[10px] tracking-wider uppercase [writing-mode:vertical-rl]">
            Carpetas
          </span>
        </div>
      ) : (
        <nav
          ref={innerRef}
          aria-label="Explorador de carpetas"
          data-marcadores-explorer-rail
          className={cn(
            "flex h-full max-h-full min-h-0 w-[min(15rem,calc(100vw-4rem))] max-w-[16rem] min-w-[11rem] flex-col overflow-hidden md:w-[13.75rem]",
            HOTKEY_SCOPE_FOCUS
          )}
        >
          <div className="border-app-border flex shrink-0 items-center justify-between gap-1 border-b px-2 py-1.5">
            <span className="text-app-fg-label truncate text-[11px] font-semibold tracking-wide uppercase">
              Carpetas
            </span>
            <button
              type="button"
              className={cn(
                "text-app-fg-muted hover:bg-app-hover hover:text-app-fg shrink-0 rounded px-2 py-0.5 text-xs",
                FOCUS_RING_ICON_BTN
              )}
              aria-label="Ocultar panel de carpetas"
              title="Ocultar"
              onClick={() => persistOpen(false)}
            >
              ◀
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-1.5">
              <ExplorerTree
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelect={setSelectedFolderId}
                collapsedIds={explorerCollapsedIds}
                onToggle={toggleExplorerCollapsed}
                folderBookmarkCounts={folderBookmarkCounts}
              />
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
