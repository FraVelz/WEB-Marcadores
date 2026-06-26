"use client"

import BookmarkDetailPanel from "@/features/marcadores/components/bookmark/BookmarkDetailPanel"
import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import { MarcadoresExplorerRail } from "@/features/marcadores/components/MarcadoresExplorerRail"
import MarcadoresTreeView from "@/features/marcadores/components/MarcadoresTreeView"
import type { MarcadoresPageModel } from "@/features/marcadores/useMarcadoresPage"

export function MarcadoresStackedPageSlot({ m }: { m: MarcadoresPageModel }) {
  const scope = m.libraryPaneScope
  const pane = scope.getState()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
      <MarcadoresExplorerRail />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
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
          allTags={m.allTags}
          folders={m.folders}
          searchQuery={pane.searchValue.trim()}
        />
      </div>
    </div>
  )
}
