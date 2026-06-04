"use client"

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, useRef, type RefObject } from "react"

import type { GridItem } from "@/features/marcadores/utils/types"

import { attachBookmarkDragPreview } from "@/lib/drag-and-drop/bookmarkDragPreview"
import { gridItemToDragData } from "@/lib/drag-and-drop/bookmarkDragData"

export function useBookmarkDraggable(
  elementRef: RefObject<HTMLElement | null>,
  item: GridItem,
  enabled = true
) {
  const itemRef = useRef(item)
  itemRef.current = item

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    return draggable({
      element,
      getInitialData: () => gridItemToDragData(itemRef.current),
      getInitialDataForExternal: () => {
        const current = itemRef.current
        if (current.type === "folder") {
          return { "text/plain": current.label }
        }
        return { "text/plain": current.bookmark.title }
      },
      onGenerateDragPreview: attachBookmarkDragPreview,
    })
  }, [elementRef, enabled])
}
