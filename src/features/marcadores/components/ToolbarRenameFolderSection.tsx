"use client"

import { cn } from "@/lib/utils"

type Props = {
  folderName: string
  setFolderName: (v: string) => void
  onRename: () => void
  onCancel: () => void
}

export default function ToolbarRenameFolderSection({ folderName, setFolderName, onRename, onCancel }: Props) {
  return (
    <div className="ml-2 flex items-center gap-2">
      <input
        type="text"
        placeholder="Nuevo nombre"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onRename()
          if (e.key === "Escape") onCancel()
        }}
        className={cn(
          "border-app-input-border bg-app-raised-muted text-app-fg rounded border px-2 py-1 text-sm",
          "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
        )}
        autoFocus
      />
      <button
        onClick={onRename}
        className="bg-app-primary hover:bg-app-primary-hover rounded px-2 py-1 text-sm text-white"
      >
        Renombrar
      </button>
      <button onClick={onCancel} className="text-app-fg-muted hover:bg-app-active rounded px-2 py-1 text-sm">
        Cancelar
      </button>
    </div>
  )
}
