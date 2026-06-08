"use client"

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, type RefObject } from "react"

import { isBookmarkDragSource } from "@/lib/drag-and-drop/bookmarkDragData"
import { useLiveRef } from "@/lib/hooks/useLiveRef"

/** Stops bookmark drag bubble on chrome and runs a side effect (e.g. clear desk highlight). */
export function useBookmarkDragBubbleBlocker(
  elementRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onBookmarkDragOver?: () => void
) {
  const onBookmarkDragOverRef = useLiveRef(onBookmarkDragOver)

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    return dropTargetForElements({
      element,
      canDrop: () => false,
      onDragEnter: ({ source }) => {
        if (!isBookmarkDragSource(source)) return
        onBookmarkDragOverRef.current?.()
      },
      onDrag: ({ source }) => {
        if (!isBookmarkDragSource(source)) return
        onBookmarkDragOverRef.current?.()
      },
    })
  }, [elementRef, enabled])
}
