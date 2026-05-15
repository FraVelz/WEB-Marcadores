"use client"

import type { ViewAst } from "@/features/marcadores/views/viewTypes"

import DemoBanner from "@/features/marcadores/components/DemoBanner"
import DeleteConfirmBanner from "@/features/marcadores/components/DeleteConfirmBanner"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import MarcadoresBrowseControls from "@/features/marcadores/components/MarcadoresBrowseControls"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"
import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { Bookmark, GridItem } from "@/features/marcadores/utils/types"

type BreadcrumbItem = { id: string | null; label: string }

export type MarcadoresPageStackedChromeProps = {
  showBreadcrumb: boolean
  demoMode: boolean
  pasteError: string | null
  deleteConfirmItem: GridItem | null
  onConfirmDelete: (item: GridItem) => void
  onCancelDelete: () => void
  browseMode: BrowseMode
  setBrowseMode: React.Dispatch<React.SetStateAction<BrowseMode>>
  activeViewAst: ViewAst | null
  setActiveViewAst: React.Dispatch<React.SetStateAction<ViewAst | null>>
  duplicateClusterCount: number
  breadcrumb: BreadcrumbItem[]
  onSelectBreadcrumb: (id: string | null) => void
  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  searchRef: React.RefObject<HTMLInputElement | null>
  focusMain: () => void
  showNewFolder: boolean
  setShowNewFolder: React.Dispatch<React.SetStateAction<boolean>>
  newFolderName: string
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>
  editingFolder: { id: string; name: string } | null
  setEditingFolder: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>
  renameFolderName: string
  setRenameFolderName: React.Dispatch<React.SetStateAction<string>>
  onRenameFolder: () => Promise<void>
  onNavigateExploreRoot: () => void
  handleAdd: () => void
  onDeleteFocused: () => void
  onCreateFolder: () => Promise<void>
  selectMode: boolean
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  handleEdit: () => void
  onDelete: () => Promise<void>
  infoPanelEnabled: boolean
  setInfoPanelEnabled: React.Dispatch<React.SetStateAction<boolean>>
  focusFlatList: GridItem[]
  selectedIndex: number
  setDetailBookmark: React.Dispatch<React.SetStateAction<Bookmark | null>>
  treeView: boolean
  onToggleTreeView?: () => void
  treeToggleDisabled: boolean
}

export function MarcadoresPageStackedChrome(props: MarcadoresPageStackedChromeProps) {
  const {
    showBreadcrumb,
    demoMode,
    pasteError,
    deleteConfirmItem,
    onConfirmDelete,
    onCancelDelete,
    browseMode,
    setBrowseMode,
    activeViewAst,
    setActiveViewAst,
    duplicateClusterCount,
    breadcrumb,
    onSelectBreadcrumb,
    showSearch,
    setShowSearch,
    searchValue,
    setSearchValue,
    searchRef,
    focusMain,
    showNewFolder,
    setShowNewFolder,
    newFolderName,
    setNewFolderName,
    editingFolder,
    setEditingFolder,
    renameFolderName,
    setRenameFolderName,
    onRenameFolder,
    onNavigateExploreRoot,
    handleAdd,
    onDeleteFocused,
    onCreateFolder,
    selectMode,
    setSelectMode,
    selectedIds,
    setSelectedIds,
    handleEdit,
    onDelete,
    infoPanelEnabled,
    setInfoPanelEnabled,
    focusFlatList,
    selectedIndex,
    setDetailBookmark,
    treeView,
    onToggleTreeView,
    treeToggleDisabled,
  } = props

  return (
    <>
      <MarcadoresToolbar
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchRef={searchRef}
        focusMain={focusMain}
        showNewFolder={showNewFolder}
        setShowNewFolder={setShowNewFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        editingFolder={editingFolder}
        setEditingFolder={setEditingFolder}
        renameFolderName={renameFolderName}
        setRenameFolderName={setRenameFolderName}
        onRenameFolder={onRenameFolder}
        onNavigateUp={onNavigateExploreRoot}
        onAddBookmark={handleAdd}
        onDeleteFocused={onDeleteFocused}
        onCreateFolder={onCreateFolder}
        selectMode={selectMode}
        setSelectMode={setSelectMode}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={handleEdit}
        onDelete={onDelete}
        infoPanelEnabled={infoPanelEnabled}
        setInfoPanelEnabled={setInfoPanelEnabled}
        flatList={focusFlatList}
        selectedIndex={selectedIndex}
        setDetailBookmark={setDetailBookmark}
        treeView={treeView}
        onToggleTreeView={onToggleTreeView}
        treeToggleDisabled={treeToggleDisabled}
      />

      <MarcadoresBrowseControls
        browseMode={browseMode}
        setBrowseMode={setBrowseMode}
        activeViewAst={activeViewAst}
        setActiveViewAst={setActiveViewAst}
        duplicateClusterCount={duplicateClusterCount}
      />

      {pasteError && <PasteErrorBanner message={pasteError} />}
      {deleteConfirmItem ? (
        <DeleteConfirmBanner
          item={deleteConfirmItem}
          onConfirm={() => onConfirmDelete(deleteConfirmItem)}
          onCancel={onCancelDelete}
        />
      ) : null}
      {demoMode && <DemoBanner />}

      {showBreadcrumb ? <MarcadoresBreadcrumb breadcrumb={breadcrumb} onSelect={onSelectBreadcrumb} /> : null}
    </>
  )
}
