"use client"

import TagAutocomplete from "@/components/TagAutocomplete"
import { cn } from "@/lib/utils"

type Props = {
  tags: string[]
  newTag: string
  onNewTagChange: (v: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  allTags: string[]
  saving: boolean
}

export default function BookmarkDetailTagsSection({
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  allTags,
  saving,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-500">Tags</label>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="group inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              disabled={saving}
              className="rounded hover:bg-zinc-600 hover:text-white disabled:opacity-50"
              aria-label={`Quitar ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2">
        <TagAutocomplete
          value={newTag}
          onChange={onNewTagChange}
          options={allTags.filter((t) => !tags.includes(t))}
          onSelectTag={(tag) => onAddTag(tag)}
          onEnter={() => newTag.trim() && onAddTag(newTag)}
          placeholder="Añadir tag..."
          className={cn(
            "w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white",
            "placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          )}
        />
      </div>
    </div>
  )
}
