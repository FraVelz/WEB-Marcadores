"use client"

import { cn } from "@/lib/utils"

type FolderOption = { id: string; label: string }

type Props = {
  folderId: string
  folderOptions: FolderOption[]
  onChange: (id: string) => void
}

export default function BookmarkFormFolderSelect({ folderId, folderOptions, onChange }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-app-fg-muted text-sm font-medium">Carpeta</h3>
      <div>
        <label htmlFor="bm-modal-folder" className="text-app-fg-label mb-1 block text-xs">
          Ubicación
        </label>
        <select
          id="bm-modal-folder"
          value={folderId}
          onChange={(e) => onChange(e.target.value)}
          data-no-vim
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "focus:border-app-focus focus:outline-none"
          )}
        >
          <option value="">Raíz (Marcadores)</option>
          {folderOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
