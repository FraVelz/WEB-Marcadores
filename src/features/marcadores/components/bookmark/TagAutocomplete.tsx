"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (v: string) => void
  options: string[]
  onEnter?: () => void
  onSelectTag?: (tag: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
  placeholder?: string
  className?: string
  id?: string
}

export default function TagAutocomplete({
  value,
  onChange,
  options,
  onEnter,
  onSelectTag,
  inputRef: externalRef,
  placeholder = "Etiqueta...",
  className = "",
  id,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const internalRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = externalRef || internalRef

  const filtered = (() => {
    const q = value.trim().toLowerCase()
    if (!q) return options
    return options.filter((t) => t.toLowerCase().includes(q))
  })()

  const maxIdx = filtered.length > 0 ? filtered.length - 1 : 0
  const effectiveIndex = Math.min(Math.max(0, highlightedIndex), maxIdx)

  useEffect(() => {
    if (effectiveIndex >= 0 && listRef.current) {
      listRef.current.children[effectiveIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [effectiveIndex])

  const selectTag = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag)
      onChange("")
    } else {
      onChange(tag)
    }
    setIsOpen(false)
    inputRef.current?.blur()
    onEnter?.()
  }

  const clampIndex = (i: number) => Math.min(Math.max(0, i), Math.max(0, filtered.length - 1))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault()
        onEnter?.()
      }
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      setHighlightedIndex((i) => {
        const cur = clampIndex(i)
        return e.shiftKey ? (cur - 1 + filtered.length) % filtered.length : (cur + 1) % filtered.length
      })
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => {
        const cur = clampIndex(i)
        return (cur + 1) % filtered.length
      })
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => {
        const cur = clampIndex(i)
        return (cur - 1 + filtered.length) % filtered.length
      })
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const tag = filtered[effectiveIndex]
      if (tag) selectTag(tag)
      return
    }
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
      return
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          setHighlightedIndex(0)
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        data-no-vim
        className={className}
      />
      {isOpen && filtered.length > 0 && (
        <ul
          id="tag-listbox"
          ref={listRef}
          className={cn(
            "absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg",
            "border-app-input-border bg-app-raised-muted border py-1 shadow-lg"
          )}
        >
          {filtered.map((tag, i) => (
            <li
              key={tag}
              id={`tag-opt-${i}`}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === effectiveIndex ? "bg-app-hover text-app-fg" : "text-app-fg-secondary hover:bg-app-hover"
              }`}
              onMouseEnter={() => setHighlightedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                selectTag(tag)
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
