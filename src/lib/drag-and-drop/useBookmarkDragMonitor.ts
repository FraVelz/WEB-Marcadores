"use client"

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useRef } from "react"

import { isBookmarkDragSource } from "@/lib/drag-and-drop/bookmarkDragData"

export function useBookmarkDragMonitor(onDragEnd: () => void) {
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isBookmarkDragSource(source),
      onDrop: () => {
        onDragEndRef.current()
      },
    })
  }, [])
}
