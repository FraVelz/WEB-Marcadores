"use client"

import { useEffect } from "react"

import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

type Params<T> = {
  searchValue: string
  selectedFolderId: string | null
  selectedIndex: number
  flatList: { type: string; bookmark?: T }[]
  infoPanelEnabled: boolean
  pasteError: string | null
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  setGridCols: React.Dispatch<React.SetStateAction<number>>
  setDetailBookmark: React.Dispatch<React.SetStateAction<T | null>>
  setPasteError: (v: string | null) => void
  setShowSearch: (v: boolean) => void
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
    pasteError,
    setSelectedIndex,
    setGridCols,
    setDetailBookmark,
    setPasteError,
    setShowSearch,
    itemRefs,
    searchRef,
  } = params

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
    const next = infoPanelEnabled && item?.type === "link" ? ((item.bookmark ?? null) as T | null) : null
    setDetailBookmark(next)
  }, [flatList, selectedIndex, infoPanelEnabled, setDetailBookmark])
  useEffect(() => {
    if (!pasteError) return
    const t = setTimeout(() => setPasteError(null), 4000)
    return () => clearTimeout(t)
  }, [pasteError, setPasteError])

  useHotkeys(
    "ctrl+f",
    (event) => {
      event.preventDefault()
      setShowSearch(true)
      setTimeout(() => searchRef.current?.focus(), 0)
    },
    {},
    [setShowSearch, searchRef]
  )
}
