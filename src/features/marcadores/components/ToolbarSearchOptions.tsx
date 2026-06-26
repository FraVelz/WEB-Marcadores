"use client"

import { useId } from "react"

type Props = {
  searchInSubfolders: boolean
  setSearchInSubfolders: (value: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (value: boolean) => void
}

export default function ToolbarSearchOptions({
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
}: Props) {
  const subfoldersId = useId()
  const descriptionId = useId()

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-4 md:pt-0.5">
      <label htmlFor={subfoldersId} className="text-app-fg-secondary flex cursor-pointer items-start gap-2 text-xs">
        <input
          id={subfoldersId}
          type="checkbox"
          className="border-app-input-border bg-app-raised-muted accent-app-primary mt-0.5 size-3.5 shrink-0 rounded"
          checked={searchInSubfolders}
          onChange={(e) => setSearchInSubfolders(e.target.checked)}
        />
        <span>
          <span className="text-app-fg font-medium">Buscar en subcarpetas</span>
          <span className="text-app-fg-muted mt-0.5 block text-[11px] font-normal">
            Incluye carpetas hijas; en la raíz busca en toda la biblioteca.
          </span>
        </span>
      </label>

      <label htmlFor={descriptionId} className="text-app-fg-secondary flex cursor-pointer items-center gap-2 text-xs">
        <input
          id={descriptionId}
          type="checkbox"
          className="border-app-input-border bg-app-raised-muted accent-app-primary size-3.5 shrink-0 rounded"
          checked={searchInDescription}
          onChange={(e) => setSearchInDescription(e.target.checked)}
        />
        <span className="text-app-fg font-medium">Buscar en descripción</span>
      </label>
    </div>
  )
}
