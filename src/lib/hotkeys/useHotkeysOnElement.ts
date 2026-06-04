"use client"

import { useLayoutEffect, useRef, type RefObject } from "react"

import hotkeys, { type KeyHandler } from "hotkeys-js"

import { ensureHotkeysFilter } from "@/lib/hotkeys/ensureHotkeysFilter"

type Options = {
  enabled?: boolean
}

export function useHotkeysOnElement(
  elementRef: RefObject<HTMLElement | null>,
  keys: string,
  handler: KeyHandler,
  options: Options = {},
  deps: ReadonlyArray<unknown> = []
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const { enabled = true } = options

  useLayoutEffect(() => {
    if (!enabled || !keys) return

    const element = elementRef.current
    if (!element) return

    ensureHotkeysFilter()

    const wrapped: KeyHandler = (event, hotkeysEvent) => handlerRef.current(event, hotkeysEvent)

    hotkeys(keys, { element }, wrapped)

    return () => {
      hotkeys.unbind(keys, wrapped)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls extra deps
  }, [elementRef, keys, enabled, ...deps])
}
