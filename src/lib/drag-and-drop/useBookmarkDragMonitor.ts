"use client"

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect } from "react"

import { isBookmarkDragSource } from "@/lib/drag-and-drop/bookmarkDragData"
import { useLiveRef } from "@/lib/hooks/useLiveRef"

export function useBookmarkDragMonitor(onDragEnd: () => void) {
  const onDragEndRef = useLiveRef(onDragEnd)

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isBookmarkDragSource(source),
      onDrop: () => {
        onDragEndRef.current()
      },
    })
  }, [])
}
