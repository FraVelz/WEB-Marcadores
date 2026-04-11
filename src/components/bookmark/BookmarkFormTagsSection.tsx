"use client"

import { useState, useEffect } from "react"
import TagAutocomplete from "@/components/TagAutocomplete"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (v: string) => void
  options: string[]
  tagInputRef?: React.MutableRefObject<string>
}

export default function BookmarkFormTagsSection({ value, onChange, options, tagInputRef }: Props) {
  const [tagInputValue, setTagInputValue] = useState("")

  useEffect(() => {
    if (tagInputRef) tagInputRef.current = tagInputValue
  }, [tagInputValue, tagInputRef])

  const handleSelectTag = (tag: string) => {
    const current = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    if (!current.includes(tag)) onChange([...current, tag].join(", "))
    setTagInputValue("")
  }

  const handleEnter = () => {
    const trimmed = tagInputValue.trim()
    if (trimmed) {
      const current = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      if (!current.includes(trimmed)) onChange([...current, trimmed].join(", "))
      setTagInputValue("")
    }
  }

  const currentTags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  const availableOptions = options.filter((t) => !currentTags.includes(t))

  return (
    <section className="space-y-4">
      <h3 className="text-app-fg-muted text-sm font-medium">Tags</h3>
      <div>
        <TagAutocomplete
          value={tagInputValue}
          onChange={setTagInputValue}
          options={availableOptions}
          onSelectTag={handleSelectTag}
          onEnter={handleEnter}
          placeholder="web, herramientas, ..."
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
      {value ? (
        <div className="flex flex-wrap gap-1">
          {value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} className="bg-app-hover text-app-fg-secondary inline-flex rounded px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
        </div>
      ) : null}
    </section>
  )
}
