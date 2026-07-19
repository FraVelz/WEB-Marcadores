"use client"

import { useRef, useState } from "react"

import { APP_DROP_PANEL_OVERLAY_CLASS } from "../utils/dragDropUi"
import type { Bookmark, CutItem, FlatFolder, GridItem } from "../utils/types"
import { useBookmarkDragMonitor, useBookmarkDropPanel } from "@/lib/drag-and-drop"
import { EmptySearchState } from "./EmptySearchState"
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
  searchQuery?: string
  searchInDescription?: boolean
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
  searchQuery = "",
  searchInDescription = true,
}: Props) {
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const clearDropPreview = () => setDropPreview(null)

  useBookmarkDragMonitor(clearDropPreview)

  useBookmarkDropPanel({
    elementRef: panelRef,
    enabled: Boolean(onDrop),
    onDrop,
    onDragEnter: () => {
      setDropPreview({
        targetKey: TREE_DROP_PANEL_KEY,
        line: `Área vacía → carpeta abierta: ${currentLocationLabel}`,
      })
    },
    onDragLeave: clearDropPreview,
  })

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div ref={panelRef} className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4">
        {onDrop && dropPreview?.targetKey === TREE_DROP_PANEL_KEY ? (
          <div className={APP_DROP_PANEL_OVERLAY_CLASS} aria-hidden />
        ) : null}
        <div
          className="relative mx-auto min-h-[120px] max-w-4xl space-y-0.5"
          role="tree"
          aria-label="Árbol de carpetas y marcadores"
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
                isChecked={selectedIds.has(isFolder ? item.id : item.bookmark.id)}
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
                searchQuery={searchQuery}
                searchInDescription={searchInDescription}
              />
            )
          })}
        </div>
        {rows.length === 0 &&
          (searchQuery.trim() ? (
            <EmptySearchState query={searchQuery} />
          ) : (
            <EmptyTreeState onAddBookmark={onAddBookmark} onNewFolder={onNewFolder} />
          ))}
      </div>

      {dropPreview && <TreeDropPreviewBar line={dropPreview.line} />}
    </div>
  )
}
