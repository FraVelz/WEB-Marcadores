"use client"

import { useCallback, useEffect, useState } from "react"

import { APP_DROP_PANEL_OVERLAY_CLASS } from "../utils/dragDropUi"
import { BOOKMARK_DRAG_MIME_TYPE, isBookmarkDragTransfer, parseBookmarkDragPayload } from "../utils/parseDragPayload"
import type { Bookmark, CutItem, FlatFolder, GridItem } from "../utils/types"
import { EmptyTreeState } from "./marcadoresTree/EmptyTreeState"
import { TREE_DROP_PANEL_KEY, TREE_DROP_ROOT_KEY } from "./marcadoresTree/treeConstants"
import { folderDestinationLine, rowTargetKey } from "./marcadoresTree/treeHelpers"
import type { TreeFlatRow } from "./marcadoresTree/treeTypes"
import { TreeDropPreviewBar } from "./marcadoresTree/TreeDropPreviewBar"
import { TreeRootDropRow } from "./marcadoresTree/TreeRootDropRow"
import { TreeRow } from "./marcadoresTree/TreeRow"

export type { TreeFlatRow }

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

  useEffect(() => {
    const listener = () => setDropPreview(null)
    window.addEventListener("dragend", listener)
    return () => window.removeEventListener("dragend", listener)
  }, [setDropPreview])

  const clearDropPreview = useCallback(() => setDropPreview(null), [])

  const handlePanelDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!onDrop) return
      if (!isBookmarkDragTransfer(e.dataTransfer)) return
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
      if (!isBookmarkDragTransfer(e.dataTransfer)) return
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
        className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4"
        onDragLeave={(e) => {
          if (!onDrop) return
          const rt = e.relatedTarget as Node | null
          if (rt && e.currentTarget.contains(rt)) return
          clearDropPreview()
        }}
        onDragOver={onDrop ? handlePanelDragOver : undefined}
        onDrop={onDrop ? handlePanelDrop : undefined}
      >
        {onDrop && dropPreview?.targetKey === TREE_DROP_PANEL_KEY ? (
          <div className={APP_DROP_PANEL_OVERLAY_CLASS} aria-hidden />
        ) : null}
        <div
          className="relative mx-auto min-h-[120px] max-w-4xl space-y-0.5"
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

      {dropPreview && <TreeDropPreviewBar line={dropPreview.line} />}
    </div>
  )
}
