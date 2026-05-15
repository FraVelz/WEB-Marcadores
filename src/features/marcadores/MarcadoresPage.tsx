"use client"

import { useEffect, useState, useCallback, useRef, useMemo } from "react"

import BookmarkModal from "@/components/BookmarkModal"
import BookmarkDetailPanel from "@/components/BookmarkDetailPanel"

import { useDashboard } from "@/contexts/DashboardContext"

import BookmarkGrid from "@/features/marcadores/components/BookmarkGrid"
import DemoBanner from "@/features/marcadores/components/DemoBanner"
import DeleteConfirmBanner from "@/features/marcadores/components/DeleteConfirmBanner"
import MarcadoresBreadcrumb from "@/features/marcadores/components/MarcadoresBreadcrumb"
import MarcadoresBrowseControls from "@/features/marcadores/components/MarcadoresBrowseControls"
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"
import MarcadoresToolbar from "@/features/marcadores/components/MarcadoresToolbar"
import MarcadoresTreeView, { type TreeFlatRow } from "@/features/marcadores/components/MarcadoresTreeView"
import MarcadoresZoneBoard from "@/features/marcadores/components/MarcadoresZoneBoard"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"

import { useMarcadoresActions } from "@/features/marcadores/hooks/useMarcadoresActions"
import { useMarcadoresData, type BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import { useMarcadoresEffects } from "@/features/marcadores/hooks/useMarcadoresEffects"
import { useMarcadoresKeyboard } from "@/features/marcadores/hooks/useMarcadoresKeyboard"
import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"
import { isFolderDescendant } from "@/features/marcadores/utils/utils"

import { MarcadoresDesktopLibraryPane } from "@/features/marcadores/desktop/MarcadoresDesktopLibraryPane"
import { MarcadoresDesktopShell } from "@/features/marcadores/desktop/MarcadoresDesktopShell"
import { buildDuplicateClusters } from "@/features/marcadores/insights/duplicateClusters"
import { useMinWidthMd } from "@/features/marcadores/hooks/useMinWidthMd"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"
import { isZonesLayout } from "@/features/marcadores/workspaces/workspaceLayout"
import { cn } from "@/lib/utils"

function workspacePrefsStorageKey(workspaceId: string) {
  return `marcadores_ws_prefs_${workspaceId}`
}

type StoredWorkspacePrefs = {
  browseMode?: BrowseMode
  activeViewAst?: ViewAst | null
}

function makeDeskLibWinId() {
  return `lib-${crypto.randomUUID().slice(0, 10)}`
}

export function MarcadoresPage() {
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
  const [bookmarkModalNonce, setBookmarkModalNonce] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid")
  const [browseMode, setBrowseMode] = useState<BrowseMode>("folder")
  const [activeViewAst, setActiveViewAst] = useState<ViewAst | null>(null)
  const [treeCollapsedIds, setTreeCollapsedIds] = useState<Set<string>>(() => new Set())
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const searchRef = useRef<HTMLInputElement>(null)

  const {
    demoMode,
    selectedFolderId,
    setSelectedFolderId,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    setMainKeyDown,
    focusMain,
    editFolderRef,
    workspaceLayout,
    persistWorkspaceLayout,
    registerMarcadoresRuntime,
    activeWorkspaceId,
  } = useDashboard()

  const dataOpts = useMemo(() => ({ browseMode, activeViewAst }), [browseMode, activeViewAst])

  const {
    bookmarks,
    setBookmarks,
    folders,
    setFolders,
    loading,
    fetchData,
    flatList,
    filteredBookmarks,
    breadcrumb,
    libraryMatchesSearch,
  } = useMarcadoresData(searchValue, selectedFolderId, setCtxFolders, refreshFolders, dataOpts)

  const {
    handleCreateFolder,
    handleRenameFolder,
    handleModalSubmit,
    handleDelete,
    handleDeleteFolder,
    handleBookmarkUpdate,
    handlePasteFolder,
    handlePasteLink,
    recordBookmarkOpened,
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

  const duplicateClusterCount = useMemo(() => buildDuplicateClusters(bookmarks).length, [bookmarks])

  const zonesBoard = !!(workspaceLayout && isZonesLayout(workspaceLayout))

  const zoneColumns = zonesBoard && workspaceLayout.template === "zones" ? workspaceLayout.columns : []

  const wideViewport = useMinWidthMd()
  const desktopWindowChrome = wideViewport && !zonesBoard

  const [deskLibWinIds, setDeskLibWinIds] = useState<string[]>(() => [makeDeskLibWinId()])
  const [focusedDeskLibId, setFocusedDeskLibId] = useState<string | null>(null)

  const resolvedDeskLibPaneId = useMemo(() => {
    if (focusedDeskLibId && deskLibWinIds.includes(focusedDeskLibId)) return focusedDeskLibId
    return deskLibWinIds[0] ?? null
  }, [deskLibWinIds, focusedDeskLibId])

  const addDeskLibraryWindow = useCallback(() => {
    const id = makeDeskLibWinId()
    setDeskLibWinIds((prev) => [...prev, id])
    queueMicrotask(() => setFocusedDeskLibId(id))
  }, [])

  const closeDeskLibraryWindow = useCallback((id: string) => {
    setDeskLibWinIds((prev) => (prev.length <= 1 ? prev : prev.filter((w) => w !== id)))
  }, [])

  const focusDeskLibraryPane = useCallback((id: string) => {
    setFocusedDeskLibId(id)
  }, [])

  const closeBookmarkDetailPanel = useCallback(() => {
    setDetailBookmark(null)
    setInfoPanelEnabled(false)
  }, [])

  const openBookmarkTab = useCallback(
    (b: Bookmark) => {
      window.open(b.url, "_blank", "noopener,noreferrer")
      void recordBookmarkOpened(b.id)
    },
    [recordBookmarkOpened]
  )

  useEffect(() => {
    registerMarcadoresRuntime({
      bookmarks: bookmarks.map((b) => ({ id: b.id, title: b.title, url: b.url })),
      recordBookmarkOpened,
    })
    return () => registerMarcadoresRuntime(null)
  }, [bookmarks, registerMarcadoresRuntime, recordBookmarkOpened])

  useEffect(() => {
    if (!activeWorkspaceId) return
    queueMicrotask(() => {
      try {
        const raw =
          typeof window !== "undefined" ? localStorage.getItem(workspacePrefsStorageKey(activeWorkspaceId)) : null
        if (!raw) return
        const parsed = JSON.parse(raw) as StoredWorkspacePrefs
        if (parsed.browseMode === "folder" || parsed.browseMode === "filter") setBrowseMode(parsed.browseMode)
        if ("activeViewAst" in parsed) setActiveViewAst(parsed.activeViewAst ?? null)
      } catch {
        /* ignore */
      }
    })
  }, [activeWorkspaceId])

  useEffect(() => {
    if (!activeWorkspaceId || typeof window === "undefined") return
    try {
      const payload: StoredWorkspacePrefs = { browseMode, activeViewAst }
      localStorage.setItem(workspacePrefsStorageKey(activeWorkspaceId), JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [activeWorkspaceId, browseMode, activeViewAst])

  useEffect(() => {
    queueMicrotask(() => {
      if ((browseMode === "filter" || zonesBoard) && viewMode === "tree") setViewMode("grid")
    })
  }, [browseMode, zonesBoard, viewMode])

  const treeFlatRows = useMemo((): TreeFlatRow[] => {
    const result: TreeFlatRow[] = []
    const walk = (parentId: string | null, depth: number) => {
      const subfolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
      const links = filteredBookmarks
        .filter((b) => (b.folder_id || null) === parentId)
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      for (const f of subfolders) {
        result.push({
          item: { type: "folder", id: f.id, folderId: f.id, label: f.name },
          depth,
        })
        if (!treeCollapsedIds.has(f.id)) walk(f.id, depth + 1)
      }
      for (const b of links) {
        result.push({ item: { type: "link", bookmark: b }, depth })
      }
    }
    walk(null, 0)
    return result
  }, [folders, filteredBookmarks, treeCollapsedIds])

  const primaryViewMode = browseMode === "filter" ? "grid" : viewMode
  const focusFlatList = primaryViewMode === "tree" ? treeFlatRows.map((r) => r.item) : flatList

  const handleZonesReorder = useCallback(
    async (cols: typeof zoneColumns) => {
      if (!workspaceLayout || workspaceLayout.template !== "zones") return
      await persistWorkspaceLayout({
        template: "zones",
        columns: cols,
        revision: workspaceLayout.revision ?? 1,
      })
    },
    [persistWorkspaceLayout, workspaceLayout]
  )

  const toggleTreeFolderCollapse = useCallback((folderId: string) => {
    setTreeCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      if (searchValue.trim()) setTreeCollapsedIds(new Set())
    })
  }, [searchValue])

  useEffect(() => {
    queueMicrotask(() => {
      itemRefs.current.clear()
      setSelectedIndex(0)
    })
  }, [viewMode])

  useEffect(() => {
    queueMicrotask(() => {
      if (primaryViewMode !== "tree") return
      setSelectedIndex((i) => {
        const max = Math.max(0, treeFlatRows.length - 1)
        return Math.min(Math.max(0, i), max)
      })
    })
  }, [primaryViewMode, treeFlatRows])

  const handleAdd = useCallback(() => {
    setBookmarkModalNonce((n) => n + 1)
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
    flatList: focusFlatList,
    selectedIndex,
    totalCount: focusFlatList.length,
    gridCols: primaryViewMode === "tree" ? 1 : gridCols,
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
    openBookmarkTab,
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

  const noopKeyboardHandler = useCallback((e: React.KeyboardEvent) => {
    void e
  }, [])
  const effectiveKeyDown = zonesBoard ? noopKeyboardHandler : handleKeyDown

  useMarcadoresEffects({
    searchValue,
    selectedFolderId,
    selectedIndex,
    flatList: focusFlatList,
    infoPanelEnabled,
    modalOpen,
    pasteError,
    setSelectedIndex,
    setGridCols,
    setDetailBookmark,
    setPasteError,
    setShowSearch,
    setMainKeyDown,
    handleKeyDown: effectiveKeyDown,
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
      else openBookmarkTab(item.bookmark)
    },
    [selectMode, openBookmarkTab, setSelectedFolderId]
  )

  const handleDrop = useCallback(
    (sourceItem: GridItem, targetFolderId?: string | null) => {
      const destId = targetFolderId === undefined ? selectedFolderId : targetFolderId
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

  const treeToggleDisabled = zonesBoard || browseMode !== "folder"

  const toggleTreeMainView = () => setViewMode((m) => (m === "grid" ? "tree" : "grid"))

  const desktopFloatingOverlays = desktopWindowChrome ? (
    <>
      {pasteError && <PasteErrorBanner message={pasteError} />}
      {deleteConfirmItem && (
        <DeleteConfirmBanner
          item={deleteConfirmItem}
          onConfirm={() => onConfirmDelete(deleteConfirmItem)}
          onCancel={() => setDeleteConfirmItem(null)}
        />
      )}
      {demoMode && <DemoBanner />}
    </>
  ) : null

  if (loading) return <div className="text-app-fg-label flex flex-1 items-center justify-center">Cargando…</div>

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!desktopWindowChrome ? (
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
            onNavigateUp={() => setSelectedFolderId(null)}
            onAddBookmark={handleAdd}
            onDeleteFocused={() => {
              const item = focusFlatList[selectedIndex]
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
            flatList={focusFlatList}
            selectedIndex={selectedIndex}
            setDetailBookmark={setDetailBookmark}
            treeView={viewMode === "tree"}
            onToggleTreeView={treeToggleDisabled ? undefined : toggleTreeMainView}
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
          {deleteConfirmItem && (
            <DeleteConfirmBanner
              item={deleteConfirmItem}
              onConfirm={() => onConfirmDelete(deleteConfirmItem)}
              onCancel={() => setDeleteConfirmItem(null)}
            />
          )}
          {demoMode && <DemoBanner />}

          {!zonesBoard && <MarcadoresBreadcrumb breadcrumb={breadcrumb} onSelect={setSelectedFolderId} />}
        </>
      ) : null}

      <div
        className={cn(
          "relative flex min-h-0 flex-1 overflow-hidden",
          desktopWindowChrome ? "flex-col" : "flex-col md:flex-row"
        )}
      >
        {zonesBoard ? (
          <MarcadoresZoneBoard
            pool={libraryMatchesSearch}
            columns={zoneColumns}
            selectMode={selectMode}
            selectedIds={selectedIds}
            cutItem={cutItem}
            onToggleSelect={toggleSelect}
            onOpenBookmark={openBookmarkTab}
            onColumnsReorder={(cols) => void handleZonesReorder(cols)}
          />
        ) : desktopWindowChrome ? (
          <MarcadoresDesktopShell
            key={activeWorkspaceId ?? "default"}
            workspaceId={activeWorkspaceId}
            libraryWindowIds={deskLibWinIds}
            setLibraryWindowIds={setDeskLibWinIds}
            onAddLibraryWindow={addDeskLibraryWindow}
            focusedLibraryPaneId={resolvedDeskLibPaneId}
            onFocusLibraryPane={focusDeskLibraryPane}
            floatingOverlays={desktopFloatingOverlays}
            onRequestCloseLibraryWindow={closeDeskLibraryWindow}
            detailOpen={Boolean(detailBookmark)}
            detailTitle={detailBookmark?.title}
            onCloseDetail={closeBookmarkDetailPanel}
            detailContent={
              detailBookmark ? (
                <BookmarkDetailPanel
                  bookmark={detailBookmark}
                  onClose={closeBookmarkDetailPanel}
                  onTelemetryOpen={recordBookmarkOpened}
                  onUpdate={onBookmarkUpdate}
                  allTags={allTags}
                  folders={folders}
                  embedded
                  omitEmbeddedHeader
                />
              ) : null
            }
            renderLibraryPane={(_winId, focused) => (
              <MarcadoresDesktopLibraryPane
                paneId={_winId}
                focused={focused}
                parentItemRefs={itemRefs}
                onRequestFocusPane={focusDeskLibraryPane}
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
                  const item = focusFlatList[selectedIndex]
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
                flatList={focusFlatList}
                selectedIndex={selectedIndex}
                setDetailBookmark={setDetailBookmark}
                treeView={viewMode === "tree"}
                onToggleTreeView={treeToggleDisabled ? undefined : toggleTreeMainView}
                treeToggleDisabled={treeToggleDisabled}
                browseMode={browseMode}
                setBrowseMode={setBrowseMode}
                activeViewAst={activeViewAst}
                setActiveViewAst={setActiveViewAst}
                duplicateClusterCount={duplicateClusterCount}
                breadcrumb={breadcrumb}
                onSelectBreadcrumb={setSelectedFolderId}
                primaryViewMode={primaryViewMode}
                flatListGrid={flatList}
                treeFlatRows={treeFlatRows}
                folders={folders}
                filteredBookmarks={filteredBookmarks}
                selectedIndexGrid={selectedIndex}
                onSelectIndex={setSelectedIndex}
                cutItem={cutItem}
                onToggleSelect={toggleSelect}
                onDoubleClick={handleDoubleClick}
                onDrop={handleDrop}
                onToggleFolderCollapse={toggleTreeFolderCollapse}
                treeCollapsedIds={treeCollapsedIds}
                currentLocationLabel={breadcrumb.map((p) => p.label).join(" › ")}
              />
            )}
          />
        ) : (
          <>
            {primaryViewMode === "grid" ? (
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
            ) : (
              <MarcadoresTreeView
                folders={folders}
                bookmarks={filteredBookmarks}
                rows={treeFlatRows}
                selectedIndex={selectedIndex}
                selectMode={selectMode}
                selectedIds={selectedIds}
                cutItem={cutItem}
                onSelectIndex={setSelectedIndex}
                onToggleSelect={toggleSelect}
                onDoubleClick={handleDoubleClick}
                onDrop={handleDrop}
                onToggleFolderCollapse={toggleTreeFolderCollapse}
                collapsedIds={treeCollapsedIds}
                onAddBookmark={handleAdd}
                onNewFolder={() => setShowNewFolder(true)}
                itemRefs={itemRefs}
                currentLocationLabel={breadcrumb.map((p) => p.label).join(" › ")}
              />
            )}
            {detailBookmark ? (
              <BookmarkDetailPanel
                bookmark={detailBookmark}
                onClose={closeBookmarkDetailPanel}
                onTelemetryOpen={recordBookmarkOpened}
                onUpdate={onBookmarkUpdate}
                allTags={allTags}
                folders={folders}
                embedded
              />
            ) : null}
          </>
        )}
      </div>

      {zonesBoard ? (
        <MarcadoresFooter
          variant="zones"
          poolCount={libraryMatchesSearch.length}
          flatList={focusFlatList}
          selectedIndex={selectedIndex}
        />
      ) : !desktopWindowChrome ? (
        <MarcadoresFooter flatList={focusFlatList} selectedIndex={selectedIndex} />
      ) : null}

      {modalOpen && (
        <BookmarkModal
          key={editingBookmark?.id ?? `new-${bookmarkModalNonce}`}
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
      )}
    </div>
  )
}
