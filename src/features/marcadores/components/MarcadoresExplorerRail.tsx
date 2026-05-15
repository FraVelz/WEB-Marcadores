"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useDashboard } from "@/contexts/DashboardContext"

import ExplorerTree from "@/components/ExplorerTree"
import { useDashboardSidebarKeyboard } from "@/layouts/dashboard/hooks/useDashboardSidebarKeyboard"

import { cn } from "@/lib/utils"

const OPEN_KEY = "marcadores_explorer_rail_open"

type Props = {
  /**
   * Cuando hay varias ventanas de biblioteca, solo la enfocada enlaza `marcadoresExplorerPanelRef`
   * para atajos (p. ej. tecla n). En layout apilado siempre true.
   */
  registerGlobalExplorerRef?: boolean
}

export function MarcadoresExplorerRail({ registerGlobalExplorerRef = true }: Props) {
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    explorerCollapsedIds,
    setExplorerCollapsedIds,
    toggleExplorerCollapsed,
    explorerFlatSidebarItems,
    marcadoresExplorerPanelRef,
    editFolderRef,
    focusMain,
  } = useDashboard()

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true
    try {
      return localStorage.getItem(OPEN_KEY) !== "0"
    } catch {
      return true
    }
  })
  const innerRef = useRef<HTMLDivElement>(null)

  const persistOpen = useCallback((next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(OPEN_KEY, next ? "1" : "0")
    } catch {
      /* ignore */
    }
  }, [])

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

  const handleExplorerKeyDown = useDashboardSidebarKeyboard({
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
    <div className="border-app-border bg-app-sidebar flex min-h-0 shrink-0 flex-col border-r md:min-h-0">
      {!open ? (
        <div className="flex w-10 flex-col items-center gap-1 py-2">
          <button
            type="button"
            className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-2 text-xs"
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
        <div
          ref={innerRef}
          tabIndex={0}
          role="navigation"
          aria-label="Árbol de carpetas"
          data-marcadores-explorer-rail
          className={cn(
            "flex w-[min(15rem,calc(100vw-4rem))] max-w-[16rem] min-w-[11rem] flex-col overflow-hidden outline-none md:w-[13.75rem]",
            "focus:ring-0"
          )}
          onKeyDown={handleExplorerKeyDown}
        >
          <div className="border-app-border flex items-center justify-between gap-1 border-b px-2 py-1.5">
            <span className="text-app-fg-label truncate text-[11px] font-semibold tracking-wide uppercase">
              Carpetas
            </span>
            <button
              type="button"
              className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg shrink-0 rounded px-2 py-0.5 text-xs"
              aria-label="Ocultar panel de carpetas"
              title="Ocultar"
              onClick={() => persistOpen(false)}
            >
              ◀
            </button>
          </div>
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-1.5">
            <ExplorerTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelect={setSelectedFolderId}
              collapsedIds={explorerCollapsedIds}
              onToggle={toggleExplorerCollapsed}
            />
          </div>
        </div>
      )}
    </div>
  )
}
