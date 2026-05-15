"use client"

import { useRef, useState } from "react"

import type { BrowseMode } from "@/features/marcadores/hooks/useMarcadoresData"
import type { Bookmark, CutItem, GridItem } from "@/features/marcadores/utils/types"
import type { ViewAst } from "@/features/marcadores/views/viewTypes"

export function useMarcadoresPageUiState() {
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

  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const searchRef = useRef<HTMLInputElement>(null)

  return {
    selectedIndex,
    setSelectedIndex,
    selectMode,
    setSelectMode,
    selectedIds,
    setSelectedIds,
    modalOpen,
    setModalOpen,
    editingBookmark,
    setEditingBookmark,
    detailBookmark,
    setDetailBookmark,
    showSearch,
    setShowSearch,
    infoPanelEnabled,
    setInfoPanelEnabled,
    gridCols,
    setGridCols,
    newFolderName,
    setNewFolderName,
    showNewFolder,
    setShowNewFolder,
    editingFolder,
    setEditingFolder,
    renameFolderName,
    setRenameFolderName,
    cutItem,
    setCutItem,
    pasteError,
    setPasteError,
    deleteConfirmItem,
    setDeleteConfirmItem,
    searchValue,
    setSearchValue,
    bookmarkModalNonce,
    setBookmarkModalNonce,
    viewMode,
    setViewMode,
    browseMode,
    setBrowseMode,
    activeViewAst,
    setActiveViewAst,
    itemRefs,
    searchRef,
  }
}
