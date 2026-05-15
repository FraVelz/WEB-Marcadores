"use client"

import { useMemo } from "react"

import { compileView } from "../views/applyFilter"
import { deriveBookmarkFields } from "../views/bookmarkDerived"
import { EMPTY_VIEW_AST } from "../views/viewTypes"

import BookmarkGridItem from "./BookmarkGridItem"
import type { Bookmark, CutItem, GridItem } from "../utils/types"
import type { WorkspaceZoneColumn } from "../workspaces/workspaceLayout"

type LinkGridItem = Extract<GridItem, { type: "link" }>

type Props = {
  pool: Bookmark[]
  columns: WorkspaceZoneColumn[]
  onColumnsReorder: (next: WorkspaceZoneColumn[]) => void
  selectMode: boolean
  selectedIds: Set<string>
  cutItem: CutItem | null
  dragDropEnabled?: boolean

  onOpenBookmark: (b: Bookmark) => void

  /** Multi-select bookkeeping */
  onToggleSelect: (id: string) => void
}

/** Pool already excludes archived bookmarks and applies global text search upstream. */

export default function MarcadoresZoneBoard(props: Props) {
  const {
    pool,
    columns,
    onColumnsReorder,
    selectMode,
    selectedIds,
    cutItem,
    dragDropEnabled,
    onOpenBookmark,
    onToggleSelect,
  } = props
  const dndCols = dragDropEnabled !== false

  const buckets = useMemo(() => {
    return columns.map((col) => {
      const vue = compileView(col.filter ?? EMPTY_VIEW_AST)
      const items = pool
        .filter((b) => vue.match(b, deriveBookmarkFields(b)))
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))

      const gridItems: LinkGridItem[] = items.map((b) => ({ type: "link" as const, bookmark: b }))
      return { col, gridItems }
    })
  }, [pool, columns])

  const onDragColumnStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/workspace-column-id", id)
  }

  const onDropReorder = (targetId: string, e: React.DragEvent) => {
    e.preventDefault()
    const dragged = e.dataTransfer.getData("text/workspace-column-id")
    if (!dragged || dragged === targetId) return
    const next = [...columns]
    const from = next.findIndex((c) => c.id === dragged)
    const to = next.findIndex((c) => c.id === targetId)
    if (from === -1 || to === -1) return
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    onColumnsReorder(next)
  }

  return (
    <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto overflow-y-hidden pb-2">
      {buckets.map(({ col, gridItems }) => (
        <div
          key={col.id}
          className="bg-app-toolbar/70 border-app-border-muted flex max-h-none min-h-0 min-w-[220px] flex-1 flex-col rounded-lg border"
          onDragOver={(e) => {
            if (!dndCols) return
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
          }}
          onDrop={(e) => {
            if (!dndCols) return
            onDropReorder(col.id, e)
          }}
        >
          <div
            draggable={dndCols}
            onDragStart={(e) => onDragColumnStart(e, col.id)}
            className="border-app-border-muted border-b px-3 py-2"
          >
            <div className="text-app-fg flex items-center justify-between gap-2 text-xs font-semibold tracking-wide uppercase">
              <span className="truncate">{col.title}</span>
              <span className="text-app-fg-muted shrink-0 text-[11px] font-normal tracking-normal lowercase">
                {gridItems.length}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
            {gridItems.length === 0 ? (
              <div className="text-app-fg-muted px-2 py-4 text-center text-sm">Sin elementos</div>
            ) : (
              gridItems.map((item, idx) => (
                <BookmarkGridItem
                  key={item.bookmark.id}
                  item={item}
                  idx={idx}
                  isSelected={false}
                  isCut={!!(cutItem?.type === "link" && cutItem.bookmark.id === item.bookmark.id)}
                  selectMode={selectMode}
                  isChecked={selectedIds.has(item.bookmark.id)}
                  itemRef={() => {}}
                  onSelect={(clickedIdx) => {
                    const gi = gridItems[clickedIdx]
                    if (!gi) return
                    if (selectMode) onToggleSelect(gi.bookmark.id)
                    else onOpenBookmark(gi.bookmark)
                  }}
                  onToggleSelect={onToggleSelect}
                  onDoubleClick={(gi) => {
                    if (gi.type !== "link") return
                    onOpenBookmark(gi.bookmark)
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
