"use client"

import { cn } from "@/lib/utils"

import { useDebouncedSearchInput } from "@/features/marcadores/hooks/useDebouncedSearchInput"
import type { BookmarkSortOrder } from "@/features/marcadores/state/libraryPaneUiState"
import ToolbarSearchOptions from "./ToolbarSearchOptions"

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
  const { draft, setDraft, flush } = useDebouncedSearchInput({
    query: searchValue,
    onQueryChange: setSearchValue,
  })

  const placeholder = searchInDescription ? "Buscar en título, descripción, URL, tags…" : "Buscar en título, URL, tags…"

  return (
    <header className="border-app-border bg-app-toolbar shrink-0 border-b px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="shrink-0">
          <h1 className="text-app-fg text-xl font-semibold tracking-tight">Marcadores</h1>
          <p className="text-app-fg-muted mt-0.5 text-sm">Tus enlaces, organizados</p>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-xl flex-1">
          <svg
            className="text-app-fg-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            placeholder={placeholder}
            data-no-vim
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={flush}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                flush()
                onEnter?.()
              }
            }}
            className={cn(
              "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-full border py-2.5 pr-4 pl-10 text-sm",
              "placeholder-app-fg-label focus:border-app-focus focus:ring-app-focus/20 focus:ring-2 focus:outline-none"
            )}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
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
                  viewMode === "grid"
                    ? "bg-app-primary text-white shadow-sm"
                    : "text-app-fg-muted hover:text-app-fg"
                )}
                title="Vista cuadrícula"
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
                  viewMode === "tree"
                    ? "bg-app-primary text-white shadow-sm"
                    : "text-app-fg-muted hover:text-app-fg"
                )}
                title="Vista árbol"
                onClick={() => viewMode !== "tree" && onToggleViewMode()}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M3 3h8v8H3V3zm10 0h8v4h-8V3zM3 13h8v8H3v-8zm10 4h8v4h-8v-4z" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex justify-center lg:justify-start lg:pl-[calc(50%-12rem)]">
        <ToolbarSearchOptions
          searchInSubfolders={searchInSubfolders}
          setSearchInSubfolders={setSearchInSubfolders}
          searchInDescription={searchInDescription}
          setSearchInDescription={setSearchInDescription}
        />
      </div>
    </header>
  )
}
