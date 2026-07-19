"use client"

import { useId, useRef } from "react"

import { cn, cnLines } from "@/lib/utils"
import { FOCUS_RING_INSET, KEYBOARD_SELECTED } from "@/lib/focusStyles"
import { useBookmarkDraggable, useBookmarkDropTarget } from "@/lib/drag-and-drop"
import { gridItemSelectionId } from "../utils/selectionIds"
import type { FlatFolder, GridItem } from "../utils/types"
import { FolderContent, LinkContent, resolveFolderName } from "./bookmarkGrid/BookmarkGridItemBodies"

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
  searchQuery?: string
  searchInDescription?: boolean
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  folders?: FlatFolder[]
}

const EMPTY_FOLDERS: FlatFolder[] = []

function BookmarkGridItem({
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
  searchQuery = "",
  searchInDescription = true,
  onToggleFavorite,
  folders = EMPTY_FOLDERS,
}: Props) {
  const selectControlId = useId()
  const isFolder = item.type === "folder"
  const targetFolderId = isFolder ? item.id : (item.bookmark.folder_id ?? null)
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const setNodeRef = (el: HTMLDivElement | null) => {
    nodeRef.current = el
    itemRef(el)
  }

  useBookmarkDraggable(nodeRef, item)
  useBookmarkDropTarget({
    elementRef: nodeRef,
    enabled: Boolean(onDrop),
    targetFolderId,
    onDrop,
    onDragEnter: onBookmarkDragHover,
    onDragLeave: onBookmarkDragHoverLeave,
  })

  const selectionId = gridItemSelectionId(item)

  const activateFromKeyboard = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (selectMode) onToggleSelect(selectionId)
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
    "relative flex flex-col rounded-xl border p-4 transition-colors",
    isCut ? "border-app-cut-border bg-app-cut-surface border-dashed opacity-60" : "",
    !isCut &&
      !dropHighlight &&
      (isSelected
        ? KEYBOARD_SELECTED
        : cnLines("border-app-border bg-app-raised", "hover:border-app-input-border hover:shadow-sm")),
    dropFrameClass,
    selectMode ? "cursor-pointer" : ""
  )

  const selectLabel = isFolder ? item.label : item.bookmark.title

  return (
    <div
      ref={setNodeRef}
      data-bookmark-grid-item
      role="button"
      tabIndex={0}
      aria-pressed={selectMode ? isChecked : undefined}
      className={cn(baseClass, "z-[1] cursor-grab active:cursor-grabbing", !isSelected && FOCUS_RING_INSET)}
      onClick={() => {
        if (selectMode) onToggleSelect(selectionId)
        else onSelect(idx)
      }}
      onFocus={(e) => {
        if (e.target === e.currentTarget) onSelect(idx)
      }}
      onKeyDown={activateFromKeyboard}
      onDoubleClick={() => onDoubleClick(item)}
    >
      {selectMode && (
        <label className="absolute top-3 left-3 z-10" htmlFor={selectControlId} onClick={(e) => e.stopPropagation()}>
          <span className="sr-only">Seleccionar {selectLabel}</span>
          <input
            id={selectControlId}
            type="checkbox"
            checked={isChecked}
            readOnly
            className="border-app-input-border bg-app-raised-muted accent-app-primary size-4 rounded"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(selectionId)
            }}
          />
        </label>
      )}
      {isFolder ? (
        <FolderContent label={item.label} />
      ) : (
        <LinkContent
          bookmark={item.bookmark}
          locationLabel={item.locationLabel}
          searchQuery={searchQuery}
          searchInDescription={searchInDescription}
          folderName={resolveFolderName(folders, item.bookmark.folder_id)}
          onToggleFavorite={
            onToggleFavorite ? (isFavorite) => onToggleFavorite(item.bookmark.id, isFavorite) : undefined
          }
        />
      )}
    </div>
  )
}

export default BookmarkGridItem
