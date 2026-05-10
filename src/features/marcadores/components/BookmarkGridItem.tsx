"use client"

import { cn } from "@/lib/utils"
import { getFavicon } from "../utils/utils"
import type { Bookmark, GridItem } from "../utils/types"

const DRAG_TYPE = "application/x-bookmark-item"

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
  onDrop?: (sourceItem: GridItem, targetFolderId: string | null) => void
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
}: Props) {
  const isFolder = item.type === "folder"
  const targetFolderId = isFolder ? item.id : (item.bookmark.folder_id ?? null)

  const handleDragStart = (e: React.DragEvent) => {
    const payload = isFolder
      ? { type: "folder" as const, id: item.id, name: item.label }
      : { type: "link" as const, bookmark: { id: item.bookmark.id, url: item.bookmark.url } }
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", isFolder ? item.label : item.bookmark.title)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData(DRAG_TYPE)
    if (!raw || !onDrop) return
    try {
      const payload = JSON.parse(raw)
      const sourceItem: GridItem =
        payload.type === "folder"
          ? { type: "folder", id: payload.id, folderId: payload.id, label: payload.name }
          : {
              type: "link",
              bookmark: {
                id: payload.bookmark.id,
                title: "",
                url: payload.bookmark.url,
                folder_id: null,
              },
            }
      onDrop(sourceItem, targetFolderId)
    } catch {
      // ignore
    }
  }

  const baseClass = `relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
    isCut ? "border-dashed border-app-cut-border bg-app-cut-surface opacity-60" : ""
  } ${
    !isCut &&
    (isSelected
      ? "border-app-focus bg-app-selection ring-2 ring-app-focus"
      : "border-app-border-muted bg-app-raised/80 hover:border-app-input-border hover:bg-app-hover-strong/50")
  } ${selectMode && !isFolder ? "cursor-pointer" : ""}`

  return (
    <div
      key={isFolder ? item.id : item.bookmark.id}
      ref={itemRef}
      draggable
      className={cn(baseClass, "cursor-grab active:cursor-grabbing")}
      onClick={() => {
        if (selectMode && !isFolder) onToggleSelect(item.bookmark.id)
        else onSelect(idx)
      }}
      onDoubleClick={() => onDoubleClick(item)}
      onDragStart={handleDragStart}
      onDragOver={onDrop ? handleDragOver : undefined}
      onDrop={onDrop ? handleDrop : undefined}
    >
      {selectMode && !isFolder && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(item.bookmark.id)
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="border-app-input-border bg-app-raised-muted accent-app-primary h-4 w-4 rounded"
          />
        </div>
      )}
      {isFolder ? <FolderContent label={item.label} /> : <LinkContent bookmark={item.bookmark} />}
    </div>
  )
}

function FolderContent({ label }: { label: string }) {
  return (
    <>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
        <svg className="text-app-folder h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
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
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "")
    } catch {
      return bookmark.url
    }
  })()

  return (
    <>
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element -- favicons dinámicos de terceros
        <img
          src={favicon}
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = "none"
          }}
        />
      ) : (
        <div className="bg-app-hover flex h-8 w-8 flex-shrink-0 items-center justify-center rounded">
          <svg className="text-app-accent h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
