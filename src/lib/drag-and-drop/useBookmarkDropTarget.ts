"use client"

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, useRef, type RefObject } from "react"

import type { GridItem } from "@/features/marcadores/utils/types"

import {
  dragDataToGridItem,
  isBookmarkDragSource,
  readDropTargetFolderId,
  type BookmarkDropTargetData,
} from "@/lib/drag-and-drop/bookmarkDragData"

type Params = {
  elementRef: RefObject<HTMLElement | null>
  enabled?: boolean
  targetFolderId?: string | null
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
}

export function useBookmarkDropTarget({
  elementRef,
  enabled = true,
  targetFolderId,
  onDrop,
  onDragEnter,
  onDragLeave,
}: Params) {
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop

  const onDragEnterRef = useRef(onDragEnter)
  onDragEnterRef.current = onDragEnter

  const onDragLeaveRef = useRef(onDragLeave)
  onDragLeaveRef.current = onDragLeave

  const targetFolderIdRef = useRef(targetFolderId)
  targetFolderIdRef.current = targetFolderId

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled || !onDropRef.current) return

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isBookmarkDragSource(source),
      getData: (): BookmarkDropTargetData => ({
        bookmarkDropTarget: true,
        targetFolderId: targetFolderIdRef.current,
      }),
      getDropEffect: () => "move",
      onDragEnter: () => {
        onDragEnterRef.current?.()
      },
      onDragLeave: () => {
        onDragLeaveRef.current?.()
      },
      onDrop: ({ source, self }) => {
        const sourceItem = dragDataToGridItem(source.data)
        if (!sourceItem) return
        const resolvedTarget = readDropTargetFolderId(self.data)
        onDropRef.current?.(sourceItem, resolvedTarget)
      },
    })
  }, [elementRef, enabled, targetFolderId])
}
