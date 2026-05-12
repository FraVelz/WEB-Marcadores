"use client"

import { useState, useCallback } from "react"
import TagAutocomplete from "@/components/TagAutocomplete"
import { cn } from "@/lib/utils"
import { splitCommaTags } from "@/lib/comma-tags"

type Props = {
  value: string
  onChange: (v: string) => void
  options: string[]
  tagInputRef?: React.MutableRefObject<string>
}

export default function BookmarkFormTagsSection({ value, onChange, options, tagInputRef }: Props) {
  const [tagInputValue, setTagInputValue] = useState("")

  const syncDraftToRef = useCallback(
    (v: string) => {
      setTagInputValue(v)
      if (tagInputRef) tagInputRef.current = v
    },
    [tagInputRef]
  )

  const handleSelectTag = (tag: string) => {
    const current = splitCommaTags(value)
    if (!current.includes(tag)) onChange([...current, tag].join(", "))
    syncDraftToRef("")
  }

  const handleEnter = () => {
    const trimmed = tagInputValue.trim()
    if (trimmed) {
      const current = splitCommaTags(value)
      if (!current.includes(trimmed)) onChange([...current, trimmed].join(", "))
      syncDraftToRef("")
    }
  }

  const currentTags = splitCommaTags(value)
  const availableOptions = options.filter((t) => !currentTags.includes(t))

  const tagBadges =
    currentTags.length > 0
      ? currentTags.map((tag) => (
          <span key={tag} className="bg-app-hover text-app-fg-secondary inline-flex rounded px-2 py-0.5 text-xs">
            {tag}
          </span>
        ))
      : null

  return (
    <section className="space-y-4">
      <h3 className="text-app-fg-muted text-sm font-medium">Tags</h3>
      <div>
        <TagAutocomplete
          value={tagInputValue}
          onChange={syncDraftToRef}
          options={availableOptions}
          onSelectTag={handleSelectTag}
          onEnter={handleEnter}
          placeholder="web, herramientas, …"
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
      {tagBadges ? <div className="flex flex-wrap gap-1">{tagBadges}</div> : null}
    </section>
  )
}
