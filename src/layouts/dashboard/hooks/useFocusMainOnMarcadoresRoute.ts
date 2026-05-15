"use client"

import { useEffect, type RefObject } from "react"

export function useFocusMainOnMarcadoresRoute(pathname: string, mainRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (pathname === "/marcadores") {
      requestAnimationFrame(() => mainRef.current?.focus())
    }
  }, [pathname, mainRef])
}
