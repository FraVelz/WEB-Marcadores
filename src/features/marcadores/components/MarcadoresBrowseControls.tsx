"use client"

import { useId } from "react"

type Props = {
  searchLibraryWide: boolean
  setSearchLibraryWide: React.Dispatch<React.SetStateAction<boolean>>
}

/** Controles de exploración en ventanas del escritorio (búsqueda global en biblioteca). */
export default function MarcadoresBrowseControls({ searchLibraryWide, setSearchLibraryWide }: Props) {
  const deskSearchWideLibId = useId()

  return (
    <div className="border-app-border-muted bg-app-toolbar/40 border-b p-2">
      <label
        htmlFor={deskSearchWideLibId}
        aria-label="Buscar en toda la biblioteca"
        className="text-app-fg-secondary flex cursor-pointer items-center gap-2 text-xs"
      >
        <input
          id={deskSearchWideLibId}
          type="checkbox"
          className="border-app-input-border bg-app-raised-muted accent-app-primary size-3.5 shrink-0 rounded"
          checked={searchLibraryWide}
          onChange={(e) => setSearchLibraryWide(e.target.checked)}
        />
        <span>
          <span className="text-app-fg font-medium">Buscar en toda la biblioteca</span>
          <span className="text-app-fg-muted mt-0.5 block text-[11px] font-normal">
            Con texto en la búsqueda, muestra coincidencias en cualquier carpeta y la ruta debajo de cada marcador.
          </span>
        </span>
      </label>
    </div>
  )
}
