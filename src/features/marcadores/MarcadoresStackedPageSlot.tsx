"use client"

import type { Dispatch, MutableRefObject, SetStateAction } from "react"

import BookmarkDetailPanel from "@/components/BookmarkDetailPanel"

import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import { MarcadoresExplorerRail } from "@/features/marcadores/components/MarcadoresExplorerRail"
import MarcadoresTreeView from "@/features/marcadores/components/MarcadoresTreeView"
import type { TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import type { Folder } from "@/contexts/DashboardContext"
import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"

export function MarcadoresStackedPageSlot(props: {
  primaryViewMode: "grid" | "tree"
  flatList: GridItem[]
  folders: Folder[]
  filteredBookmarks: Bookmark[]
  treeFlatRows: TreeFlatRow[]
  treeCollapsedIds: Set<string>
  toggleTreeFolderCollapse: (id: string) => void
  cutItem: CutItem | null
  handleAdd: () => void
  handleDoubleClick: (item: GridItem) => void
  handleDrop: (source: GridItem, target?: string | null) => void
  setShowNewFolder: Dispatch<SetStateAction<boolean>>
  detailBookmark: Bookmark | null
  closeBookmarkDetailPanel: () => void
  recordBookmarkOpened: (id: string) => Promise<void>
  onBookmarkUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  allTags: string[]
  itemRefs: MutableRefObject<Map<number, HTMLDivElement>>
  selectedIndex: number
  setSelectedIndex: Dispatch<SetStateAction<number>>
  selectMode: boolean
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
  setSelectMode: Dispatch<SetStateAction<boolean>>
  breadcrumbLabel: string
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
      <MarcadoresExplorerRail />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
        {props.primaryViewMode === "grid" ? (
          <BookmarkGrid
            flatList={props.flatList}
            selectedIndex={props.selectedIndex}
            selectMode={props.selectMode}
            selectedIds={props.selectedIds}
            cutItem={props.cutItem}
            onSelectIndex={props.setSelectedIndex}
            onToggleSelect={props.toggleSelect}
            onDoubleClick={props.handleDoubleClick}
            onDrop={props.handleDrop}
            onAddBookmark={props.handleAdd}
            onNewFolder={() => props.setShowNewFolder(true)}
            itemRefs={props.itemRefs}
            setSelectedIds={props.setSelectedIds}
            setSelectMode={props.setSelectMode}
          />
        ) : (
          <MarcadoresTreeView
            folders={props.folders}
            bookmarks={props.filteredBookmarks}
            rows={props.treeFlatRows}
            selectedIndex={props.selectedIndex}
            selectMode={props.selectMode}
            selectedIds={props.selectedIds}
            cutItem={props.cutItem}
            onSelectIndex={props.setSelectedIndex}
            onToggleSelect={props.toggleSelect}
            onDoubleClick={props.handleDoubleClick}
            onDrop={props.handleDrop}
            onToggleFolderCollapse={props.toggleTreeFolderCollapse}
            collapsedIds={props.treeCollapsedIds}
            onAddBookmark={props.handleAdd}
            onNewFolder={() => props.setShowNewFolder(true)}
            itemRefs={props.itemRefs}
            currentLocationLabel={props.breadcrumbLabel}
          />
        )}
        {props.detailBookmark ? (
          <BookmarkDetailPanel
            bookmark={props.detailBookmark}
            onClose={props.closeBookmarkDetailPanel}
            onTelemetryOpen={props.recordBookmarkOpened}
            onUpdate={props.onBookmarkUpdate}
            allTags={props.allTags}
            folders={props.folders}
            embedded
          />
        ) : null}
      </div>
    </div>
  )
}
