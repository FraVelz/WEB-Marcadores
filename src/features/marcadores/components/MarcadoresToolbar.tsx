"use client";

import type { GridItem } from "../types";
import ToolbarNavigationButtons from "./ToolbarNavigationButtons";
import ToolbarSearchSection from "./ToolbarSearchSection";
import ToolbarNewFolderSection from "./ToolbarNewFolderSection";
import ToolbarRenameFolderSection from "./ToolbarRenameFolderSection";
import ToolbarSelectActions from "./ToolbarSelectActions";

type Props = {
  showSearch: boolean;
  setShowSearch: (v: boolean | ((prev: boolean) => boolean)) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  showNewFolder: boolean;
  setShowNewFolder: (v: boolean) => void;
  newFolderName: string;
  setNewFolderName: (v: string) => void;
  editingFolder: { id: string; name: string } | null;
  setEditingFolder: (v: { id: string; name: string } | null) => void;
  renameFolderName: string;
  setRenameFolderName: (v: string) => void;
  onRenameFolder: () => void;
  onNavigateUp: () => void;
  onAddBookmark: () => void;
  onCreateFolder: () => void;
  selectMode: boolean;
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onEdit: () => void;
  onDelete: () => void;
  infoPanelEnabled: boolean;
  setInfoPanelEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
  flatList: GridItem[];
  selectedIndex: number;
  setDetailBookmark: (v: import("../types").Bookmark | null) => void;
};

export default function MarcadoresToolbar(props: Props) {
  const { flatList, selectedIndex } = props;
  const item = flatList[selectedIndex];

  const handleToggleInfoPanel = () => {
    props.setInfoPanelEnabled((prev) => {
      const next = !prev;
      if (next && item?.type === "link") props.setDetailBookmark(item.bookmark);
      else props.setDetailBookmark(null);
      return next;
    });
  };

  return (
    <div className="flex items-center gap-1 border-b border-zinc-700 bg-[#2d2d30] px-2 py-1">
      <ToolbarNavigationButtons
        onNavigateUp={props.onNavigateUp}
        onAddBookmark={props.onAddBookmark}
        onNewFolder={() => props.setShowNewFolder(true)}
        infoPanelEnabled={props.infoPanelEnabled}
        onToggleInfoPanel={handleToggleInfoPanel}
        showSearch={props.showSearch}
        onToggleSearch={() => props.setShowSearch((s) => !s)}
      />
      {props.showSearch && (
        <ToolbarSearchSection
          searchValue={props.searchValue}
          setSearchValue={props.setSearchValue}
          searchRef={props.searchRef}
        />
      )}
      {props.showNewFolder && (
        <ToolbarNewFolderSection
          newFolderName={props.newFolderName}
          setNewFolderName={props.setNewFolderName}
          onCreateFolder={props.onCreateFolder}
          onCancel={() => props.setShowNewFolder(false)}
        />
      )}
      {props.editingFolder && (
        <ToolbarRenameFolderSection
          folderName={props.renameFolderName}
          setFolderName={props.setRenameFolderName}
          onRename={props.onRenameFolder}
          onCancel={() => props.setEditingFolder(null)}
        />
      )}
      <ToolbarSelectActions
        selectMode={props.selectMode}
        setSelectMode={props.setSelectMode}
        selectedIds={props.selectedIds}
        setSelectedIds={props.setSelectedIds}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />
    </div>
  );
}
