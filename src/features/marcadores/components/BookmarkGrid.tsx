"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import type { GridItem, CutItem } from "../utils/types"
import { APP_DROP_PANEL_OVERLAY_CLASS } from "../utils/dragDropUi"
import { BOOKMARK_DRAG_MIME_TYPE, isBookmarkDragTransfer, parseBookmarkDragPayload } from "../utils/parseDragPayload"
import BookmarkGridItem from "./BookmarkGridItem"

type Props = {
  flatList: GridItem[]
  selectedIndex: number
  selectMode: boolean
  selectedIds: Set<string>
  cutItem: CutItem | null
  onSelectIndex: (idx: number) => void
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
  onAddBookmark: () => void
  onNewFolder: () => void
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
}

export default function BookmarkGrid({
  flatList,
  selectedIndex,
  selectMode,
  selectedIds,
  cutItem,
  onSelectIndex,
  onToggleSelect,
  onDoubleClick,
  onDrop,
  onAddBookmark,
  onNewFolder,
  itemRefs,
}: Props) {
  const [dropPanelSlot, setDropPanelSlot] = useState(false)
  const [dropItemIdx, setDropItemIdx] = useState<number | null>(null)

  const clearDropUi = () => {
    setDropPanelSlot(false)
    setDropItemIdx(null)
  }

  useEffect(() => {
    window.addEventListener("dragend", clearDropUi)
    return () => window.removeEventListener("dragend", clearDropUi)
  }, [])

  const panelDragOver =
    onDrop &&
    ((e: React.DragEvent) => {
      if (!isBookmarkDragTransfer(e.dataTransfer)) return
      if (e.target !== e.currentTarget) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropPanelSlot(true)
      setDropItemIdx(null)
    })

  const panelDragLeave =
    onDrop &&
    ((e: React.DragEvent) => {
      const rt = e.relatedTarget as Node | null
      if (rt && e.currentTarget.contains(rt)) return
      setDropPanelSlot(false)
      setDropItemIdx(null)
    })

  const panelDrop =
    onDrop &&
    ((e: React.DragEvent) => {
      if (e.target !== e.currentTarget) return
      e.preventDefault()
      clearDropUi()
      const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
      if (!raw) return
      const sourceItem = parseBookmarkDragPayload(raw)
      if (sourceItem) onDrop(sourceItem, undefined)
    })

  const showAppPanelDropFrame = Boolean(onDrop && dropPanelSlot && dropItemIdx === null)

  return (
    <div
      className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4"
      onDragLeave={panelDragLeave || undefined}
      onDragOver={panelDragOver || undefined}
      onDrop={panelDrop || undefined}
    >
      {showAppPanelDropFrame ? <div className={APP_DROP_PANEL_OVERLAY_CLASS} aria-hidden /> : null}
      <div
        className="relative grid min-h-[120px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        onDragLeave={panelDragLeave || undefined}
        onDragOver={panelDragOver || undefined}
        onDrop={panelDrop || undefined}
      >
        {flatList.map((item, idx) => {
          const isFolder = item.type === "folder"
          const isCut =
            cutItem &&
            ((isFolder && cutItem.type === "folder" && cutItem.id === item.id) ||
              (!isFolder && cutItem.type === "link" && cutItem.bookmark.id === item.bookmark.id))
          return (
            <BookmarkGridItem
              key={isFolder ? item.id : item.bookmark.id}
              item={item}
              idx={idx}
              isSelected={idx === selectedIndex}
              isCut={!!isCut}
              selectMode={selectMode}
              isChecked={!isFolder && selectedIds.has(item.bookmark.id)}
              dropHighlight={dropItemIdx === idx}
              itemRef={(el) => {
                if (el) itemRefs.current.set(idx, el)
              }}
              onSelect={onSelectIndex}
              onToggleSelect={onToggleSelect}
              onDoubleClick={onDoubleClick}
              onDrop={onDrop}
              onBookmarkDragHover={
                onDrop
                  ? () => {
                      setDropItemIdx(idx)
                      setDropPanelSlot(false)
                    }
                  : undefined
              }
              onBookmarkDragHoverLeave={
                onDrop
                  ? () => {
                      setDropItemIdx((prev) => (prev === idx ? null : prev))
                    }
                  : undefined
              }
            />
          )
        })}
      </div>
      {flatList.length === 0 && <EmptyState onAddBookmark={onAddBookmark} onNewFolder={onNewFolder} />}
    </div>
  )
}

function EmptyState({ onAddBookmark, onNewFolder }: { onAddBookmark: () => void; onNewFolder: () => void }) {
  return (
    <div className="text-app-fg-label flex flex-col items-center justify-center py-16">
      <svg className="text-app-empty-icon mb-4 size-16" viewBox="0 0 24 24" fill="currentColor">
        <path
          d={
            "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2" +
            "zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
          }
        />
      </svg>
      <p className="text-sm">Esta carpeta está vacía</p>
      <button
        onClick={onAddBookmark}
        className="bg-app-primary hover:bg-app-primary-hover mt-2 rounded px-4 py-2 text-sm text-white"
      >
        Agregar marcador
      </button>
      <button
        onClick={onNewFolder}
        className={cn(
          "border-app-input-border text-app-fg-secondary mt-2 rounded border px-4 py-2 text-sm",
          "hover:bg-app-raised-muted"
        )}
      >
        Nueva carpeta
      </button>
    </div>
  )
}
