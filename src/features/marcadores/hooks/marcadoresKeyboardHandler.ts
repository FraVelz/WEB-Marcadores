"use client"

import { isHardTypingTarget } from "@/lib/hotkeys/ensureHotkeysFilter"
import { isLibraryClipboardHotkey } from "@/lib/hotkeys/isLibraryClipboardHotkey"

import { applyMarcadoresBrowseNavigationKeys } from "./marcadoresKeyboardNavigation"
import { pasteCutFromKeyboard } from "./marcadoresKeyboardPaste"
import type { MarcadoresKeyboardContext } from "./marcadoresKeyboard.types"

const DD_TIMEOUT_MS = 400

function isModKey(e: KeyboardEvent) {
  return e.ctrlKey || e.metaKey
}

function letterKey(e: KeyboardEvent) {
  return e.key.length === 1 ? e.key.toLowerCase() : ""
}

/** Cut / paste for the library clipboard (Ctrl/Cmd+X / V). Returns true if handled. */
export function handleMarcadoresClipboardKeyDown(e: KeyboardEvent, ctx: MarcadoresKeyboardContext): boolean {
  if (!isLibraryClipboardHotkey(e)) return false
  if (isHardTypingTarget(e.target)) return false
  if (typeof document !== "undefined" && isHardTypingTarget(document.activeElement)) return false

  const {
    flatList,
    selectedIndex,
    totalCount,
    selectedFolderId,
    folders,
    bookmarks,
    cutItem,
    setCutItem,
    handlePasteFolder,
    handlePasteLink,
  } = ctx

  const key = letterKey(e) || (e.code === "KeyX" ? "x" : e.code === "KeyV" ? "v" : "")

  if (key === "x") {
    e.preventDefault()
    if (totalCount > 0) {
      const item = flatList[selectedIndex]
      if (item?.type === "folder") {
        setCutItem({ type: "folder", id: item.id, name: item.label, sourceParentId: selectedFolderId })
      } else if (item?.type === "link") {
        setCutItem({ type: "link", bookmark: item.bookmark, sourceFolderId: selectedFolderId })
      }
    }
    return true
  }

  if (key === "v") {
    // Only claim the event when there is something to paste — otherwise leave OS paste (e.g. search).
    if (!cutItem) return false
    e.preventDefault()
    pasteCutFromKeyboard(cutItem, selectedFolderId, folders, bookmarks, setCutItem, handlePasteFolder, handlePasteLink)
    return true
  }

  return false
}

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
    folders,
    bookmarks,
    setSelectedIds,
    setSelectedIndex,
    setSelectedFolderId,
    setInfoPanelEnabled,
    setDetailBookmark,
    onAddBookmark,
    onNewFolder,
    onEditItem,
    openBookmarkTab,
    treeMode,
    treeCollapsedIds,
    onToggleFolderCollapse,
  } = ctx

  if (handleMarcadoresClipboardKeyDown(e, ctx)) return

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

  if (e.key === "d" && !isModKey(e) && !e.altKey && totalCount > 0) {
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

  if (letterKey(e) === "a" && !isModKey(e)) {
    e.preventDefault()
    onAddBookmark()
    return
  }
  if (isModKey(e) && letterKey(e) === "a") {
    e.preventDefault()
    onNewFolder()
    return
  }
  if (letterKey(e) === "r" && !isModKey(e)) {
    e.preventDefault()
    if (totalCount > 0) {
      const item = flatList[selectedIndex]
      if (item) onEditItem(item)
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
      treeMode,
      treeCollapsedIds,
      onToggleFolderCollapse,
      folders,
      bookmarks,
    })
  )
    return
}
