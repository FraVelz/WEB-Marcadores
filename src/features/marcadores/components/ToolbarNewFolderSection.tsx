"use client"

import { cn } from "@/lib/utils"

type Props = {
  newFolderName: string
  setNewFolderName: (v: string) => void
  onCreateFolder: () => void
  onCancel: () => void
}

export default function ToolbarNewFolderSection({ newFolderName, setNewFolderName, onCreateFolder, onCancel }: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 md:ml-2">
      <input
        type="text"
        placeholder="Nombre de carpeta"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCreateFolder()
          if (e.key === "Escape") onCancel()
        }}
        className={cn(
          "border-app-input-border bg-app-raised-muted text-app-fg min-w-0 flex-1 rounded border px-2 py-1 text-sm",
          "placeholder-app-fg-label focus:border-app-focus focus:outline-none md:max-w-xs"
        )}
        autoFocus
      />
      <button
        onClick={onCreateFolder}
        className="bg-app-primary hover:bg-app-primary-hover rounded px-2 py-1 text-sm text-white"
      >
        Crear
      </button>
      <button onClick={onCancel} className="text-app-fg-muted hover:bg-app-active rounded px-2 py-1 text-sm">
        Cancelar
      </button>
    </div>
  )
}
