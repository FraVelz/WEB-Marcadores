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
      <label className="mb-1 block text-xs text-zinc-500">Carpeta actual</label>
      <p className="text-sm text-zinc-300">{currentFolderPath}</p>
      {folderOptions.length > 0 && (
        <div className="mt-2 flex gap-2">
          <select
            value={moveFolderId}
            onChange={(e) => onMoveFolderIdChange(e.target.value)}
            className={cn(
              "flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white",
              "focus:border-blue-500 focus:outline-none"
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
            className="rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600 disabled:opacity-50"
          >
            Mover
          </button>
        </div>
      )}
    </div>
  )
}
