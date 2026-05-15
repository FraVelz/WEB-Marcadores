"use client"

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react"

import type { Folder } from "@/contexts/DashboardContext"
import { findFolderInTree, folderHasChildren } from "../utils"

type Params = {
  flatSidebarItems: (string | null)[]
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  folders: Folder[]
  collapsedIds: Set<string>
  setCollapsedIds: Dispatch<SetStateAction<Set<string>>>
  focusMain: () => void
  editFolderRef: MutableRefObject<((id: string, name: string) => void) | null>
}

export function useDashboardSidebarKeyboard(params: Params) {
  const {
    flatSidebarItems,
    selectedFolderId,
    setSelectedFolderId,
    folders,
    collapsedIds,
    setCollapsedIds,
    focusMain,
    editFolderRef,
  } = params

  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey) {
        e.preventDefault()
        focusMain()
        return
      }
      const idx = flatSidebarItems.indexOf(selectedFolderId)
      const currentIdx = idx >= 0 ? idx : 0
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        const nextIdx = Math.min(currentIdx + 1, flatSidebarItems.length - 1)
        setSelectedFolderId(flatSidebarItems[nextIdx])
        return
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        const prevIdx = Math.max(currentIdx - 1, 0)
        setSelectedFolderId(flatSidebarItems[prevIdx])
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id)
          if (folder?.children?.length) {
            setCollapsedIds((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }
        }
        setSelectedFolderId(flatSidebarItems[currentIdx])
        focusMain()
        return
      }
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id && collapsedIds.has(id)) return
        if (id) {
          setCollapsedIds((prev) => new Set(prev).add(id))
        }
        return
      }
      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id && folderHasChildren(folders, id)) {
          setCollapsedIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
        return
      }
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey) {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id)
          if (folder) editFolderRef.current?.(folder.id, folder.name)
        }
        return
      }
    },
    [
      flatSidebarItems,
      selectedFolderId,
      setSelectedFolderId,
      folders,
      collapsedIds,
      setCollapsedIds,
      focusMain,
      editFolderRef,
    ]
  )
}
