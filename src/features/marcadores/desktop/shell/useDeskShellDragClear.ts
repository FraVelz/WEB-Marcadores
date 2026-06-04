"use client"

import { useEffect, useRef } from "react"

import { useBookmarkDragMonitor } from "@/lib/drag-and-drop"

/** Limpia resaltado al terminar cualquier drag de marcadores (handler estable por ref). */
export function useDeskShellDragClear(clearHighlight: () => void) {
  const clearHighlightRef = useRef(clearHighlight)
  useEffect(() => {
    clearHighlightRef.current = clearHighlight
  })

  useBookmarkDragMonitor(() => {
    clearHighlightRef.current()
  })
}
