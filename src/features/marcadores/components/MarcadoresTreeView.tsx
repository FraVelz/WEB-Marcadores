"use client"

import { useId, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getFavicon, getFolderPath } from "../utils/utils"
import type { Bookmark, CutItem, FlatFolder, GridItem } from "../utils/types"
import { BOOKMARK_DRAG_MIME_TYPE, parseBookmarkDragPayload } from "../utils/parseDragPayload"

export type TreeFlatRow = { item: GridItem; depth: number }

const TREE_DROP_ROOT_KEY = "__root__"
const TREE_DROP_PANEL_KEY = "__panel__"

function folderDestinationLine(folders: FlatFolder[], folderId: string | null) {
  return getFolderPath(folders, folderId)
    .map((p) => p.label)
    .join(" › ")
}

function rowTargetKey(item: GridItem): string {
  return item.type === "folder" ? `folder:${item.id}` : `link:${item.bookmark.id}`
}

type DropPreview = { targetKey: string; line: string }

type Props = {
  folders: FlatFolder[]
  bookmarks: Bookmark[]
  rows: TreeFlatRow[]
  selectedIndex: number
  selectMode: boolean
  selectedIds: Set<string>
  cutItem: CutItem | null
  onSelectIndex: (idx: number) => void
  onToggleSelect: (id: string) => void
  onDoubleClick: (item: GridItem) => void
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
  onToggleFolderCollapse: (folderId: string) => void
  collapsedIds: Set<string>
  onAddBookmark: () => void
  onNewFolder: () => void
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  /** Texto de la carpeta abierta en la barra lateral / migas (destino del área vacía) */
  currentLocationLabel: string
}

function folderHasChildren(folders: FlatFolder[], bookmarks: Bookmark[], folderId: string) {
  const hasSubfolders = folders.some((f) => (f.parent_id || null) === folderId)
  const hasLinks = bookmarks.some((b) => (b.folder_id || null) === folderId)
  return hasSubfolders || hasLinks
}

export default function MarcadoresTreeView({
  folders,
  bookmarks,
  rows,
  selectedIndex,
  selectMode,
  selectedIds,
  cutItem,
  onSelectIndex,
  onToggleSelect,
  onDoubleClick,
  onDrop,
  onToggleFolderCollapse,
  collapsedIds,
  onAddBookmark,
  onNewFolder,
  itemRefs,
  currentLocationLabel,
}: Props) {
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null)

  const clearDropPreview = useCallback(() => setDropPreview(null), [])

  useEffect(() => {
    window.addEventListener("dragend", clearDropPreview)
    return () => window.removeEventListener("dragend", clearDropPreview)
  }, [clearDropPreview])

  const handlePanelDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!onDrop) return
      if (e.target !== e.currentTarget) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropPreview({
        targetKey: TREE_DROP_PANEL_KEY,
        line: `Área vacía → carpeta abierta: ${currentLocationLabel}`,
      })
    },
    [onDrop, currentLocationLabel]
  )

  const handlePanelDrop = useCallback(
    (e: React.DragEvent) => {
      if (!onDrop) return
      if (e.target !== e.currentTarget) return
      e.preventDefault()
      clearDropPreview()
      const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
      if (!raw) return
      const sourceItem = parseBookmarkDragPayload(raw)
      if (sourceItem) onDrop(sourceItem, undefined)
    },
    [onDrop, clearDropPreview]
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="min-h-0 flex-1 overflow-auto p-3 sm:p-4"
        onDragLeave={(e) => {
          if (!onDrop) return
          const rt = e.relatedTarget as Node | null
          if (rt && e.currentTarget.contains(rt)) return
          clearDropPreview()
        }}
        onDragOver={onDrop ? handlePanelDragOver : undefined}
        onDrop={onDrop ? handlePanelDrop : undefined}
      >
        <div
          className="mx-auto min-h-[120px] max-w-4xl space-y-0.5"
          onDragOver={onDrop ? handlePanelDragOver : undefined}
          onDrop={onDrop ? handlePanelDrop : undefined}
        >
          {onDrop && (
            <TreeRootDropRow
              dropActive={dropPreview?.targetKey === TREE_DROP_ROOT_KEY}
              onDragHighlight={() =>
                setDropPreview({
                  targetKey: TREE_DROP_ROOT_KEY,
                  line: `Raíz → ${folderDestinationLine(folders, null)}`,
                })
              }
              onDragClearHighlight={() => clearDropPreview()}
              onDrop={(source) => {
                clearDropPreview()
                onDrop(source, null)
              }}
            />
          )}
          {rows.map(({ item, depth }, idx) => {
            const isFolder = item.type === "folder"
            const key = isFolder ? item.id : item.bookmark.id
            const isCut =
              cutItem &&
              ((isFolder && cutItem.type === "folder" && cutItem.id === item.id) ||
                (!isFolder && cutItem.type === "link" && cutItem.bookmark.id === item.bookmark.id))
            const rk = rowTargetKey(item)
            return (
              <TreeRow
                key={key}
                folders={folders}
                bookmarks={bookmarks}
                item={item}
                depth={depth}
                idx={idx}
                isSelected={selectMode ? false : idx === selectedIndex}
                isCut={!!isCut}
                dropActive={dropPreview?.targetKey === rk}
                onDragHighlight={() =>
                  setDropPreview({
                    targetKey: rk,
                    line: isFolder
                      ? `Dentro de «${item.label}» — ${folderDestinationLine(folders, item.id)}`
                      : `Misma carpeta que este enlace — ${folderDestinationLine(folders, item.bookmark.folder_id ?? null)}`,
                  })
                }
                onDragClearHighlight={clearDropPreview}
                selectMode={selectMode}
                isChecked={!isFolder && selectedIds.has(item.bookmark.id)}
                collapsedIds={collapsedIds}
                onToggleFolderCollapse={onToggleFolderCollapse}
                itemRef={(el) => {
                  if (el) itemRefs.current.set(idx, el)
                  else itemRefs.current.delete(idx)
                }}
                onSelect={onSelectIndex}
                onToggleSelect={onToggleSelect}
                onDoubleClick={onDoubleClick}
                onDrop={
                  onDrop
                    ? (source, targetFolderId) => {
                        clearDropPreview()
                        onDrop(source, targetFolderId)
                      }
                    : undefined
                }
              />
            )
          })}
        </div>
        {rows.length === 0 && <EmptyTreeState onAddBookmark={onAddBookmark} onNewFolder={onNewFolder} />}
      </div>

      {dropPreview && (
        <div
          className="border-app-border bg-app-toolbar text-app-fg border-t px-3 py-2 text-sm shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
          aria-live="polite"
        >
          <span className="text-app-fg-label">Destino al soltar: </span>
          <span className="font-medium">{dropPreview.line}</span>
        </div>
      )}
    </div>
  )
}

function TreeRootDropRow({
  dropActive,
  onDragHighlight,
  onDragClearHighlight,
  onDrop,
}: {
  dropActive: boolean
  onDragHighlight: () => void
  onDragClearHighlight: () => void
  onDrop: (sourceItem: GridItem) => void
}) {
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if ([...e.dataTransfer.types].includes(BOOKMARK_DRAG_MIME_TYPE)) onDragHighlight()
  }

  const handleDragOver = (e: React.DragEvent) => {
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
    e.preventDefault()
    e.stopPropagation()
    onDragClearHighlight()
    const raw = e.dataTransfer.getData(BOOKMARK_DRAG_MIME_TYPE)
    if (!raw) return
    const sourceItem = parseBookmarkDragPayload(raw)
    if (sourceItem) onDrop(sourceItem)
  }

  return (
    <div
      className={cn(
        "mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-left text-sm transition-colors",
        dropActive
          ? "border-app-focus bg-app-selection ring-app-focus ring-2"
          : "border-app-border-muted bg-app-raised-muted/40 text-app-fg-secondary hover:border-app-input-border hover:bg-app-hover-strong/40"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg className="text-app-accent size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path
          d={
            "M3 3h8v2H3V3zm0 4h8v2H3V7zm0 4h8v2H3v-2zm0 4h8v2H3v-2z" +
            "m10-8h8v2h-8V3zm0 4h8v2h-8V7zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2z"
          }
        />
      </svg>
      <span className="text-app-fg truncate font-medium">Raíz</span>
      <span className="text-app-fg-label ml-auto shrink-0 text-xs">Soltar aquí → raíz</span>
    </div>
  )
}

function TreeRow({
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
}: {
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
}) {
  const selectControlId = useId()
  const isFolder = item.type === "folder"
  const targetFolderId = isFolder ? item.id : (item.bookmark.folder_id ?? null)

  const hasKids = isFolder ? folderHasChildren(folders, bookmarks, item.id) : false

  const handleDragStart = (e: React.DragEvent) => {
    const payload = isFolder
      ? { type: "folder" as const, id: item.id, name: item.label }
      : { type: "link" as const, bookmark: { id: item.bookmark.id, url: item.bookmark.url } }
    e.dataTransfer.setData(BOOKMARK_DRAG_MIME_TYPE, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", isFolder ? item.label : item.bookmark.title)
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
        : "border-app-border-muted bg-app-raised/80 hover:border-app-input-border hover:bg-app-hover-strong/50"),
    dropActive && !isCut && "border-app-focus bg-app-selection ring-app-focus ring-2",
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
      {isFolder ? (
        <>
          <button
            type="button"
            className={cn(
              "text-app-fg-label flex size-7 shrink-0 items-center justify-center rounded text-xs",
              !hasKids && "pointer-events-none invisible"
            )}
            aria-label={collapsedIds.has(item.id) ? "Expandir carpeta" : "Contraer carpeta"}
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
      ) : (
        <TreeLinkCell bookmark={item.bookmark} padForCheckbox={selectMode} />
      )}
    </div>
  )
}

function TreeLinkCell({ bookmark, padForCheckbox }: { bookmark: Bookmark; padForCheckbox: boolean }) {
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
      <span className={cn("w-7 shrink-0", padForCheckbox && "ml-6")} aria-hidden />
      {favicon && !faviconError ? (
        <Image
          src={favicon}
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 rounded"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      ) : (
        <div className="bg-app-hover flex size-7 shrink-0 items-center justify-center rounded">
          <svg className="text-app-accent size-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d={
                "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 " +
                "5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2z" +
                "m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 " +
                "3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
              }
            />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1 py-1">
        <span className="text-app-fg font-medium">{bookmark.title}</span>
        <p className="text-app-fg-label truncate text-xs">{hostname}</p>
      </div>
    </>
  )
}

function EmptyTreeState({ onAddBookmark, onNewFolder }: { onAddBookmark: () => void; onNewFolder: () => void }) {
  return (
    <div className="text-app-fg-label flex flex-col items-center justify-center py-16">
      <svg className="text-app-empty-icon mb-4 size-16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v12h4v4h10V11h-7v8h-2v-8h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5zM7 15H4v-4h3v4zm10 6h3v4h-3v-4z" />
      </svg>
      <p className="text-sm">No hay carpetas ni marcadores</p>
      <button
        type="button"
        onClick={onAddBookmark}
        className="bg-app-primary hover:bg-app-primary-hover mt-2 rounded px-4 py-2 text-sm text-white"
      >
        Agregar marcador
      </button>
      <button
        type="button"
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
