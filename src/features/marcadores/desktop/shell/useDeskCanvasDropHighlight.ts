"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"

type Store = {
  highlight: boolean
  listeners: Set<() => void>
}

export function useDeskCanvasDropHighlight() {
  const storeRef = useRef<Store | null>(null)

  function getStore() {
    if (!storeRef.current) storeRef.current = { highlight: false, listeners: new Set() }
    return storeRef.current
  }

  const subscribe = useCallback((onChange: () => void) => {
    const store = getStore()
    store.listeners.add(onChange)
    return () => store.listeners.delete(onChange)
  }, [])

  const getSnapshot = useCallback(() => getStore().highlight, [])

  const highlight = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const setHighlight = useCallback((value: boolean) => {
    const store = getStore()
    if (store.highlight === value) return
    store.highlight = value
    store.listeners.forEach((l) => l())
  }, [])

  return { deskCanvasDropHighlight: highlight, setDeskCanvasDropHighlight: setHighlight }
}
