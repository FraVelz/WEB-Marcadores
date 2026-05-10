"use client"

import type { GridItem } from "../utils/types"
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
  onEdit: () => void
  onDelete: () => void
  infoPanelEnabled: boolean
  setInfoPanelEnabled: (v: boolean | ((prev: boolean) => boolean)) => void
  flatList: GridItem[]
  selectedIndex: number
  setDetailBookmark: (v: import("../utils/types").Bookmark | null) => void
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
    <div className="border-app-border bg-app-toolbar flex flex-col gap-2 border-b px-2 py-1.5 md:flex-row md:flex-wrap md:items-center md:gap-x-1 md:gap-y-2 md:py-1">
      <div className="flex min-w-0 flex-wrap items-center gap-1 md:flex-nowrap">
        <ToolbarNavigationButtons
          onNavigateUp={props.onNavigateUp}
          onAddBookmark={props.onAddBookmark}
          onNewFolder={() => props.setShowNewFolder(true)}
          onDeleteFocused={props.onDeleteFocused}
          hasFocusedItem={!!item && flatList.length > 0}
          infoPanelEnabled={props.infoPanelEnabled}
          onToggleInfoPanel={handleToggleInfoPanel}
          showSearch={props.showSearch}
          onToggleSearch={() => props.setShowSearch((s) => !s)}
        />
        <ToolbarSelectActions
          selectMode={props.selectMode}
          setSelectMode={props.setSelectMode}
          selectedIds={props.selectedIds}
          setSelectedIds={props.setSelectedIds}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
        />
      </div>
      {props.showSearch && (
        <div className="min-w-0 w-full shrink-0 border-app-border-muted border-t pt-2 md:min-w-[12rem] md:flex-1 md:border-t-0 md:pt-0">
          <ToolbarSearchSection
            searchValue={props.searchValue}
            setSearchValue={props.setSearchValue}
            searchRef={props.searchRef}
            onEnter={props.focusMain}
          />
        </div>
      )}
      {props.showNewFolder && (
        <div className="border-app-border-muted w-full min-w-0 shrink-0 border-t pt-2 md:border-t-0 md:pt-0">
          <ToolbarNewFolderSection
            newFolderName={props.newFolderName}
            setNewFolderName={props.setNewFolderName}
            onCreateFolder={props.onCreateFolder}
            onCancel={() => props.setShowNewFolder(false)}
          />
        </div>
      )}
      {props.editingFolder && (
        <div className="border-app-border-muted w-full min-w-0 shrink-0 border-t pt-2 md:border-t-0 md:pt-0">
          <ToolbarRenameFolderSection
            folderName={props.renameFolderName}
            setFolderName={props.setRenameFolderName}
            onRename={props.onRenameFolder}
            onCancel={() => props.setEditingFolder(null)}
          />
        </div>
      )}
    </div>
  )
}
