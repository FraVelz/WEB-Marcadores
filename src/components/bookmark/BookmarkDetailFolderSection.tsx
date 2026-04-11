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
      <label className="text-app-fg-label mb-1 block text-xs">Carpeta actual</label>
      <p className="text-app-fg-secondary text-sm">{currentFolderPath}</p>
      {folderOptions.length > 0 && (
        <div className="mt-2 flex gap-2">
          <select
            value={moveFolderId}
            onChange={(e) => onMoveFolderIdChange(e.target.value)}
            className={cn(
              "border-app-input-border bg-app-raised-muted text-app-fg flex-1 rounded border px-2 py-1 text-sm",
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
          <button
            type="button"
            onClick={onMove}
            disabled={saving || moveFolderId === (bookmarkFolderId || "")}
            className="bg-app-hover text-app-fg hover:bg-app-active rounded px-2 py-1 text-xs disabled:opacity-50"
          >
            Mover
          </button>
        </div>
      )}
    </div>
  )
}
