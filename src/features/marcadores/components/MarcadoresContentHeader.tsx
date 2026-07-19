"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

import type { BookmarkSortOrder } from "@/features/marcadores/state/libraryPaneUiState"
import { MarcadoresSearchField } from "./MarcadoresSearchField"
import { McpSetupModal } from "./McpSetupModal"

type Props = {
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  searchInSubfolders: boolean
  setSearchInSubfolders: (v: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (v: boolean) => void
  bookmarkSort: BookmarkSortOrder
  setBookmarkSort: (v: BookmarkSortOrder) => void
  viewMode: "grid" | "tree"
  onToggleViewMode: () => void
  treeToggleDisabled?: boolean
  onEnter?: () => void
}

const SORT_OPTIONS: { value: BookmarkSortOrder; label: string }[] = [
  { value: "recent", label: "Recientes" },
  { value: "title", label: "Título" },
  { value: "created", label: "Fecha de alta" },
]

export function MarcadoresContentHeader({
  searchValue,
  setSearchValue,
  searchRef,
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
  bookmarkSort,
  setBookmarkSort,
  viewMode,
  onToggleViewMode,
  treeToggleDisabled = false,
  onEnter,
}: Props) {
  const [mcpOpen, setMcpOpen] = useState(false)

  return (
    <>
      <header className="border-app-border bg-app-toolbar shrink-0 border-b px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="shrink-0">
            <h1 className="text-app-fg text-xl font-semibold tracking-tight">Marcadores</h1>
            <p className="text-app-fg-muted mt-0.5 text-sm">Tus enlaces, organizados</p>
          </div>

          <div className="mx-auto w-full max-w-xl min-w-0 flex-1">
            <MarcadoresSearchField
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              searchRef={searchRef}
              searchInSubfolders={searchInSubfolders}
              setSearchInSubfolders={setSearchInSubfolders}
              searchInDescription={searchInDescription}
              setSearchInDescription={setSearchInDescription}
              onEnter={onEnter}
              variant="pill"
              chipsClassName="justify-center lg:justify-start"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 lg:pt-1">
            <select
              value={bookmarkSort}
              onChange={(e) => setBookmarkSort(e.target.value as BookmarkSortOrder)}
              className="border-app-input-border bg-app-raised-muted text-app-fg rounded-lg border px-3 py-2 text-sm"
              aria-label="Ordenar marcadores"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {!treeToggleDisabled ? (
              <div
                role="group"
                aria-label="Modo de vista"
                className="border-app-border bg-app-raised-muted flex rounded-lg border p-0.5"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === "grid"}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    FOCUS_RING_ICON_BTN,
                    viewMode === "grid" ? "bg-app-primary text-white shadow-sm" : "text-app-fg-muted hover:text-app-fg"
                  )}
                  title="Vista cuadrícula"
                  aria-label="Vista cuadrícula"
                  onClick={() => viewMode !== "grid" && onToggleViewMode()}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "tree"}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    FOCUS_RING_ICON_BTN,
                    viewMode === "tree" ? "bg-app-primary text-white shadow-sm" : "text-app-fg-muted hover:text-app-fg"
                  )}
                  title="Vista árbol"
                  aria-label="Vista árbol"
                  onClick={() => viewMode !== "tree" && onToggleViewMode()}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M3 3h8v8H3V3zm10 0h8v4h-8V3zM3 13h8v8H3v-8zm10 4h8v4h-8v-4z" />
                  </svg>
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setMcpOpen(true)}
              className={cn(
                "border-app-input-border bg-app-raised-muted text-app-fg inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium",
                FOCUS_RING_ICON_BTN,
                "hover:bg-app-hover cursor-pointer"
              )}
              title="Configurar MCP para Cursor"
              aria-label="Configurar MCP"
            >
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>MCP</span>
            </button>
          </div>
        </div>
      </header>

      <McpSetupModal open={mcpOpen} onClose={() => setMcpOpen(false)} />
    </>
  )
}
