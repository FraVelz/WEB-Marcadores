"use client"

import { cn } from "@/lib/utils"

type Props = {
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  onEnter?: () => void
}

export default function ToolbarSearchSection({ searchValue, setSearchValue, searchRef, onEnter }: Props) {
  return (
    <div className="ml-2 flex flex-1 items-center gap-2">
      <input
        ref={searchRef}
        type="text"
        placeholder="Buscar en título, descripción, URL, tags..."
        data-no-vim
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onEnter?.()
          }
        }}
        className={cn(
          "border-app-input-border bg-app-raised-muted text-app-fg flex-1 rounded border px-2 py-1 text-sm",
          "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
        )}
      />
    </div>
  )
}
