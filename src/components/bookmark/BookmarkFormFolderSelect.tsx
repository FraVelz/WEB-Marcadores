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
      <h3 className="text-sm font-medium text-zinc-400">Carpeta</h3>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Ubicación</label>
        <select
          value={folderId}
          onChange={(e) => onChange(e.target.value)}
          data-no-vim
          className={cn(
            "w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white",
            "focus:border-blue-500 focus:outline-none"
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
