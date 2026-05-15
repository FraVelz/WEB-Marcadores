"use client"

import { useId } from "react"

import { cn, cnLines } from "@/lib/utils"

import { applyBookmarkDragPreview } from "../../utils/bookmarkDragPreview"
import { BOOKMARK_DRAG_MIME_TYPE, parseBookmarkDragPayload } from "../../utils/parseDragPayload"
import type { Bookmark, FlatFolder, GridItem } from "../../utils/types"
import { TreeFolderRowContent } from "./TreeFolderRowContent"
import { folderHasChildren } from "./treeHelpers"
import { TreeLinkCell } from "./TreeLinkCell"

type Props = {
  folders: FlatFolder[]
  bookmarks: Bookmark[]
  item: GridItem
  depth: number
  idx: number
  isSelected: boolean
  isCut: boolean
  dropActive: boolean
  onDragHighlight: () => void
  onDragClearHighlight: () => void
  selectMode: boolean
  isChecked: boolean
  itemRef: (el: HTMLDivElement | null) => void
  collapsedIds: Set<string>
  onToggleFolderCollapse: (folderId: string) => void
  onSelect: (idx: number) => void
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
}

export function TreeRow({
  folders,
  bookmarks,
  item,
  depth,
  idx,
  isSelected,
  isCut,
  dropActive,
  onDragHighlight,
  onDragClearHighlight,
  selectMode,
  isChecked,
  itemRef,
  collapsedIds,
  onToggleFolderCollapse,
  onSelect,
  onToggleSelect,
  onDoubleClick,
  onDrop,
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

  const handleDragEnter = (e: React.DragEvent) => {
    if (!onDrop) return
    e.preventDefault()
    e.stopPropagation()
    if ([...e.dataTransfer.types].includes(BOOKMARK_DRAG_MIME_TYPE)) onDragHighlight()
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDrop) return
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
    if (!onDrop) return
    e.preventDefault()
    e.stopPropagation()
    onDragClearHighlight()
    const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
    if (!raw) return
    const sourceItem = parseBookmarkDragPayload(raw)
    if (sourceItem) onDrop(sourceItem, targetFolderId)
  }

  const activateFromKeyboard = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!isFolder && selectMode) onToggleSelect(item.bookmark.id)
      else onSelect(idx)
    }
  }

  const baseClass = cn(
    "relative flex min-h-[44px] items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
    isCut ? "border-app-cut-border bg-app-cut-surface border-dashed opacity-60" : "",
    !isCut &&
      !dropActive &&
      (isSelected
        ? "border-app-focus bg-app-selection ring-app-focus ring-2"
        : cnLines(
            "border-app-border-muted bg-app-raised/80",
            "hover:border-app-input-border hover:bg-app-hover-strong/50"
          )),
    !isCut &&
      dropActive &&
      cnLines(
        "border-app-accent bg-app-accent/[0.08]",
        "ring-app-accent/25 outline-app-accent/85 ring-2 outline outline-2 outline-offset-[-2px] outline-dashed",
        "dark:bg-app-accent/[0.11]"
      ),
    selectMode && !isFolder ? "cursor-pointer" : "",
    "cursor-grab active:cursor-grabbing"
  )

  const padLeft = 8 + depth * 18

  return (
    <div
      ref={itemRef}
      draggable
      role="button"
      tabIndex={0}
      aria-pressed={selectMode && !isFolder ? isChecked : undefined}
      style={{ paddingLeft: padLeft }}
      className={baseClass}
      onClick={() => {
        if (!isFolder && selectMode) onToggleSelect(item.bookmark.id)
        else onSelect(idx)
      }}
      onKeyDown={activateFromKeyboard}
      onDoubleClick={() => onDoubleClick(item)}
      onDragStart={handleDragStart}
      onDragEnter={onDrop ? handleDragEnter : undefined}
      onDragOver={onDrop ? handleDragOver : undefined}
      onDragLeave={onDrop ? handleDragLeave : undefined}
      onDrop={onDrop ? handleDrop : undefined}
    >
      {selectMode && !isFolder && (
        <label
          className="absolute top-2 z-10"
          style={{ left: padLeft }}
          htmlFor={selectControlId}
          onClick={(e) => e.stopPropagation()}
        >
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
      {item.type === "folder" ? (
        <TreeFolderRowContent
          item={item}
          hasKids={folderHasChildren(folders, bookmarks, item.id)}
          collapsedIds={collapsedIds}
          onToggleFolderCollapse={onToggleFolderCollapse}
        />
      ) : (
        <TreeLinkCell bookmark={item.bookmark} padForCheckbox={selectMode} />
      )}
    </div>
  )
}
