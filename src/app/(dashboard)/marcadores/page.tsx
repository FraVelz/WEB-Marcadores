"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import BookmarkModal from "@/components/BookmarkModal";
import BookmarkDetailPanel from "@/components/BookmarkDetailPanel";
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData";
import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions";
import { useMarcadoresKeyboard } from "@/features/marcadores/hooks/useMarcadoresKeyboard";
import { useMarcadoresEffects } from "@/features/marcadores/hooks/useMarcadoresEffects";
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar";
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb";
import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid";
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner";
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter";
import type { Bookmark, GridItem, CutItem } from "@/features/marcadores/types";

export default function MarcadoresPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [detailBookmark, setDetailBookmark] = useState<Bookmark | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [infoPanelEnabled, setInfoPanelEnabled] = useState(true);
  const [gridCols, setGridCols] = useState(3);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [cutItem, setCutItem] = useState<CutItem | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const filterRef = useRef<HTMLInputElement>(null);

  const {
    filterValue,
    setFilterValue,
    searchValue,
    setSearchValue,
    selectedFolderId,
    setSelectedFolderId,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    setMainKeyDown,
    searchRef,
    focusMain,
    editFolderRef,
  } = useDashboard();

  const { bookmarks, setBookmarks, folders, setFolders, loading, fetchData, flatList, breadcrumb } =
    useMarcadoresData(
      filterValue,
      searchValue,
      selectedFolderId,
      setCtxFolders,
      refreshFolders
    );

  const {
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleBookmarkUpdate,
    handlePasteFolder,
    handlePasteLink,
  } = useMarcadoresActions({
    bookmarks,
    setBookmarks,
    folders,
    setFolders,
    setCtxFolders,
    refreshFolders,
    refreshTags,
    fetchData,
    selectedFolderId,
    setDetailBookmark,
  });

  const handleAdd = useCallback(() => {
    setEditingBookmark(null);
    setModalOpen(true);
  }, []);

  const handleKeyDown = useMarcadoresKeyboard({
    flatList,
    selectedIndex,
    totalCount: flatList.length,
    gridCols,
    selectMode,
    selectedFolderId,
    folders,
    bookmarks,
    cutItem,
    setCutItem,
    setPasteError,
    setSelectedIds,
    setSelectedIndex,
    setSelectedFolderId,
    setInfoPanelEnabled,
    setDetailBookmark,
    handlePasteFolder,
    handlePasteLink,
    onAddBookmark: handleAdd,
    onNewFolder: () => setShowNewFolder(true),
    onEditItem: (item) => {
      if (item.type === "link") {
        setEditingBookmark(item.bookmark);
        setModalOpen(true);
      } else {
        setEditingFolder({ id: item.id, name: item.label });
        setRenameFolderName(item.label);
      }
    },
  });

  useEffect(() => {
    editFolderRef.current = (id: string, name: string) => {
      setEditingFolder({ id, name });
      setRenameFolderName(name);
    };
    return () => {
      editFolderRef.current = null;
    };
  }, [editFolderRef]);

  useMarcadoresEffects({
    filterValue,
    searchValue,
    selectedFolderId,
    selectedIndex,
    flatList,
    infoPanelEnabled,
    modalOpen,
    pasteError,
    setSelectedIndex,
    setGridCols,
    setDetailBookmark,
    setPasteError,
    setShowSearch,
    setMainKeyDown,
    handleKeyDown,
    itemRefs,
    filterRef,
    searchRef,
  });

  const onCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    await handleCreateFolder(newFolderName);
    setNewFolderName("");
    setShowNewFolder(false);
  }, [newFolderName, handleCreateFolder]);

  const handleEdit = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 1) {
      const b = bookmarks.find((x) => x.id === ids[0]);
      if (b) {
        setEditingBookmark(b);
        setModalOpen(true);
      }
    }
  }, [selectedIds, bookmarks]);

  const onModalSubmit = useCallback(
    async (data: import("@/components/BookmarkModal").BookmarkFormData) => {
      await handleModalSubmit(data, editingBookmark);
      setEditingBookmark(null);
    },
    [handleModalSubmit, editingBookmark]
  );

  const onDelete = useCallback(async () => {
    await handleDelete(selectedIds, setSelectedIds, setSelectMode);
  }, [handleDelete, selectedIds]);

  const onBookmarkUpdate = useCallback(
    async (id: string, updates: Partial<Bookmark>) => {
      await handleBookmarkUpdate(id, updates, detailBookmark);
    },
    [handleBookmarkUpdate, detailBookmark]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onRenameFolder = useCallback(async () => {
    if (!editingFolder || !renameFolderName.trim()) return;
    await handleRenameFolder(editingFolder.id, renameFolderName);
    setEditingFolder(null);
    setRenameFolderName("");
  }, [editingFolder, renameFolderName, handleRenameFolder]);

  const handleDoubleClick = useCallback(
    (item: GridItem) => {
      if (selectMode) return;
      if (item.type === "folder") setSelectedFolderId(item.folderId);
      else window.open(item.bookmark.url, "_blank");
    },
    [selectMode, setSelectedFolderId]
  );

  if (loading) return <div className="flex flex-1 items-center justify-center text-zinc-500">Cargando...</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MarcadoresToolbar
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        allTags={allTags}
        focusMain={focusMain}
        searchRef={searchRef}
        filterRef={filterRef}
        showNewFolder={showNewFolder}
        setShowNewFolder={setShowNewFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        editingFolder={editingFolder}
        setEditingFolder={setEditingFolder}
        renameFolderName={renameFolderName}
        setRenameFolderName={setRenameFolderName}
        onRenameFolder={onRenameFolder}
        onNavigateUp={() => setSelectedFolderId(null)}
        onAddBookmark={handleAdd}
        onCreateFolder={onCreateFolder}
        selectMode={selectMode}
        setSelectMode={setSelectMode}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={handleEdit}
        onDelete={onDelete}
        infoPanelEnabled={infoPanelEnabled}
        setInfoPanelEnabled={setInfoPanelEnabled}
        flatList={flatList}
        selectedIndex={selectedIndex}
        setDetailBookmark={setDetailBookmark}
      />

      {pasteError && <PasteErrorBanner message={pasteError} />}

      <MarcadoresBreadcrumb breadcrumb={breadcrumb} onSelect={setSelectedFolderId} />

      <div className="flex flex-1 overflow-hidden">
        <BookmarkGrid
          flatList={flatList}
          selectedIndex={selectedIndex}
          selectMode={selectMode}
          selectedIds={selectedIds}
          cutItem={cutItem}
          onSelectIndex={setSelectedIndex}
          onToggleSelect={toggleSelect}
          onDoubleClick={handleDoubleClick}
          onAddBookmark={handleAdd}
          onNewFolder={() => setShowNewFolder(true)}
          itemRefs={itemRefs}
        />

        {detailBookmark && (
          <BookmarkDetailPanel
            bookmark={detailBookmark}
            onClose={() => {
              setDetailBookmark(null);
              setInfoPanelEnabled(false);
            }}
            onUpdate={onBookmarkUpdate}
            allTags={allTags}
            folders={folders}
            embedded
          />
        )}
      </div>

      <MarcadoresFooter flatList={flatList} selectedIndex={selectedIndex} />

      <BookmarkModal
        key={editingBookmark?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBookmark(null);
        }}
        onSubmit={onModalSubmit}
        initialData={
          editingBookmark
            ? {
                title: editingBookmark.title,
                url: editingBookmark.url,
                description: editingBookmark.description || "",
                folder_id: editingBookmark.folder_id || "",
                tags: editingBookmark.tags?.join(", ") || "",
              }
            : null
        }
        allTags={allTags}
        folders={folders}
        currentFolderId={selectedFolderId}
      />
    </div>
  );
}
