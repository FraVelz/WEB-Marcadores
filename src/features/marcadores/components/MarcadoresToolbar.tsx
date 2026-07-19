"use client"

import type { FlatFolder, GridItem } from "../utils/types"
import ToolbarNavigationButtons from "./ToolbarNavigationButtons"
import ToolbarSearchSection from "./ToolbarSearchSection"
import ToolbarNewFolderSection from "./ToolbarNewFolderSection"
import ToolbarRenameFolderSection from "./ToolbarRenameFolderSection"
import ToolbarSelectActions from "./ToolbarSelectActions"

type Props = {
  showSearch: boolean
  setShowSearch: (v: boolean | ((prev: boolean) => boolean)) => void
  searchValue: string
  setSearchValue: (v: string) => void
  searchInSubfolders: boolean
  setSearchInSubfolders: (v: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (v: boolean) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  focusMain?: () => void
  showNewFolder: boolean
  setShowNewFolder: (v: boolean) => void
  newFolderName: string
  setNewFolderName: (v: string) => void
  editingFolder: { id: string; name: string } | null
  setEditingFolder: (v: { id: string; name: string } | null) => void
  renameFolderName: string
  setRenameFolderName: (v: string) => void
  onRenameFolder: () => void
  onNavigateUp: () => void
  onAddBookmark: () => void
  onDeleteFocused?: () => void
  onCreateFolder: () => void
  selectMode: boolean
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  folders?: FlatFolder[]
  onEdit: () => void
  onDelete: () => void
  infoPanelEnabled: boolean
  setInfoPanelEnabled: (v: boolean | ((prev: boolean) => boolean)) => void
  flatList: GridItem[]
  selectedIndex: number
  setDetailBookmark: (v: import("../utils/types").Bookmark | null) => void
  treeView?: boolean
  onToggleTreeView?: () => void
  treeToggleDisabled?: boolean
  /** false en ventanas del escritorio (el toggle vive en MarcadoresDesktopLayoutBar). */
  showFullscreenToggle?: boolean
  duplicateClusterCount?: number
}

export default function MarcadoresToolbar(props: Props) {
  const { flatList, selectedIndex } = props
  const item = flatList[selectedIndex]

  const handleToggleInfoPanel = () => {
    props.setInfoPanelEnabled((prev) => {
      const next = !prev
      if (next && item?.type === "link") props.setDetailBookmark(item.bookmark)
      else props.setDetailBookmark(null)
      return next
    })
  }

  return (
    <div className="border-app-border bg-app-toolbar flex flex-col gap-2 border-b px-2 py-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1 md:flex-nowrap">
          <ToolbarNavigationButtons
            onNavigateUp={props.onNavigateUp}
            onAddBookmark={props.onAddBookmark}
            onNewFolder={() => props.setShowNewFolder(true)}
            onDeleteFocused={props.onDeleteFocused}
            onRenameFocused={
              item?.type === "folder"
                ? () => {
                    props.setEditingFolder({ id: item.id, name: item.label })
                    props.setRenameFolderName(item.label)
                  }
                : undefined
            }
            hasFocusedItem={!!item && flatList.length > 0}
            focusedIsFolder={item?.type === "folder"}
            infoPanelEnabled={props.infoPanelEnabled}
            onToggleInfoPanel={handleToggleInfoPanel}
            showSearch={props.showSearch}
            onToggleSearch={() => props.setShowSearch((s) => !s)}
            treeView={props.treeView}
            onToggleTreeView={props.onToggleTreeView}
            treeToggleDisabled={props.treeToggleDisabled}
            showFullscreenToggle={props.showFullscreenToggle}
          />
          <ToolbarSelectActions
            selectMode={props.selectMode}
            setSelectMode={props.setSelectMode}
            selectedIds={props.selectedIds}
            setSelectedIds={props.setSelectedIds}
            folders={props.folders}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        </div>
        {props.duplicateClusterCount != null && props.duplicateClusterCount > 0 ? (
          <p className="text-app-fg-muted ml-auto shrink-0 text-[11px]">
            Posibles duplicados: <span className="text-app-accent font-medium">{props.duplicateClusterCount}</span>
          </p>
        ) : null}
      </div>
      {props.showSearch ? (
        <div className="border-app-border-muted w-full min-w-0 border-t pt-2">
          <ToolbarSearchSection
            searchValue={props.searchValue}
            setSearchValue={props.setSearchValue}
            searchInSubfolders={props.searchInSubfolders}
            setSearchInSubfolders={props.setSearchInSubfolders}
            searchInDescription={props.searchInDescription}
            setSearchInDescription={props.setSearchInDescription}
            searchRef={props.searchRef}
            onEnter={props.focusMain}
          />
        </div>
      ) : null}
      {props.showNewFolder ? (
        <div className="border-app-border-muted w-full min-w-0 border-t pt-2">
          <ToolbarNewFolderSection
            newFolderName={props.newFolderName}
            setNewFolderName={props.setNewFolderName}
            onCreateFolder={props.onCreateFolder}
            onCancel={() => props.setShowNewFolder(false)}
          />
        </div>
      ) : null}
      {props.editingFolder ? (
        <div className="border-app-border-muted w-full min-w-0 border-t pt-2">
          <ToolbarRenameFolderSection
            folderName={props.renameFolderName}
            setFolderName={props.setRenameFolderName}
            onRename={props.onRenameFolder}
            onCancel={() => props.setEditingFolder(null)}
          />
        </div>
      ) : null}
    </div>
  )
}
