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
      <label className="text-app-fg-label mb-2 block text-xs">Tags</label>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="group bg-app-hover text-app-fg-secondary inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              disabled={saving}
              className="hover:bg-app-active hover:text-app-fg rounded disabled:opacity-50"
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
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2 text-sm",
            "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
    </div>
  )
}
