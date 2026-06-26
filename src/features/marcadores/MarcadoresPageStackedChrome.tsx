"use client"

import DemoBanner from "@/features/marcadores/components/DemoBanner"
import DeleteConfirmBanner from "@/features/marcadores/components/DeleteConfirmBanner"
import { MarcadoresGlobalAlertLayer } from "@/features/marcadores/components/MarcadoresGlobalAlertLayer"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"
import type { MarcadoresPageModel } from "@/features/marcadores/useMarcadoresPage"

export function MarcadoresPageStackedChrome({ m }: { m: MarcadoresPageModel }) {
  const scope = m.libraryPaneScope
  const pane = scope.getState()
  const b = scope.bindings

  return (
    <>
      <MarcadoresToolbar
        showSearch={pane.showSearch}
        setShowSearch={b.setShowSearch}
        searchValue={pane.searchValue}
        setSearchValue={b.setSearchValue}
        searchInSubfolders={pane.searchInSubfolders}
        setSearchInSubfolders={b.setSearchInSubfolders}
        searchInDescription={pane.searchInDescription}
        setSearchInDescription={b.setSearchInDescription}
        searchRef={scope.searchRef}
        focusMain={m.focusMain}
        showNewFolder={pane.showNewFolder}
        setShowNewFolder={b.setShowNewFolder}
        newFolderName={pane.newFolderName}
        setNewFolderName={b.setNewFolderName}
        editingFolder={pane.editingFolder}
        setEditingFolder={b.setEditingFolder}
        renameFolderName={pane.renameFolderName}
        setRenameFolderName={b.setRenameFolderName}
        onRenameFolder={m.onRenameFolder}
        onNavigateUp={() => m.browseScope.setFolderId(null)}
        onAddBookmark={m.handleAdd}
        onDeleteFocused={() => {
          const item = m.focusFlatList[pane.selectedIndex]
          if (item) b.setDeleteConfirmItem(item)
        }}
        onCreateFolder={m.onCreateFolder}
        selectMode={pane.selectMode}
        setSelectMode={b.setSelectMode}
        selectedIds={pane.selectedIds}
        setSelectedIds={b.setSelectedIds}
        onEdit={m.handleEdit}
        onDelete={m.onDelete}
        infoPanelEnabled={pane.infoPanelEnabled}
        setInfoPanelEnabled={b.setInfoPanelEnabled}
        flatList={m.focusFlatList}
        selectedIndex={pane.selectedIndex}
        setDetailBookmark={b.setDetailBookmark}
        treeView={pane.viewMode === "tree"}
        onToggleTreeView={m.treeToggleDisabled ? undefined : m.toggleTreeMainView}
        treeToggleDisabled={m.treeToggleDisabled}
        showFullscreenToggle={!m.stackedExplorerHeaderBar}
        duplicateClusterCount={m.duplicateClusterCount}
      />

      {pane.pasteError || pane.deleteConfirmItem || m.demoMode ? (
        <MarcadoresGlobalAlertLayer variant="stacked">
          {pane.pasteError ? <PasteErrorBanner message={pane.pasteError} /> : null}
          {pane.deleteConfirmItem ? (
            <DeleteConfirmBanner
              item={pane.deleteConfirmItem}
              onConfirm={() => m.onConfirmDelete(pane.deleteConfirmItem!)}
              onCancel={() => b.setDeleteConfirmItem(null)}
            />
          ) : null}
          {m.demoMode ? <DemoBanner /> : null}
        </MarcadoresGlobalAlertLayer>
      ) : null}

      <MarcadoresBreadcrumb breadcrumb={m.breadcrumb} onSelect={m.browseScope.setFolderId} />
    </>
  )
}
