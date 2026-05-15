"use client"

import { useId } from "react"

import { cn, cnLines } from "@/lib/utils"
import { applyBookmarkDragPreview } from "../utils/bookmarkDragPreview"
import { BOOKMARK_DRAG_MIME_TYPE, parseBookmarkDragPayload } from "../utils/parseDragPayload"
import type { GridItem } from "../utils/types"
import { FolderContent, LinkContent } from "./bookmarkGrid/BookmarkGridItemBodies"

type Props = {
  item: GridItem
  idx: number
  isSelected: boolean
  isCut: boolean
  selectMode: boolean
  isChecked: boolean
  itemRef: (el: HTMLDivElement | null) => void
  onSelect: (idx: number) => void
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
  dropHighlight?: boolean
  onBookmarkDragHover?: () => void
  onBookmarkDragHoverLeave?: () => void
}

export default function BookmarkGridItem({
  item,
  idx,
  isSelected,
  isCut,
  selectMode,
  isChecked,
  itemRef,
  onSelect,
  onToggleSelect,
  onDoubleClick,
  onDrop,
  dropHighlight = false,
  onBookmarkDragHover,
  onBookmarkDragHoverLeave,
}: Props) {
  const selectControlId = useId()
  const isFolder = item.type === "folder"
  const targetFolderId = isFolder ? item.id : (item.bookmark.folder_id ?? null)

  const handleDragStart = (e: React.DragEvent) => {
    const payload = isFolder
      ? { type: "folder" as const, id: item.id, name: item.label }
      : { type: "link" as const, bookmark: { id: item.bookmark.id, url: item.bookmark.url } }
    e.dataTransfer.setData(BOOKMARK_DRAG_MIME_TYPE, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", isFolder ? item.label : item.bookmark.title)
    applyBookmarkDragPreview(e)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDrop) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    onBookmarkDragHover?.()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!onDrop || !onBookmarkDragHoverLeave) return
    const rt = e.relatedTarget as Node | null
    if (rt && e.currentTarget.contains(rt)) return
    onBookmarkDragHoverLeave()
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!onDrop) return
    e.preventDefault()
    e.stopPropagation()
    onBookmarkDragHoverLeave?.()
    const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
    if (!raw) return
    const sourceItem = parseBookmarkDragPayload(raw)
    if (sourceItem) onDrop(sourceItem, targetFolderId)
  }

  const activateFromKeyboard = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (selectMode && !isFolder) onToggleSelect(item.bookmark.id)
      else onSelect(idx)
    }
  }

  const dropFrameClass =
    dropHighlight && !isCut
      ? cnLines(
          "border-app-accent bg-app-accent/[0.07] outline outline-2 outline-offset-[-2px]",
          "outline-app-accent/85 ring-app-accent/30 ring-2 outline-dashed",
          "dark:bg-app-accent/[0.11] dark:outline-app-accent/70"
        )
      : undefined

  const baseClass = cn(
    "relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
    isCut ? "border-app-cut-border bg-app-cut-surface border-dashed opacity-60" : "",
    !isCut &&
      !dropHighlight &&
      (isSelected
        ? "border-app-focus bg-app-selection ring-app-focus ring-2"
        : cnLines(
            "border-app-border-muted bg-app-raised/80",
            "hover:border-app-input-border hover:bg-app-hover-strong/50"
          )),
    dropFrameClass,
    selectMode && !isFolder ? "cursor-pointer" : ""
  )

  return (
    <div
      ref={itemRef}
      data-bookmark-grid-item
      draggable
      role="button"
      tabIndex={0}
      aria-pressed={selectMode && !isFolder ? isChecked : undefined}
      className={cn(baseClass, "z-[1] cursor-grab active:cursor-grabbing")}
      onClick={() => {
        if (selectMode && !isFolder) onToggleSelect(item.bookmark.id)
        else onSelect(idx)
      }}
      onKeyDown={activateFromKeyboard}
      onDoubleClick={() => onDoubleClick(item)}
      onDragStart={handleDragStart}
      onDragOver={onDrop ? handleDragOver : undefined}
      onDragLeave={onDrop ? handleDragLeave : undefined}
      onDrop={onDrop ? handleDrop : undefined}
    >
      {selectMode && !isFolder && (
        <label className="absolute top-3 left-3 z-10" htmlFor={selectControlId} onClick={(e) => e.stopPropagation()}>
          <span className="sr-only">Seleccionar {item.bookmark.title}</span>
          <input
            id={selectControlId}
            type="checkbox"
            checked={isChecked}
            readOnly
            className="border-app-input-border bg-app-raised-muted accent-app-primary size-4 rounded"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(item.bookmark.id)
            }}
          />
        </label>
      )}
      {isFolder ? <FolderContent label={item.label} /> : <LinkContent bookmark={item.bookmark} locationLabel={item.locationLabel} />}
    </div>
  )
}
