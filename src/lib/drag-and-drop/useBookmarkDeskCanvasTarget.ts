"use client"

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useLayoutEffect, useRef, type RefObject } from "react"

import { isBookmarkDragSource } from "@/lib/drag-and-drop/bookmarkDragData"

export function useBookmarkDeskCanvasTarget(
  elementRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  setHighlighted: (value: boolean) => void
) {
  const setHighlightedRef = useRef(setHighlighted)
  setHighlightedRef.current = setHighlighted

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    return dropTargetForElements({
      element,
      canDrop: () => false,
      onDragEnter: ({ source }) => {
        if (!isBookmarkDragSource(source)) return
        setHighlightedRef.current(true)
      },
      onDrag: ({ source }) => {
        if (!isBookmarkDragSource(source)) return
        setHighlightedRef.current(true)
      },
      onDragLeave: () => {
        setHighlightedRef.current(false)
      },
      onDrop: () => {
        setHighlightedRef.current(false)
      },
    })
  }, [elementRef, enabled])
}
