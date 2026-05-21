"use client"

import { useSyncExternalStore } from "react"

const MD_QUERY = "(min-width: 768px)"

function getMdSnapshot(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(MD_QUERY).matches
}

function subscribeMd(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia(MD_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/** true cuando el viewport alcanza el breakpoint Tailwind md (≥768px), sin useEffect. */
export function useMatchMediaMd() {
  return useSyncExternalStore(subscribeMd, getMdSnapshot, () => false)
}
