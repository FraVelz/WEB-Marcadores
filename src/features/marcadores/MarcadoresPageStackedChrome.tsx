"use client"

import DemoBanner from "@/features/marcadores/components/DemoBanner"
import { MarcadoresContentHeader } from "@/features/marcadores/components/MarcadoresContentHeader"
import { MarcadoresGlobalAlertLayer } from "@/features/marcadores/components/MarcadoresGlobalAlertLayer"
import { MarcadoresSecondaryActions } from "@/features/marcadores/components/MarcadoresSecondaryActions"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import type { MarcadoresPageModel } from "@/features/marcadores/useMarcadoresPage"

export function MarcadoresPageStackedChrome({ m }: { m: MarcadoresPageModel }) {
  const scope = m.libraryPaneScope
  const pane = scope.getState()
  const b = scope.bindings

  return (
    <>
      <MarcadoresContentHeader
        searchValue={pane.searchValue}
        setSearchValue={b.setSearchValue}
        searchRef={scope.searchRef}
        searchInSubfolders={pane.searchInSubfolders}
        setSearchInSubfolders={b.setSearchInSubfolders}
        searchInDescription={pane.searchInDescription}
        setSearchInDescription={b.setSearchInDescription}
        bookmarkSort={pane.bookmarkSort}
        setBookmarkSort={b.setBookmarkSort}
        viewMode={pane.viewMode}
        onToggleViewMode={m.toggleTreeMainView}
        treeToggleDisabled={m.treeToggleDisabled}
        onEnter={m.focusMain}
      />

      <MarcadoresSecondaryActions
        onNavigateUp={() => m.browseScope.setFolderId(null)}
        onAddBookmark={m.handleAdd}
        onNewFolder={() => b.setShowNewFolder(true)}
        onDeleteFocused={() => {
          const item = m.focusFlatList[pane.selectedIndex]
          if (item) b.setDeleteConfirmItem(item)
        }}
        hasFocusedItem={m.focusFlatList.length > 0 && !!m.focusFlatList[pane.selectedIndex]}
        selectMode={pane.selectMode}
        setSelectMode={b.setSelectMode}
        selectedIds={pane.selectedIds}
        setSelectedIds={b.setSelectedIds}
        folders={m.folders}
        onEdit={m.handleEdit}
        onDelete={m.onDelete}
        showNewFolder={pane.showNewFolder}
        setShowNewFolder={b.setShowNewFolder}
        newFolderName={pane.newFolderName}
        setNewFolderName={b.setNewFolderName}
        onCreateFolder={m.onCreateFolder}
        editingFolder={pane.editingFolder}
        setEditingFolder={b.setEditingFolder}
        renameFolderName={pane.renameFolderName}
        setRenameFolderName={b.setRenameFolderName}
        onRenameFolder={m.onRenameFolder}
        duplicateClusterCount={m.duplicateClusterCount}
        onExportJson={m.handleExportJson}
        onImportFile={m.handleImportFile}
      />

      {m.demoMode ? (
        <MarcadoresGlobalAlertLayer variant="stacked">
          <DemoBanner />
        </MarcadoresGlobalAlertLayer>
      ) : null}

      <MarcadoresBreadcrumb breadcrumb={m.breadcrumb} onSelect={m.browseScope.setFolderId} />
    </>
  )
}
