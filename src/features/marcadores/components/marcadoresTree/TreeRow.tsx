"use client"

import { useCallback, useId, useRef } from "react"

import { cn, cnLines } from "@/lib/utils"
import { useBookmarkDraggable, useBookmarkDropTarget } from "@/lib/drag-and-drop"
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

  const setNodeRef = useCallback(
    (el: HTMLDivElement | null) => {
      nodeRef.current = el
      itemRef(el)
    },
    [itemRef]
  )

  useBookmarkDraggable(nodeRef, item)
  useBookmarkDropTarget({
    elementRef: nodeRef,
    enabled: Boolean(onDrop),
    targetFolderId,
    onDrop,
    onDragEnter: onDragHighlight,
    onDragLeave: onDragClearHighlight,
  })

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
      ref={setNodeRef}
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
