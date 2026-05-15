"use client"

import { cnLines } from "@/lib/utils"
import { BOOKMARK_DRAG_MIME_TYPE, parseBookmarkDragPayload } from "../../utils/parseDragPayload"
import type { GridItem } from "../../utils/types"

type Props = {
  dropActive: boolean
  onDragHighlight: () => void
  onDragClearHighlight: () => void
  onDrop: (sourceItem: GridItem) => void
}

export function TreeRootDropRow({ dropActive, onDragHighlight, onDragClearHighlight, onDrop }: Props) {
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if ([...e.dataTransfer.types].includes(BOOKMARK_DRAG_MIME_TYPE)) onDragHighlight()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    onDragHighlight()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rt = e.relatedTarget as Node | null
    if (rt && e.currentTarget.contains(rt)) return
    onDragClearHighlight()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDragClearHighlight()
    const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
    if (!raw) return
    const sourceItem = parseBookmarkDragPayload(raw)
    if (sourceItem) onDrop(sourceItem)
  }

  return (
    <div
      className={cnLines(
        "mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-left text-sm transition-colors",
        dropActive
          ? cnLines(
              "border-app-accent bg-app-accent/[0.08] text-app-fg outline-dashed",
              "outline-app-accent/80 ring-app-accent/25 ring-2 outline-2 outline-offset-[-2px]",
              "dark:bg-app-accent/[0.11]"
            )
          : cnLines(
              "border-app-border-muted bg-app-raised-muted/40 text-app-fg-secondary",
              "hover:border-app-input-border hover:bg-app-hover-strong/40"
            )
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg className="text-app-accent size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path
          d={
            "M3 3h8v2H3V3zm0 4h8v2H3V7zm0 4h8v2H3v-2zm0 4h8v2H3v-2z" +
            "m10-8h8v2h-8V3zm0 4h8v2h-8V7zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2z"
          }
        />
      </svg>
      <span className="text-app-fg truncate font-medium">Raíz</span>
      <span className="text-app-fg-label ml-auto shrink-0 text-xs">Soltar aquí → raíz</span>
    </div>
  )
}
