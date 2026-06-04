"use client"

import { applyMarcadoresBrowseNavigationKeys } from "./marcadoresKeyboardNavigation"
import { pasteCutFromKeyboard } from "./marcadoresKeyboardPaste"
import type { MarcadoresKeyboardContext } from "./marcadoresKeyboard.types"

const DD_TIMEOUT_MS = 400

export function handleMarcadoresKeyDown(e: KeyboardEvent, ctx: MarcadoresKeyboardContext) {
  const {
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
  } = ctx

  const active = document.activeElement
  if (
    active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      (active as HTMLElement).closest?.('[role="dialog"]'))
  )
    return

  if (deleteConfirmItem) {
    if (e.key === "Enter") {
      e.preventDefault()
      onConfirmDelete(deleteConfirmItem)
      setDeleteConfirmItem(null)
    }
    if (e.key === "Escape") {
      e.preventDefault()
      setDeleteConfirmItem(null)
    }
    return
  }

  if (e.key === "d" && !e.ctrlKey && !e.metaKey && !e.altKey && totalCount > 0) {
    const item = flatList[selectedIndex]
    const now = Date.now()
    const prev = lastKeyRef.current
    if (prev?.key === "d" && now - prev.time < DD_TIMEOUT_MS && item) {
      e.preventDefault()
      lastKeyRef.current = null
      setDeleteConfirmItem(item)
      return
    }
    e.preventDefault()
    lastKeyRef.current = { key: "d", time: now }
    return
  }
  lastKeyRef.current = null

  if (e.key === "a" && !e.ctrlKey) {
    e.preventDefault()
    onAddBookmark()
    return
  }
  if (e.ctrlKey && e.key === "a") {
    e.preventDefault()
    onNewFolder()
    return
  }
  if ((e.key === "r" || e.key === "R") && !e.ctrlKey) {
    e.preventDefault()
    if (totalCount > 0) {
      const item = flatList[selectedIndex]
      if (item) onEditItem(item)
    }
    return
  }

  if (e.ctrlKey && e.key === "x") {
    e.preventDefault()
    if (totalCount > 0) {
      const item = flatList[selectedIndex]
      if (item?.type === "folder") {
        setCutItem({ type: "folder", id: item.id, name: item.label, sourceParentId: selectedFolderId })
      } else if (item?.type === "link") {
        setCutItem({ type: "link", bookmark: item.bookmark, sourceFolderId: selectedFolderId })
      }
    }
    return
  }

  if (e.ctrlKey && e.key === "v") {
    e.preventDefault()
    if (cutItem) {
      pasteCutFromKeyboard(
        cutItem,
        selectedFolderId,
        folders,
        bookmarks,
        setPasteError,
        setCutItem,
        handlePasteFolder,
        handlePasteLink
      )
    }
    return
  }

  if (totalCount === 0) return
  if (
    applyMarcadoresBrowseNavigationKeys(e, {
      totalCount,
      flatList,
      selectedIndex,
      selectMode,
      breadcrumb,
      gridCols,
      setSelectedIds,
      setSelectedIndex,
      setSelectedFolderId,
      openBookmarkTab,
      setInfoPanelEnabled,
      setDetailBookmark,
    })
  )
    return
}
