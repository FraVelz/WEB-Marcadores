"use client"

import { useEffect, useState } from "react"

/** true cuando el viewport alcanza el breakpoint Tailwind md (≥768px) */
export function useMinWidthMd() {
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return wide
}
