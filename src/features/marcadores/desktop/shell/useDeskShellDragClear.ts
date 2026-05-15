"use client"

import { useEffect, useRef } from "react"

/** Limpia resaltado al terminar cualquier drag en la ventana (handler estable por ref). */
export function useDeskShellDragClear(clearHighlight: () => void) {
  const clearHighlightRef = useRef(clearHighlight)
  useEffect(() => {
    clearHighlightRef.current = clearHighlight
  })

  useEffect(() => {
    const listener = () => clearHighlightRef.current()
    window.addEventListener("dragend", listener)
    return () => window.removeEventListener("dragend", listener)
  }, [])
}
