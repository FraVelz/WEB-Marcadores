"use client"

import { cn } from "@/lib/utils"

import { useDebouncedSearchInput } from "@/features/marcadores/hooks/useDebouncedSearchInput"
import { ToolbarSearchFilterChips, ToolbarSearchFilterMenu } from "./ToolbarSearchOptions"

type Props = {
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  searchInSubfolders: boolean
  setSearchInSubfolders: (v: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (v: boolean) => void
  onEnter?: () => void
  variant?: "pill" | "compact"
  chipsClassName?: string
}

export function MarcadoresSearchField({
  searchValue,
  setSearchValue,
  searchRef,
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
  onEnter,
  variant = "pill",
  chipsClassName,
}: Props) {
  const { draft, setDraft, flush } = useDebouncedSearchInput({
    query: searchValue,
    onQueryChange: setSearchValue,
  })

  const placeholder = searchInDescription ? "Buscar en título, descripción, URL, tags…" : "Buscar en título, URL, tags…"
  const hasQuery = draft.trim() !== ""
  const isPill = variant === "pill"

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="relative w-full min-w-0 overflow-visible">
        {isPill ? (
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
        ) : null}

        <input
          ref={searchRef}
          type={isPill ? "search" : "text"}
          placeholder={placeholder}
          aria-label={placeholder}
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
            "border-app-input-border bg-app-raised-muted text-app-fg w-full min-w-0 border text-sm",
            "placeholder-app-fg-label focus:border-app-focus focus:outline-none",
            isPill ? "focus:ring-app-focus/20 rounded-full py-2.5 pr-11 pl-10 focus:ring-2" : "rounded py-1 pr-9 pl-2"
          )}
        />

        <div className={cn("absolute top-1/2 -translate-y-1/2", isPill ? "right-2" : "right-1")}>
          <ToolbarSearchFilterMenu
            variant={variant}
            searchInSubfolders={searchInSubfolders}
            setSearchInSubfolders={setSearchInSubfolders}
            searchInDescription={searchInDescription}
            setSearchInDescription={setSearchInDescription}
          />
        </div>
      </div>

      <ToolbarSearchFilterChips
        hasQuery={hasQuery}
        searchInSubfolders={searchInSubfolders}
        searchInDescription={searchInDescription}
        className={chipsClassName}
      />
    </div>
  )
}
