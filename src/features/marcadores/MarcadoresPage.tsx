"use client"

import BookmarkModal from "@/components/BookmarkModal"

import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"

import { MarcadoresDesktopPageSlot } from "@/features/marcadores/MarcadoresDesktopPageSlot"
import { MarcadoresPageMainLayout } from "@/features/marcadores/MarcadoresPageMainLayout"
import { MarcadoresPageStackedChrome } from "@/features/marcadores/MarcadoresPageStackedChrome"
import { MarcadoresStackedPageSlot } from "@/features/marcadores/MarcadoresStackedPageSlot"
import { MarcadoresZonesPageSlot } from "@/features/marcadores/MarcadoresZonesPageSlot"
import { useMarcadoresPage } from "@/features/marcadores/useMarcadoresPage"

export function MarcadoresPage() {
  const m = useMarcadoresPage()
  const modal = m.bookmarkModal

  if (m.loading) return <div className="text-app-fg-label flex flex-1 items-center justify-center">Cargando…</div>

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!m.desktopWindowChrome ? (
        <MarcadoresPageStackedChrome
          showBreadcrumb={!m.zonesBoard}
          demoMode={m.demoMode}
          pasteError={m.pasteError}
          deleteConfirmItem={m.deleteConfirmItem}
          onConfirmDelete={m.onConfirmDelete}
          onCancelDelete={() => m.setDeleteConfirmItem(null)}
          browseMode={m.browseMode}
          setBrowseMode={m.setBrowseMode}
          activeViewAst={m.activeViewAst}
          setActiveViewAst={m.setActiveViewAst}
          duplicateClusterCount={m.duplicateClusterCount}
          breadcrumb={m.breadcrumb}
          onSelectBreadcrumb={m.browseScope.setFolderId}
          showSearch={m.showSearch}
          setShowSearch={m.setShowSearch}
          searchValue={m.searchValue}
          setSearchValue={m.setSearchValue}
          searchRef={m.searchRef}
          focusMain={m.focusMain}
          showNewFolder={m.showNewFolder}
          setShowNewFolder={m.setShowNewFolder}
          newFolderName={m.newFolderName}
          setNewFolderName={m.setNewFolderName}
          editingFolder={m.editingFolder}
          setEditingFolder={m.setEditingFolder}
          renameFolderName={m.renameFolderName}
          setRenameFolderName={m.setRenameFolderName}
          onRenameFolder={m.onRenameFolder}
          onNavigateExploreRoot={() => m.browseScope.setFolderId(null)}
          handleAdd={m.handleAdd}
          onDeleteFocused={() => {
            const item = m.focusFlatList[m.selectedIndex]
            if (item) m.setDeleteConfirmItem(item)
          }}
          onCreateFolder={m.onCreateFolder}
          selectMode={m.selectMode}
          setSelectMode={m.setSelectMode}
          selectedIds={m.selectedIds}
          setSelectedIds={m.setSelectedIds}
          handleEdit={m.handleEdit}
          onDelete={m.onDelete}
          infoPanelEnabled={m.infoPanelEnabled}
          setInfoPanelEnabled={m.setInfoPanelEnabled}
          focusFlatList={m.focusFlatList}
          selectedIndex={m.selectedIndex}
          setDetailBookmark={m.setDetailBookmark}
          treeView={m.viewMode === "tree"}
          onToggleTreeView={m.treeToggleDisabled ? undefined : m.toggleTreeMainView}
          treeToggleDisabled={m.treeToggleDisabled}
          showFullscreenToggle={!m.stackedExplorerHeaderBar}
        />
      ) : null}

      <MarcadoresPageMainLayout
        desktopWindowChrome={m.desktopWindowChrome}
        zonesBoard={m.zonesBoard}
        zonesSlot={
          <MarcadoresZonesPageSlot
            pool={m.libraryMatchesSearch}
            columns={m.zoneColumns}
            selectMode={m.selectMode}
            selectedIds={m.selectedIds}
            cutItem={m.cutItem}
            onToggleSelect={m.toggleSelect}
            openBookmarkTab={m.openBookmarkTab}
            onZonesReorder={(cols) => void m.handleZonesReorder(cols)}
          />
        }
        desktopSlot={
          <MarcadoresDesktopPageSlot
            workspaceId={m.activeWorkspaceId}
            deskLibWinIds={m.deskLibWinIds}
            setDeskLibWinIds={m.setDeskLibWinIds}
            addDeskLibraryWindow={m.addDeskLibraryWindow}
            resolvedDeskLibPaneId={m.resolvedDeskLibPaneId}
            focusDeskLibraryPane={m.focusDeskLibraryPane}
            closeDeskLibraryWindow={m.closeDeskLibraryWindow}
            floatingOverlays={m.desktopFloatingOverlays}
            detailBookmark={m.detailBookmark}
            closeBookmarkDetailPanel={m.closeBookmarkDetailPanel}
            recordBookmarkOpened={m.recordBookmarkOpened}
            onBookmarkUpdate={m.onBookmarkUpdate}
            allTags={m.allTags}
            folders={m.folders}
            desktopPaneDerived={m.desktopPaneDerived}
            breadcrumb={m.breadcrumb}
            flatList={m.flatList}
            listForDeleteFallback={m.focusFlatList}
            body={m.paneBody}
          />
        }
        stackedSlot={
          <MarcadoresStackedPageSlot
            primaryViewMode={m.primaryViewMode}
            flatList={m.flatList}
            folders={m.folders}
            filteredBookmarks={m.filteredBookmarks}
            treeFlatRows={m.treeFlatRows}
            treeCollapsedIds={m.treeCollapsedIds}
            toggleTreeFolderCollapse={m.toggleTreeFolderCollapse}
            cutItem={m.cutItem}
            handleAdd={m.handleAdd}
            handleDoubleClick={m.handleDoubleClick}
            handleDrop={m.handleDrop}
            setShowNewFolder={m.setShowNewFolder}
            detailBookmark={m.detailBookmark}
            closeBookmarkDetailPanel={m.closeBookmarkDetailPanel}
            recordBookmarkOpened={m.recordBookmarkOpened}
            onBookmarkUpdate={m.onBookmarkUpdate}
            allTags={m.allTags}
            itemRefs={m.itemRefs}
            selectedIndex={m.selectedIndex}
            setSelectedIndex={m.setSelectedIndex}
            selectMode={m.selectMode}
            selectedIds={m.selectedIds}
            toggleSelect={m.toggleSelect}
            setSelectedIds={m.setSelectedIds}
            setSelectMode={m.setSelectMode}
            breadcrumbLabel={m.breadcrumb.map((p) => p.label).join(" › ")}
          />
        }
      />

      {m.zonesBoard ? (
        <MarcadoresFooter
          variant="zones"
          poolCount={m.libraryMatchesSearch.length}
          flatList={m.focusFlatList}
          selectedIndex={m.selectedIndex}
        />
      ) : !m.desktopWindowChrome ? (
        <MarcadoresFooter flatList={m.focusFlatList} selectedIndex={m.selectedIndex} />
      ) : null}

      {modal.open ? (
        <BookmarkModal
          key={modal.editing?.id ?? `new-${modal.nonce}`}
          onClose={modal.close}
          onSubmit={m.onModalSubmit}
          initialData={
            modal.editing
              ? {
                  title: modal.editing.title,
                  url: modal.editing.url,
                  description: modal.editing.description || "",
                  folder_id: modal.editing.folder_id || "",
                  tags: modal.editing.tags?.join(", ") || "",
                }
              : null
          }
          allTags={m.allTags}
          folders={m.folders}
          currentFolderId={modal.folderId}
        />
      ) : null}
    </div>
  )
}
