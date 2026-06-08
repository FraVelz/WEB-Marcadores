"use client"

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, type RefObject } from "react"

import type { GridItem } from "@/features/marcadores/utils/types"
import { useLiveRef } from "@/lib/hooks/useLiveRef"

import {
  dragDataToGridItem,
  isBookmarkDragSource,
  type BookmarkDropTargetData,
} from "@/lib/drag-and-drop/bookmarkDragData"
import { canHostPanelBookmarkDrop, isInnermostDropTarget } from "@/lib/drag-and-drop/dropTargetUtils"

type Params = {
  elementRef: RefObject<HTMLElement | null>
  enabled?: boolean
  onDrop?: (sourceItem: GridItem, targetFolderId?: string | null) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
}

/** Drop target for empty panel space (current browse folder). */
export function useBookmarkDropPanel({ elementRef, enabled = true, onDrop, onDragEnter, onDragLeave }: Params) {
  const onDropRef = useLiveRef(onDrop)
  const onDragEnterRef = useLiveRef(onDragEnter)
  const onDragLeaveRef = useLiveRef(onDragLeave)

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled || !onDrop) return

    return dropTargetForElements({
      element,
      canDrop: ({ source, input, element: panelElement }) =>
        isBookmarkDragSource(source) && canHostPanelBookmarkDrop({ input, element: panelElement }),
      getData: (): BookmarkDropTargetData => ({
        bookmarkDropTarget: true,
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
        onDropRef.current?.(sourceItem, undefined)
      },
    })
  }, [elementRef, enabled, onDrop])
}
