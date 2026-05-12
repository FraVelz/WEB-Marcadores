"use client"

import { cn } from "@/lib/utils"

type FolderOption = { id: string; label: string }

type Props = {
  currentFolderPath: string
  folderOptions: FolderOption[]
  moveFolderId: string
  onMoveFolderIdChange: (id: string) => void
  onMove: () => void
  saving: boolean
  bookmarkFolderId: string | null
}

export default function BookmarkDetailFolderSection({
  currentFolderPath,
  folderOptions,
  moveFolderId,
  onMoveFolderIdChange,
  onMove,
  saving,
  bookmarkFolderId,
}: Props) {
  return (
    <div>
      <div className="text-app-fg-label mb-1 text-xs font-medium">Carpeta actual</div>
      <p className="text-app-fg-secondary text-sm">{currentFolderPath}</p>
      {folderOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="bookmark-detail-move-folder" className="sr-only">
              Elegir carpeta de destino
            </label>
            <select
              id="bookmark-detail-move-folder"
              value={moveFolderId}
              onChange={(e) => onMoveFolderIdChange(e.target.value)}
              className={cn(
                "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded border px-2 py-1 text-sm",
                "focus:border-app-focus focus:outline-none"
              )}
            >
              <option value="">Raíz</option>
              {folderOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onMove}
            disabled={saving || moveFolderId === (bookmarkFolderId || "")}
            className="bg-app-hover text-app-fg hover:bg-app-active shrink-0 rounded px-2 py-1 text-xs disabled:opacity-50"
          >
            Mover
          </button>
        </div>
      )}
    </div>
  )
}
