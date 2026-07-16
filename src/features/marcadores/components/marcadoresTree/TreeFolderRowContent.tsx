"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

import type { GridItem } from "../../utils/types"

export function TreeFolderRowContent({
  item,
  hasKids,
  collapsedIds,
  onToggleFolderCollapse,
}: {
  item: Extract<GridItem, { type: "folder" }>
  hasKids: boolean
  collapsedIds: Set<string>
  onToggleFolderCollapse: (folderId: string) => void
}) {
  return (
    <>
      <button
        type="button"
        className={cn(
          "text-app-fg-label flex size-7 shrink-0 items-center justify-center rounded text-xs",
          FOCUS_RING_ICON_BTN,
          !hasKids && "pointer-events-none invisible"
        )}
        aria-label={collapsedIds.has(item.id) ? "Expandir carpeta" : "Contraer carpeta"}
        aria-expanded={hasKids ? !collapsedIds.has(item.id) : undefined}
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFolderCollapse(item.id)
        }}
      >
        {hasKids ? (collapsedIds.has(item.id) ? "▶" : "▼") : " "}
      </button>
      <div className="flex size-8 shrink-0 items-center justify-center rounded">
        <svg className="text-app-folder size-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 py-1">
        <span className="text-app-fg font-medium">{item.label}</span>
        <p className="text-app-fg-label text-xs">Carpeta</p>
      </div>
    </>
  )
}
