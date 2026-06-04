"use client"

import { useRef } from "react"

import { cnLines } from "@/lib/utils"
import { useBookmarkDropTarget } from "@/lib/drag-and-drop"
import type { GridItem } from "../../utils/types"

type Props = {
  dropActive: boolean
  onDragHighlight: () => void
  onDragClearHighlight: () => void
  onDrop: (sourceItem: GridItem) => void
}

export function TreeRootDropRow({ dropActive, onDragHighlight, onDragClearHighlight, onDrop }: Props) {
  const nodeRef = useRef<HTMLDivElement | null>(null)

  useBookmarkDropTarget({
    elementRef: nodeRef,
    targetFolderId: null,
    onDrop: (source) => onDrop(source),
    onDragEnter: onDragHighlight,
    onDragLeave: onDragClearHighlight,
  })

  return (
    <div
      ref={nodeRef}
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
