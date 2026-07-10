"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

type Props = {
  folderName: string
  setFolderName: (v: string) => void
  onRename: () => void
  onCancel: () => void
}

export default function ToolbarRenameFolderSection({ folderName, setFolderName, onRename, onCancel }: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 md:ml-2">
      <input
        type="text"
        placeholder="Nuevo nombre"
        aria-label="Nuevo nombre"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onRename()
          if (e.key === "Escape") onCancel()
        }}
        className={cn(
          "border-app-input-border bg-app-raised-muted text-app-fg min-w-0 flex-1 rounded border px-2 py-1 text-sm",
          "placeholder-app-fg-label focus:border-app-focus focus:outline-none md:max-w-xs"
        )}
      />
      <button
        type="button"
        onClick={onRename}
        className={cn("bg-app-primary hover:bg-app-primary-hover rounded px-2 py-1 text-sm text-white", FOCUS_RING)}
      >
        Renombrar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={cn("text-app-fg-muted hover:bg-app-active rounded px-2 py-1 text-sm", FOCUS_RING)}
      >
        Cancelar
      </button>
    </div>
  )
}
