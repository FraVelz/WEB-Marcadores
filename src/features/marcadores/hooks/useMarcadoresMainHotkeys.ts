"use client"

import { useRef, type RefObject } from "react"

import { handleMarcadoresKeyDown } from "@/features/marcadores/hooks/marcadoresKeyboardHandler"
import type { MarcadoresKeyboardContext } from "@/features/marcadores/hooks/marcadoresKeyboard.types"
import { MARCADORES_MAIN_HOTKEYS } from "@/lib/hotkeys"
import { useHotkeysOnElement } from "@/lib/hotkeys/useHotkeysOnElement"

export type Params = Omit<MarcadoresKeyboardContext, "lastKeyRef"> & {
  mainRef: RefObject<HTMLElement | null>
  enabled?: boolean
}

export function useMarcadoresMainHotkeys(params: Params) {
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)

  const {
    mainRef,
    enabled = true,
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

  useHotkeysOnElement(
    mainRef,
    MARCADORES_MAIN_HOTKEYS,
    (event) => {
      handleMarcadoresKeyDown(event, {
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
      })
    },
    { enabled },
    [
      enabled,
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
