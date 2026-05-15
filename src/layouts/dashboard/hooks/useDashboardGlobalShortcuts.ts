"use client"

import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react"

import { navItems } from "../utils"

type Params = {
  pathname: string
  sidebarRef: RefObject<HTMLDivElement | null>
  focusMain: () => void
  focusSidebar: () => void
  push: (href: string) => void
  setCommandPaletteOpen: Dispatch<SetStateAction<boolean>>
}

export function useDashboardGlobalShortcuts({
  pathname,
  sidebarRef,
  focusMain,
  focusSidebar,
  push,
  setCommandPaletteOpen,
}: Params) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const active = document.activeElement as HTMLElement | null
        const tag = active?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || active?.closest?.('[role="dialog"][aria-modal="true"]')) return
        e.preventDefault()
        setCommandPaletteOpen((o) => !o)
      }

      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement
        if (
          active?.tagName === "INPUT" ||
          active?.tagName === "TEXTAREA" ||
          (active as HTMLElement).closest?.('[role="dialog"]')
        )
          return
        e.preventDefault()
        if (pathname === "/marcadores") {
          const isSidebarFocused = sidebarRef.current?.contains(active)
          if (isSidebarFocused) focusMain()
          else focusSidebar()
        } else {
          focusMain()
        }
      }

      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        if (idx < navItems.length) {
          e.preventDefault()
          push(navItems[idx].href)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pathname, focusMain, focusSidebar, sidebarRef, push, setCommandPaletteOpen])
}
