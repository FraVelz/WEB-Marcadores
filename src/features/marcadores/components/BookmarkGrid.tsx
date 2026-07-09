"use client"

import type { Dispatch, SetStateAction } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { useBookmarkDragMonitor, useBookmarkDropPanel } from "@/lib/drag-and-drop"
import type { GridItem, CutItem } from "../utils/types"
import { APP_DROP_PANEL_OVERLAY_CLASS } from "../utils/dragDropUi"
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
  /** Si se pasan, en el fondo de la cuadrícula se puede dibujar un rectángulo tipo Explorador de Windows. */
  setSelectedIds?: Dispatch<SetStateAction<Set<string>>>
  setSelectMode?: Dispatch<SetStateAction<boolean>>
  searchQuery?: string
  searchInDescription?: boolean
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  folders?: import("../utils/types").FlatFolder[]
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
  setSelectedIds,
  setSelectMode,
  searchQuery = "",
  searchInDescription = true,
  onToggleFavorite,
  folders = [],
}: Props) {
  const [dropPanelSlot, setDropPanelSlot] = useState(false)
  const [dropItemIdx, setDropItemIdx] = useState<number | null>(null)
  const [marqueeClient, setMarqueeClient] = useState<{
    x1: number
    y1: number
    x2: number
    y2: number
  } | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const marqueeSessionRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    additive: boolean
    dragging: boolean
  } | null>(null)

  const clearDropUi = () => {
    setDropPanelSlot(false)
    setDropItemIdx(null)
  }

  useBookmarkDragMonitor(clearDropUi)

  useBookmarkDropPanel({
    elementRef: scrollRef,
    enabled: Boolean(onDrop),
    onDrop,
    onDragEnter: () => {
      setDropPanelSlot(true)
      setDropItemIdx(null)
    },
    onDragLeave: clearDropUi,
  })

  const marqueeCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      marqueeCleanupRef.current?.()
      marqueeCleanupRef.current = null
      marqueeSessionRef.current = null
      setMarqueeClient(null)
    }
  }, [])

  const onSurfacePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!setSelectedIds || !setSelectMode || e.button !== 0) return
      const root = scrollRef.current
      if (!root) return
      if (isLikelyScrollbarPointer(root, e)) return

      const target = e.target as HTMLElement
      if (target.closest("[data-bookmark-grid-item]")) return
      if (target.closest("button, a, input, textarea, select, label")) return

      marqueeSessionRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        additive: e.ctrlKey || e.metaKey,
        dragging: false,
      }

      const onMove = (ev: PointerEvent) => {
        const s = marqueeSessionRef.current
        if (!s || ev.pointerId !== s.pointerId) return
        const dx = ev.clientX - s.startX
        const dy = ev.clientY - s.startY
        if (!s.dragging) {
          if (Math.hypot(dx, dy) < 6) return
          s.dragging = true
        }
        ev.preventDefault()
        setMarqueeClient({
          x1: s.startX,
          y1: s.startY,
          x2: ev.clientX,
          y2: ev.clientY,
        })
      }

      const cleanup = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onUp)
        marqueeCleanupRef.current = null
      }

      const onUp = (ev: PointerEvent) => {
        const s = marqueeSessionRef.current
        if (!s || ev.pointerId !== s.pointerId) return
        cleanup()

        if (s.dragging && setSelectedIds) {
          const box = normalizeMarqueeClientRect(s.startX, s.startY, ev.clientX, ev.clientY)
          const ids = collectMarqueeBookmarkIds(itemRefs.current, flatList, box)
          setSelectedIds((prev) => {
            if (s.additive) {
              const next = new Set(prev)
              ids.forEach((id) => next.add(id))
              return next
            }
            return ids
          })
          if (ids.size > 0) {
            setSelectMode(true)
            const list = flatList
            const firstIdx = list.findIndex((it) => it.type === "link" && ids.has(it.bookmark.id))
            if (firstIdx >= 0) onSelectIndex(firstIdx)
          }
        }

        marqueeSessionRef.current = null
        setMarqueeClient(null)
      }

      marqueeCleanupRef.current = cleanup
      window.addEventListener("pointermove", onMove, { passive: false })
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onUp)
    },
    [flatList, itemRefs, onSelectIndex, setSelectedIds, setSelectMode]
  )

  const showAppPanelDropFrame = Boolean(onDrop && dropPanelSlot && dropItemIdx === null)

  const marqueeStyle =
    marqueeClient &&
    (() => {
      const left = Math.min(marqueeClient.x1, marqueeClient.x2)
      const top = Math.min(marqueeClient.y1, marqueeClient.y2)
      const width = Math.abs(marqueeClient.x2 - marqueeClient.x1)
      const height = Math.abs(marqueeClient.y2 - marqueeClient.y1)
      return { left, top, width, height }
    })()

  return (
    <div
      ref={scrollRef}
      className={cn("relative min-h-0 flex-1 overflow-auto p-3 sm:p-4", marqueeClient && "touch-none select-none")}
      onPointerDown={setSelectedIds && setSelectMode ? onSurfacePointerDown : undefined}
    >
      {marqueeStyle ? (
        <div
          aria-hidden
          className={cn(
            "border-app-accent/85 bg-app-accent/14 pointer-events-none fixed z-[60]",
            "ring-app-accent/25 rounded-sm border border-dashed ring-1",
            "dark:bg-app-accent/18 dark:border-app-accent/65"
          )}
          style={{
            left: marqueeStyle.left,
            top: marqueeStyle.top,
            width: Math.max(marqueeStyle.width, 1),
            height: Math.max(marqueeStyle.height, 1),
          }}
        />
      ) : null}
      {showAppPanelDropFrame ? <div className={APP_DROP_PANEL_OVERLAY_CLASS} aria-hidden /> : null}
      <div className="relative grid min-h-[120px] grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
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
              searchQuery={searchQuery}
              searchInDescription={searchInDescription}
              onToggleFavorite={onToggleFavorite}
              folders={folders}
            />
          )
        })}
      </div>
      {flatList.length === 0 && <EmptyState onAddBookmark={onAddBookmark} onNewFolder={onNewFolder} />}
    </div>
  )
}

function isLikelyScrollbarPointer(root: HTMLElement, e: React.PointerEvent): boolean {
  const verticalBar = root.offsetWidth - root.clientWidth
  const horizontalBar = root.offsetHeight - root.clientHeight
  if (verticalBar <= 0 && horizontalBar <= 0) return false
  const r = root.getBoundingClientRect()
  const lx = e.clientX - r.left
  const ly = e.clientY - r.top
  if (verticalBar > 0 && lx >= root.clientWidth) return true
  if (horizontalBar > 0 && ly >= root.clientHeight) return true
  return false
}

function normalizeMarqueeClientRect(x1: number, y1: number, x2: number, y2: number) {
  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    right: Math.max(x1, x2),
    bottom: Math.max(y1, y2),
  }
}

function marqueeClientRectsIntersect(a: DOMRect, b: { left: number; top: number; right: number; bottom: number }) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}

function collectMarqueeBookmarkIds(
  refs: Map<number, HTMLDivElement>,
  flatList: GridItem[],
  box: { left: number; top: number; right: number; bottom: number }
): Set<string> {
  const ids = new Set<string>()
  refs.forEach((el, idx) => {
    const item = flatList[idx]
    if (!item || item.type !== "link") return
    const r = el.getBoundingClientRect()
    if (marqueeClientRectsIntersect(r, box)) ids.add(item.bookmark.id)
  })
  return ids
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
