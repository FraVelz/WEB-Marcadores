"use client"

import { useId, useRef } from "react"

import { cn, cnLines } from "@/lib/utils"
import { FOCUS_RING_INSET, KEYBOARD_SELECTED } from "@/lib/focusStyles"
import { useBookmarkDraggable, useBookmarkDropTarget } from "@/lib/drag-and-drop"
import type { Bookmark, FlatFolder, GridItem } from "../../utils/types"
import { gridItemSelectionId } from "../../utils/selectionIds"
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
  searchQuery?: string
  searchInDescription?: boolean
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
  searchQuery = "",
  searchInDescription = true,
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
    onDragEnter: onDragHighlight,
    onDragLeave: onDragClearHighlight,
  })

  const hasKids = isFolder ? folderHasChildren(folders, bookmarks, item.id) : false
  const isExpanded = isFolder ? hasKids && !collapsedIds.has(item.id) : undefined
  const selectionId = gridItemSelectionId(item)
  const selectLabel = isFolder ? item.label : item.bookmark.title

  const activateFromKeyboard = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (selectMode) onToggleSelect(selectionId)
      else onSelect(idx)
      return
    }
    if (isFolder && hasKids && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault()
      const collapsed = collapsedIds.has(item.id)
      if (e.key === "ArrowRight" && collapsed) onToggleFolderCollapse(item.id)
      if (e.key === "ArrowLeft" && !collapsed) onToggleFolderCollapse(item.id)
    }
  }

  const baseClass = cn(
    "relative flex min-h-[44px] items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
    isCut ? "border-app-cut-border bg-app-cut-surface border-dashed opacity-60" : "",
    !isCut &&
      !dropActive &&
      (isSelected
        ? KEYBOARD_SELECTED
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
    selectMode ? "cursor-pointer" : "",
    "cursor-grab active:cursor-grabbing"
  )

  const padLeft = 8 + depth * 18

  return (
    <div
      ref={setNodeRef}
      role="treeitem"
      tabIndex={0}
      aria-level={depth + 1}
      aria-selected={isSelected}
      aria-expanded={isFolder ? (hasKids ? isExpanded : false) : undefined}
      style={{ paddingLeft: padLeft }}
      className={cn(baseClass, !isSelected && FOCUS_RING_INSET)}
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
        <label
          className="absolute top-2 z-10"
          style={{ left: padLeft }}
          htmlFor={selectControlId}
          onClick={(e) => e.stopPropagation()}
        >
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
      {item.type === "folder" ? (
        <TreeFolderRowContent
          item={item}
          hasKids={hasKids}
          collapsedIds={collapsedIds}
          onToggleFolderCollapse={onToggleFolderCollapse}
          padForCheckbox={selectMode}
        />
      ) : (
        <TreeLinkCell
          bookmark={item.bookmark}
          padForCheckbox={selectMode}
          searchQuery={searchQuery}
          searchInDescription={searchInDescription}
        />
      )}
    </div>
  )
}
