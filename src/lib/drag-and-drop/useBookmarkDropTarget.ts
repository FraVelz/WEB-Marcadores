"use client"

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, type RefObject } from "react"

import type { GridItem } from "@/features/marcadores/utils/types"
import { useLiveRef } from "@/lib/hooks/useLiveRef"

import {
  dragDataToGridItem,
  isBookmarkDragSource,
  readDropTargetFolderId,
  type BookmarkDropTargetData,
} from "@/lib/drag-and-drop/bookmarkDragData"
import { isInnermostDropTarget } from "@/lib/drag-and-drop/dropTargetUtils"

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
  const onDropRef = useLiveRef(onDrop)
  const onDragEnterRef = useLiveRef(onDragEnter)
  const onDragLeaveRef = useLiveRef(onDragLeave)
  const targetFolderIdRef = useLiveRef(targetFolderId)

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled || !onDrop) return

    return dropTargetForElements({
      element,
      canDrop: ({ source, element: dropElement }) => isBookmarkDragSource(source) && source.element !== dropElement,
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
      onDrop: ({ source, self, location }) => {
        if (!isInnermostDropTarget(location, self)) return
        const sourceItem = dragDataToGridItem(source.data)
        if (!sourceItem) return
        const resolvedTarget = readDropTargetFolderId(self.data)
        onDropRef.current?.(sourceItem, resolvedTarget)
      },
    })
  }, [elementRef, enabled, onDrop, targetFolderId])
}
