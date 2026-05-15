"use client"

import { useId, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getFavicon } from "../utils/utils"
import type { Bookmark, GridItem } from "../utils/types"
import { BOOKMARK_DRAG_MIME_TYPE, parseBookmarkDragPayload } from "../utils/parseDragPayload"

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
      ? "border-app-accent bg-app-accent/[0.07] outline outline-2 outline-offset-[-2px] outline-dashed outline-app-accent/85 ring-2 ring-app-accent/30 dark:bg-app-accent/[0.11] dark:outline-app-accent/70"
      : undefined

  const baseClass = cn(
    "relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
    isCut ? "border-app-cut-border bg-app-cut-surface border-dashed opacity-60" : "",
    !isCut &&
      !dropHighlight &&
      (isSelected
        ? "border-app-focus bg-app-selection ring-app-focus ring-2"
        : "border-app-border-muted bg-app-raised/80 hover:border-app-input-border hover:bg-app-hover-strong/50"),
    dropFrameClass,
    selectMode && !isFolder ? "cursor-pointer" : ""
  )

  return (
    <div
      ref={itemRef}
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
      {isFolder ? <FolderContent label={item.label} /> : <LinkContent bookmark={item.bookmark} />}
    </div>
  )
}

function FolderContent({ label }: { label: string }) {
  return (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center rounded">
        <svg className="text-app-folder size-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-app-fg font-medium">{label}</span>
        <p className="text-app-fg-label text-xs">Carpeta</p>
      </div>
    </>
  )
}

function LinkContent({ bookmark }: { bookmark: Bookmark }) {
  const favicon = getFavicon(bookmark.url)
  const [faviconError, setFaviconError] = useState(false)
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "")
    } catch {
      return bookmark.url
    }
  })()

  return (
    <>
      {favicon && !faviconError ? (
        <Image
          src={favicon}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      ) : (
        <div className="bg-app-hover flex size-8 shrink-0 items-center justify-center rounded">
          <svg className="text-app-accent size-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d={
                "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 " +
                "5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z" +
                "M8 13h8v-2H8v2z" +
                "m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 " +
                "3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
              }
            />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-app-fg font-medium">{bookmark.title}</span>
        <p className="text-app-fg-label truncate text-xs">{hostname}</p>
      </div>
    </>
  )
}
