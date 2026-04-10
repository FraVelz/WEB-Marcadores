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
    <div className="ml-2 flex items-center gap-2">
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
          "rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white",
          "placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        )}
        autoFocus
      />
      <button onClick={onCreateFolder} className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700">
        Crear
      </button>
      <button onClick={onCancel} className="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-600">
        Cancelar
      </button>
    </div>
  )
}
