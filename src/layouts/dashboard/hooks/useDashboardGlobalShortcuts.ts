"use client"

import { type Dispatch, type RefObject, type SetStateAction } from "react"

import { dashboardNavItems } from "@/components/header/dashboardNav"
import { isTypingTarget } from "@/lib/hotkeys/ensureHotkeysFilter"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

type Params = {
  pathname: string
  sidebarRef: RefObject<HTMLDivElement | null>
  marcadoresExplorerPanelRef?: RefObject<HTMLDivElement | null>
  focusMain: () => void
  focusSidebar: () => void
  push: (href: string) => void
  setCommandPaletteOpen: Dispatch<SetStateAction<boolean>>
}

const NAV_HOTKEYS = dashboardNavItems
  .slice(0, 9)
  .map((_, index) => `ctrl+${index + 1}`)
  .join(",")

export function useDashboardGlobalShortcuts({
  pathname,
  sidebarRef,
  marcadoresExplorerPanelRef,
  focusMain,
  focusSidebar,
  push,
  setCommandPaletteOpen,
}: Params) {
  useHotkeys(
    "command+k,ctrl+k",
    (event) => {
      if (isTypingTarget(event.target)) return
      if ((event.target as HTMLElement | null)?.closest?.('[role="dialog"][aria-modal="true"]')) return
      event.preventDefault()
      setCommandPaletteOpen((open) => !open)
    },
    {},
    [setCommandPaletteOpen]
  )

  useHotkeys(
    "n",
    (event) => {
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      if (pathname === "/marcadores") {
        const active = document.activeElement
        const inExplorer = marcadoresExplorerPanelRef?.current?.contains(active ?? null) ?? false
        const inAsideNav = sidebarRef.current?.contains(active ?? null) ?? false
        if (inExplorer || inAsideNav) focusMain()
        else focusSidebar()
      } else {
        focusMain()
      }
    },
    {},
    [pathname, focusMain, focusSidebar, sidebarRef, marcadoresExplorerPanelRef]
  )

  useHotkeys(
    NAV_HOTKEYS,
    (event, handler) => {
      const digit = handler.key
      if (!/^[1-9]$/.test(digit)) return
      const idx = parseInt(digit, 10) - 1
      if (idx >= dashboardNavItems.length) return
      event.preventDefault()
      push(dashboardNavItems[idx].href)
    },
    {},
    [push]
  )
}
