"use client"

import { cn } from "@/lib/utils"

import { useDebouncedSearchInput } from "@/features/marcadores/hooks/useDebouncedSearchInput"
import ToolbarSearchOptions from "./ToolbarSearchOptions"

type Props = {
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  searchInSubfolders: boolean
  setSearchInSubfolders: (v: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (v: boolean) => void
  onEnter?: () => void
}

export default function ToolbarSearchSection({
  searchValue,
  setSearchValue,
  searchRef,
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
  onEnter,
}: Props) {
  const { draft, setDraft, flush } = useDebouncedSearchInput({
    query: searchValue,
    onQueryChange: setSearchValue,
  })

  const placeholder = searchInDescription ? "Buscar en título, descripción, URL, tags…" : "Buscar en título, URL, tags…"

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row md:items-start md:gap-4">
      <input
        ref={searchRef}
        type="text"
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
          "border-app-input-border bg-app-raised-muted text-app-fg w-full min-w-0 rounded border px-2 py-1 text-sm md:flex-1",
          "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
        )}
      />
      <ToolbarSearchOptions
        searchInSubfolders={searchInSubfolders}
        setSearchInSubfolders={setSearchInSubfolders}
        searchInDescription={searchInDescription}
        setSearchInDescription={setSearchInDescription}
      />
    </div>
  )
}
