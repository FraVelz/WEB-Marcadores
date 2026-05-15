"use client"

import BookmarkModal from "@/components/BookmarkModal"

import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"

import { MarcadoresDesktopPageSlot } from "@/features/marcadores/MarcadoresDesktopPageSlot"
import { MarcadoresPageMainLayout } from "@/features/marcadores/MarcadoresPageMainLayout"
import { MarcadoresPageStackedChrome } from "@/features/marcadores/MarcadoresPageStackedChrome"
import { MarcadoresStackedPageSlot } from "@/features/marcadores/MarcadoresStackedPageSlot"
import { MarcadoresZonesPageSlot } from "@/features/marcadores/MarcadoresZonesPageSlot"

import { useMarcadoresPageCommandHooks } from "@/features/marcadores/page/useMarcadoresPageCommandHooks"
import { useMarcadoresPageDataHooks } from "@/features/marcadores/page/useMarcadoresPageDataHooks"

export function MarcadoresPage() {
  const d = useMarcadoresPageDataHooks()
  const c = useMarcadoresPageCommandHooks(d)

  if (d.loading) return <div className="text-app-fg-label flex flex-1 items-center justify-center">Cargando…</div>

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!d.desktopWindowChrome ? (
        <MarcadoresPageStackedChrome
          showBreadcrumb={!d.zonesBoard}
          demoMode={d.demoMode}
          pasteError={d.pasteError}
          deleteConfirmItem={d.deleteConfirmItem}
          onConfirmDelete={d.onConfirmDelete}
          onCancelDelete={() => d.setDeleteConfirmItem(null)}
          browseMode={d.browseMode}
          setBrowseMode={d.setBrowseMode}
          activeViewAst={d.activeViewAst}
          setActiveViewAst={d.setActiveViewAst}
          duplicateClusterCount={d.duplicateClusterCount}
          breadcrumb={d.breadcrumb}
          onSelectBreadcrumb={d.setSelectedFolderId}
          showSearch={d.showSearch}
          setShowSearch={d.setShowSearch}
          searchValue={d.searchValue}
          setSearchValue={d.setSearchValue}
          searchRef={d.searchRef}
          focusMain={d.focusMain}
          showNewFolder={d.showNewFolder}
          setShowNewFolder={d.setShowNewFolder}
          newFolderName={d.newFolderName}
          setNewFolderName={d.setNewFolderName}
          editingFolder={d.editingFolder}
          setEditingFolder={d.setEditingFolder}
          renameFolderName={d.renameFolderName}
          setRenameFolderName={d.setRenameFolderName}
          onRenameFolder={d.onRenameFolder}
          onNavigateExploreRoot={() => d.setSelectedFolderId(null)}
          handleAdd={d.handleAdd}
          onDeleteFocused={() => {
            const item = d.focusFlatList[d.selectedIndex]
            if (item) d.setDeleteConfirmItem(item)
          }}
          onCreateFolder={d.onCreateFolder}
          selectMode={d.selectMode}
          setSelectMode={d.setSelectMode}
          selectedIds={d.selectedIds}
          setSelectedIds={d.setSelectedIds}
          handleEdit={d.handleEdit}
          onDelete={d.onDelete}
          infoPanelEnabled={d.infoPanelEnabled}
          setInfoPanelEnabled={d.setInfoPanelEnabled}
          focusFlatList={d.focusFlatList}
          selectedIndex={d.selectedIndex}
          setDetailBookmark={d.setDetailBookmark}
          treeView={d.viewMode === "tree"}
          onToggleTreeView={c.treeToggleDisabled ? undefined : c.toggleTreeMainView}
          treeToggleDisabled={c.treeToggleDisabled}
        />
      ) : null}

      <MarcadoresPageMainLayout
        desktopWindowChrome={d.desktopWindowChrome}
        zonesBoard={d.zonesBoard}
        zonesSlot={
          <MarcadoresZonesPageSlot
            pool={d.libraryMatchesSearch}
            columns={d.zoneColumns}
            selectMode={d.selectMode}
            selectedIds={d.selectedIds}
            cutItem={d.cutItem}
            onToggleSelect={d.toggleSelect}
            openBookmarkTab={d.openBookmarkTab}
            onZonesReorder={(cols) => void d.handleZonesReorder(cols)}
          />
        }
        desktopSlot={
          <MarcadoresDesktopPageSlot
            workspaceId={d.activeWorkspaceId}
            deskLibWinIds={d.deskLibWinIds}
            setDeskLibWinIds={d.setDeskLibWinIds}
            addDeskLibraryWindow={d.addDeskLibraryWindow}
            resolvedDeskLibPaneId={d.resolvedDeskLibPaneId}
            focusDeskLibraryPane={d.focusDeskLibraryPane}
            closeDeskLibraryWindow={d.closeDeskLibraryWindow}
            floatingOverlays={c.desktopFloatingOverlays}
            detailBookmark={d.detailBookmark}
            closeBookmarkDetailPanel={d.closeBookmarkDetailPanel}
            recordBookmarkOpened={d.recordBookmarkOpened}
            onBookmarkUpdate={d.onBookmarkUpdate}
            allTags={d.allTags}
            folders={d.folders}
            desktopPaneDerived={d.desktopPaneDerived}
            breadcrumb={d.breadcrumb}
            flatList={d.flatList}
            listForDeleteFallback={d.focusFlatList}
            body={c.paneBody}
          />
        }
        stackedSlot={
          <MarcadoresStackedPageSlot
            primaryViewMode={d.primaryViewMode}
            flatList={d.flatList}
            folders={d.folders}
            filteredBookmarks={d.filteredBookmarks}
            treeFlatRows={d.treeFlatRows}
            treeCollapsedIds={d.treeCollapsedIds}
            toggleTreeFolderCollapse={d.toggleTreeFolderCollapse}
            cutItem={d.cutItem}
            handleAdd={d.handleAdd}
            handleDoubleClick={d.handleDoubleClick}
            handleDrop={d.handleDrop}
            setShowNewFolder={d.setShowNewFolder}
            detailBookmark={d.detailBookmark}
            closeBookmarkDetailPanel={d.closeBookmarkDetailPanel}
            recordBookmarkOpened={d.recordBookmarkOpened}
            onBookmarkUpdate={d.onBookmarkUpdate}
            allTags={d.allTags}
            itemRefs={d.itemRefs}
            selectedIndex={d.selectedIndex}
            setSelectedIndex={d.setSelectedIndex}
            selectMode={d.selectMode}
            selectedIds={d.selectedIds}
            toggleSelect={d.toggleSelect}
            breadcrumbLabel={d.breadcrumb.map((p) => p.label).join(" › ")}
          />
        }
      />

      {d.zonesBoard ? (
        <MarcadoresFooter
          variant="zones"
          poolCount={d.libraryMatchesSearch.length}
          flatList={d.focusFlatList}
          selectedIndex={d.selectedIndex}
        />
      ) : !d.desktopWindowChrome ? (
        <MarcadoresFooter flatList={d.focusFlatList} selectedIndex={d.selectedIndex} />
      ) : null}

      {d.modalOpen ? (
        <BookmarkModal
          key={d.editingBookmark?.id ?? `new-${d.bookmarkModalNonce}`}
          onClose={() => {
            d.setModalOpen(false)
            d.setEditingBookmark(null)
            requestAnimationFrame(() => d.focusMain())
          }}
          onSubmit={d.onModalSubmit}
          initialData={
            d.editingBookmark
              ? {
                  title: d.editingBookmark.title,
                  url: d.editingBookmark.url,
                  description: d.editingBookmark.description || "",
                  folder_id: d.editingBookmark.folder_id || "",
                  tags: d.editingBookmark.tags?.join(", ") || "",
                }
              : null
          }
          allTags={d.allTags}
          folders={d.folders}
          currentFolderId={d.activeBrowseFolderId}
        />
      ) : null}
    </div>
  )
}
