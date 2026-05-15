"use client"

import { useCallback, useRef } from "react"

import { handleMarcadoresKeyDown } from "./marcadoresKeyboardHandler"
import type { MarcadoresKeyboardContext } from "./marcadoresKeyboard.types"

export type Params = Omit<MarcadoresKeyboardContext, "lastKeyRef">

export function useMarcadoresKeyboard(params: Params) {
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)

  const {
    breadcrumb,
    deleteConfirmItem,
    setDeleteConfirmItem,
    onConfirmDelete,
    flatList,
    selectedIndex,
    totalCount,
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
    onAddBookmark,
    onNewFolder,
    onEditItem,
    openBookmarkTab,
  } = params

  return useCallback(
    (e: React.KeyboardEvent) =>
      handleMarcadoresKeyDown(e, {
        lastKeyRef,
        breadcrumb,
        deleteConfirmItem,
        setDeleteConfirmItem,
        onConfirmDelete,
        flatList,
        selectedIndex,
        totalCount,
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
        onAddBookmark,
        onNewFolder,
        onEditItem,
        openBookmarkTab,
      }),
    [
      breadcrumb,
      deleteConfirmItem,
      setDeleteConfirmItem,
      onConfirmDelete,
      flatList,
      selectedIndex,
      totalCount,
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
      onAddBookmark,
      onNewFolder,
      onEditItem,
      openBookmarkTab,
    ]
  )
}
