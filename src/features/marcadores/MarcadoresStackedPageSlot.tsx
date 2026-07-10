"use client"

import BookmarkDetailPanel from "@/features/marcadores/components/bookmark/BookmarkDetailPanel"
import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import { MarcadoresExplorerRail } from "@/features/marcadores/components/MarcadoresExplorerRail"
import MarcadoresTreeView from "@/features/marcadores/components/MarcadoresTreeView"
import type { MarcadoresPageModel } from "@/features/marcadores/useMarcadoresPage"
import type { Bookmark } from "@/features/marcadores/utils/types"

function buildFolderBookmarkCounts(bookmarks: Bookmark[]): Map<string | null, number> {
  const counts = new Map<string | null, number>()
  for (const b of bookmarks) {
    if (b.archived_at) continue
    const fid = b.folder_id ?? null
    counts.set(fid, (counts.get(fid) ?? 0) + 1)
  }
  return counts
}

export function MarcadoresStackedPageSlot({ m }: { m: MarcadoresPageModel }) {
  const scope = m.libraryPaneScope
  const pane = scope.getState()

  const folderBookmarkCounts = buildFolderBookmarkCounts(m.bookmarks)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
      <MarcadoresExplorerRail folderBookmarkCounts={folderBookmarkCounts} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        {m.primaryViewMode === "grid" ? (
          <BookmarkGrid
            flatList={m.flatList}
            selectedIndex={pane.selectedIndex}
            selectMode={pane.selectMode}
            selectedIds={pane.selectedIds}
            cutItem={pane.cutItem}
            onAddBookmark={m.handleAdd}
            onDoubleClick={m.handleDoubleClick}
            onDrop={m.handleDrop}
            onNewFolder={() => scope.bindings.setShowNewFolder(true)}
            itemRefs={scope.itemRefs}
            onSelectIndex={scope.bindings.setSelectedIndex}
            onToggleSelect={m.toggleSelect}
            searchQuery={pane.searchValue.trim()}
            searchInDescription={pane.searchInDescription}
            onToggleFavorite={(id, isFavorite) => void m.onBookmarkUpdate(id, { is_favorite: isFavorite })}
            folders={m.folders}
          />
        ) : (
          <MarcadoresTreeView
            folders={m.folders}
            bookmarks={m.filteredBookmarks}
            rows={m.treeFlatRows}
            collapsedIds={m.treeCollapsedIds}
            onToggleFolderCollapse={m.toggleTreeFolderCollapse}
            selectedIndex={pane.selectedIndex}
            selectMode={pane.selectMode}
            selectedIds={pane.selectedIds}
            cutItem={pane.cutItem}
            onAddBookmark={m.handleAdd}
            onDoubleClick={m.handleDoubleClick}
            onDrop={m.handleDrop}
            onNewFolder={() => scope.bindings.setShowNewFolder(true)}
            itemRefs={scope.itemRefs}
            onSelectIndex={scope.bindings.setSelectedIndex}
            onToggleSelect={m.toggleSelect}
            currentLocationLabel={m.breadcrumb.map((p) => p.label).join(" › ")}
            searchQuery={pane.searchValue.trim()}
            searchInDescription={pane.searchInDescription}
          />
        )}
        <BookmarkDetailPanel
          bookmark={pane.detailBookmark}
          onClose={m.closeBookmarkDetailPanel}
          onUpdate={m.onBookmarkUpdate}
          onTelemetryOpen={m.recordBookmarkOpened}
          onEdit={m.handleEdit}
          onDelete={() => {
            const item = m.focusFlatList[pane.selectedIndex]
            if (item) scope.bindings.setDeleteConfirmItem(item)
          }}
          allTags={m.allTags}
          folders={m.folders}
          embedded
          persistent
          searchQuery={pane.searchValue.trim()}
        />
      </div>
    </div>
  )
}
