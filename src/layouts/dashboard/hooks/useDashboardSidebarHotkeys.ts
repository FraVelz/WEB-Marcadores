"use client"

import { useRef, type Dispatch, type MutableRefObject, type RefObject, type SetStateAction } from "react"

import type { Folder } from "@/contexts/DashboardContext"
import { findFolderInTree, folderHasChildren } from "@/layouts/dashboard/sidebar/sidebarTreeUtils"
import { EXPLORER_SIDEBAR_HOTKEYS } from "@/lib/hotkeys"
import { useHotkeysOnElement } from "@/lib/hotkeys/useHotkeysOnElement"

type Params = {
  elementRef: RefObject<HTMLElement | null>
  enabled?: boolean
  flatSidebarItems: (string | null)[]
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  folders: Folder[]
  collapsedIds: Set<string>
  setCollapsedIds: Dispatch<SetStateAction<Set<string>>>
  focusMain: () => void
  editFolderRef: MutableRefObject<((id: string, name: string) => void) | null>
}

export function useDashboardSidebarHotkeys(params: Params) {
  const {
    elementRef,
    enabled = true,
    flatSidebarItems,
    selectedFolderId,
    setSelectedFolderId,
    folders,
    collapsedIds,
    setCollapsedIds,
    focusMain,
    editFolderRef,
  } = params

  const flatSidebarItemsRef = useRef(flatSidebarItems)
  flatSidebarItemsRef.current = flatSidebarItems

  const selectedFolderIdRef = useRef(selectedFolderId)
  selectedFolderIdRef.current = selectedFolderId

  const collapsedIdsRef = useRef(collapsedIds)
  collapsedIdsRef.current = collapsedIds

  useHotkeysOnElement(
    elementRef,
    EXPLORER_SIDEBAR_HOTKEYS,
    (event) => {
      if (event.key === "n" && !event.ctrlKey) {
        event.preventDefault()
        focusMain()
        return
      }

      const flatSidebarItemsCurrent = flatSidebarItemsRef.current
      const idx = flatSidebarItemsCurrent.indexOf(selectedFolderIdRef.current)
      const currentIdx = idx >= 0 ? idx : 0

      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault()
        const nextIdx = Math.min(currentIdx + 1, flatSidebarItemsCurrent.length - 1)
        setSelectedFolderId(flatSidebarItemsCurrent[nextIdx])
        return
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault()
        const prevIdx = Math.max(currentIdx - 1, 0)
        setSelectedFolderId(flatSidebarItemsCurrent[prevIdx])
        return
      }
      if (event.key === "Enter") {
        event.preventDefault()
        const id = flatSidebarItemsCurrent[currentIdx]
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
        setSelectedFolderId(flatSidebarItemsCurrent[currentIdx])
        focusMain()
        return
      }
      if (event.key === "h" || event.key === "ArrowLeft") {
        event.preventDefault()
        const id = flatSidebarItemsCurrent[currentIdx]
        const collapsed = collapsedIdsRef.current
        if (id && collapsed.has(id)) return
        if (id) {
          setCollapsedIds((prev) => new Set(prev).add(id))
        }
        return
      }
      if (event.key === "l" || event.key === "ArrowRight") {
        event.preventDefault()
        const id = flatSidebarItemsCurrent[currentIdx]
        if (id && folderHasChildren(folders, id)) {
          setCollapsedIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
        return
      }
      if ((event.key === "r" || event.key === "R") && !event.ctrlKey) {
        event.preventDefault()
        const id = flatSidebarItemsCurrent[currentIdx]
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id)
          if (folder) editFolderRef.current?.(folder.id, folder.name)
        }
      }
    },
    { enabled },
    [enabled, folders, setSelectedFolderId, setCollapsedIds, focusMain, editFolderRef]
  )
}
