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
      <h3 className="text-sm font-medium text-zinc-400">Tags</h3>
      <div>
        <TagAutocomplete
          value={tagInputValue}
          onChange={setTagInputValue}
          options={availableOptions}
          onSelectTag={handleSelectTag}
          onEnter={handleEnter}
          placeholder="web, herramientas, ..."
          className={cn(
            "w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white",
            "focus:border-blue-500 focus:outline-none"
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
              <span key={tag} className="inline-flex rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                {tag}
              </span>
            ))}
        </div>
      ) : null}
    </section>
  )
}
