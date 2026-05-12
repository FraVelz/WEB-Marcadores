"use client"

import { useEffect, useEffectEvent } from "react"

type Params<T> = {
  searchValue: string
  selectedFolderId: string | null
  selectedIndex: number
  flatList: { type: string; bookmark?: T }[]
  infoPanelEnabled: boolean
  modalOpen: boolean
  pasteError: string | null
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  setGridCols: React.Dispatch<React.SetStateAction<number>>
  setDetailBookmark: React.Dispatch<React.SetStateAction<T | null>>
  setPasteError: (v: string | null) => void
  setShowSearch: (v: boolean) => void
  setMainKeyDown: (h: ((e: React.KeyboardEvent) => void) | null) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  searchRef: React.RefObject<HTMLInputElement | null>
}

export function useMarcadoresEffects<T>(params: Params<T>) {
  const {
    searchValue,
    selectedFolderId,
    selectedIndex,
    flatList,
    infoPanelEnabled,
    modalOpen,
    pasteError,
    setSelectedIndex,
    setGridCols,
    setDetailBookmark,
    setPasteError,
    setShowSearch,
    setMainKeyDown,
    handleKeyDown,
    itemRefs,
    searchRef,
  } = params

  const focusSearchShortcut = useEffectEvent(() => {
    setShowSearch(true)
    setTimeout(() => searchRef.current?.focus(), 0)
  })

  const clearPasteError = useEffectEvent(() => {
    setPasteError(null)
  })

  useEffect(() => setSelectedIndex(0), [searchValue, selectedFolderId, setSelectedIndex])
  useEffect(() => {
    itemRefs.current.get(selectedIndex)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex, itemRefs])
  useEffect(() => {
    setGridCols(window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
  }, [setGridCols])
  useEffect(() => {
    const h = () => {
      const cols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
      setGridCols(cols)
    }
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [setGridCols])
  useEffect(() => {
    const item = flatList[selectedIndex]
    const next =
      infoPanelEnabled && item?.type === "link" ? ((item.bookmark ?? null) as T | null) : null
    setDetailBookmark(next)
  }, [flatList, selectedIndex, infoPanelEnabled, setDetailBookmark])
  useEffect(() => {
    const nextHandler = modalOpen ? null : handleKeyDown
    setMainKeyDown(nextHandler)
    return () => setMainKeyDown(null)
  }, [modalOpen, handleKeyDown, setMainKeyDown])
  useEffect(() => {
    if (!pasteError) return
    const t = setTimeout(() => clearPasteError(), 4000)
    return () => clearTimeout(t)
  }, [pasteError, clearPasteError])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "f" || e.key === "k")) {
        e.preventDefault()
        focusSearchShortcut()
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [focusSearchShortcut])
}
