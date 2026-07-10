"use client"

import { useState } from "react"

import type { Folder } from "@/contexts/DashboardContext"
import { flattenSidebarTree } from "@/layouts/dashboard/sidebar/sidebarTreeUtils"

export function useSidebarTreeCollapse(folders: Folder[]) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const flatSidebarItems = flattenSidebarTree(folders, collapsedIds)

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return { collapsedIds, setCollapsedIds, flatSidebarItems, toggleCollapsed }
}
