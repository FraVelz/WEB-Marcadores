"use client"

import { useEffect, useRef } from "react"

import hotkeys, { type KeyHandler } from "hotkeys-js"

import { ensureHotkeysFilter } from "@/lib/hotkeys/ensureHotkeysFilter"

export type UseHotkeysOptions = {
  enabled?: boolean
  scope?: string
  element?: HTMLElement | Document
  keyup?: boolean
  keydown?: boolean
  capture?: boolean
  splitKey?: string
  single?: boolean
}

export function useHotkeys(
  keys: string,
  handler: KeyHandler,
  options: UseHotkeysOptions = {},
  deps: ReadonlyArray<unknown> = []
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const { enabled = true, scope, element, keyup, keydown, capture, splitKey, single } = options

  useEffect(() => {
    if (!enabled || !keys) return

    ensureHotkeysFilter()

    const wrapped: KeyHandler = (event, hotkeysEvent) => handlerRef.current(event, hotkeysEvent)

    hotkeys(keys, { scope, element, keyup, keydown, capture, splitKey, single }, wrapped)

    return () => {
      hotkeys.unbind(keys, wrapped)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls extra deps
  }, [keys, enabled, scope, element, keyup, keydown, capture, splitKey, single, ...deps])
}
