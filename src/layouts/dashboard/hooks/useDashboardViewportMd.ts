"use client"

import { useMatchMediaMd } from "@/lib/hooks/useMatchMediaMd"

/** true cuando el viewport alcanza el breakpoint Tailwind md (≥768px) */
export function useDashboardViewportMd() {
  return useMatchMediaMd()
}
