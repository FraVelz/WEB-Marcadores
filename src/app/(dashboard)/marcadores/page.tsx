"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useDashboard } from "@/contexts/DashboardContext"
import BookmarkModal from "@/components/BookmarkModal"
import BookmarkDetailPanel from "@/components/BookmarkDetailPanel"
import { useMarcadoresData } from "@/features/marcadores/hooks/useMarcadoresData"
import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresKeyboard } from "@/features/marcadores/hooks/useMarcadoresKeyboard"
import { useMarcadoresEffects } from "@/features/marcadores/hooks/useMarcadoresEffects"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"
import DemoBanner from "@/features/marcadores/components/DemoBanner"
import DeleteConfirmBanner from "@/features/marcadores/components/DeleteConfirmBanner"
import { isDemoMode } from "@/lib/supabase/client"
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"
import { isFolderDescendant } from "@/features/marcadores/utils"
import type { Bookmark, GridItem, CutItem } from "@/features/marcadores/types"

export default function MarcadoresPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [detailBookmark, setDetailBookmark] = useState<Bookmark | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [infoPanelEnabled, setInfoPanelEnabled] = useState(true)
  const [gridCols, setGridCols] = useState(3)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)
  const [renameFolderName, setRenameFolderName] = useState("")
  const [cutItem, setCutItem] = useState<CutItem | null>(null)
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GridItem | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const searchRef = useRef<HTMLInputElement>(null)

  const {
    selectedFolderId,
    setSelectedFolderId,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    setMainKeyDown,
    focusMain,
    editFolderRef,
  } = useDashboard()

  const { bookmarks, setBookmarks, folders, setFolders, loading, fetchData, flatList, breadcrumb } = useMarcadoresData(
    searchValue,
    selectedFolderId,
    setCtxFolders,
    refreshFolders
  )

  const {
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleDeleteFolder,
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
  })

  const handleAdd = useCallback(() => {
    setEditingBookmark(null)
    setModalOpen(true)
  }, [])

  const onConfirmDelete = useCallback(
    async (item: GridItem) => {
      if (item.type === "folder") {
        await handleDeleteFolder(item.id)
      } else {
        await handleDelete(new Set([item.bookmark.id]), setSelectedIds, setSelectMode)
      }
      setSelectedIndex(0)
    },
    [handleDelete, handleDeleteFolder]
  )

  const handleKeyDown = useMarcadoresKeyboard({
    breadcrumb,
    deleteConfirmItem,
    setDeleteConfirmItem,
    onConfirmDelete,
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
        setEditingBookmark(item.bookmark)
        setModalOpen(true)
      } else {
        setEditingFolder({ id: item.id, name: item.label })
        setRenameFolderName(item.label)
      }
    },
  })

  useEffect(() => {
    editFolderRef.current = (id: string, name: string) => {
      setEditingFolder({ id, name })
      setRenameFolderName(name)
    }
    return () => {
      editFolderRef.current = null
    }
  }, [editFolderRef])

  useMarcadoresEffects({
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
    searchRef,
  })

  const onCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    await handleCreateFolder(newFolderName)
    setNewFolderName("")
    setShowNewFolder(false)
  }, [newFolderName, handleCreateFolder])

  const handleEdit = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (ids.length === 1) {
      const b = bookmarks.find((x) => x.id === ids[0])
      if (b) {
        setEditingBookmark(b)
        setModalOpen(true)
      }
    }
  }, [selectedIds, bookmarks])

  const onModalSubmit = useCallback(
    async (data: import("@/components/BookmarkModal").BookmarkFormData) => {
      await handleModalSubmit(data, editingBookmark)
      setEditingBookmark(null)
    },
    [handleModalSubmit, editingBookmark]
  )

  const onDelete = useCallback(async () => {
    await handleDelete(selectedIds, setSelectedIds, setSelectMode)
  }, [handleDelete, selectedIds])

  const onBookmarkUpdate = useCallback(
    async (id: string, updates: Partial<Bookmark>) => {
      await handleBookmarkUpdate(id, updates, detailBookmark)
    },
    [handleBookmarkUpdate, detailBookmark]
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const onRenameFolder = useCallback(async () => {
    if (!editingFolder || !renameFolderName.trim()) return
    await handleRenameFolder(editingFolder.id, renameFolderName)
    setEditingFolder(null)
    setRenameFolderName("")
  }, [editingFolder, renameFolderName, handleRenameFolder])

  const handleDoubleClick = useCallback(
    (item: GridItem) => {
      if (selectMode) return
      if (item.type === "folder") setSelectedFolderId(item.folderId)
      else window.open(item.bookmark.url, "_blank")
    },
    [selectMode, setSelectedFolderId]
  )

  const handleDrop = useCallback(
    (sourceItem: GridItem, targetFolderId: string | null) => {
      const destId = targetFolderId ?? selectedFolderId
      setPasteError(null)
      if (sourceItem.type === "folder") {
        if (destId === sourceItem.id) return
        const sameName = folders.some(
          (f) =>
            (f.parent_id || null) === destId &&
            f.name.toLowerCase() === sourceItem.label.toLowerCase() &&
            f.id !== sourceItem.id
        )
        if (sameName) {
          setPasteError("Ya existe una carpeta con ese nombre en el destino")
          return
        }
        if (destId === sourceItem.id || (destId && isFolderDescendant(folders, destId, sourceItem.id))) {
          setPasteError("No se puede mover una carpeta dentro de sí misma o de sus subcarpetas")
          return
        }
        handlePasteFolder(sourceItem.id, destId)
      } else {
        const sameUrl = bookmarks.some(
          (b) =>
            (b.folder_id || null) === destId && b.url === sourceItem.bookmark.url && b.id !== sourceItem.bookmark.id
        )
        if (sameUrl) {
          setPasteError("Ya existe un enlace con esa URL en el destino")
          return
        }
        handlePasteLink(sourceItem.bookmark.id, destId)
      }
    },
    [selectedFolderId, folders, bookmarks, handlePasteFolder, handlePasteLink, setPasteError]
  )

  if (loading) return <div className="flex flex-1 items-center justify-center text-zinc-500">Cargando...</div>

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
        onNavigateUp={() => setSelectedFolderId(null)}
        onAddBookmark={handleAdd}
        onDeleteFocused={() => {
          const item = flatList[selectedIndex]
          if (item) setDeleteConfirmItem(item)
        }}
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
      {deleteConfirmItem && (
        <DeleteConfirmBanner
          item={deleteConfirmItem}
          onConfirm={() => onConfirmDelete(deleteConfirmItem)}
          onCancel={() => setDeleteConfirmItem(null)}
        />
      )}
      {isDemoMode() && <DemoBanner />}

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
          onDrop={handleDrop}
          onAddBookmark={handleAdd}
          onNewFolder={() => setShowNewFolder(true)}
          itemRefs={itemRefs}
        />

        {detailBookmark && (
          <BookmarkDetailPanel
            bookmark={detailBookmark}
            onClose={() => {
              setDetailBookmark(null)
              setInfoPanelEnabled(false)
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
          setModalOpen(false)
          setEditingBookmark(null)
          requestAnimationFrame(() => focusMain())
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
  )
}
