"use client"

import { useRef, type RefObject } from "react"

import { handleMarcadoresKeyDown } from "@/features/marcadores/hooks/marcadoresKeyboardHandler"
import type { MarcadoresKeyboardContext } from "@/features/marcadores/hooks/marcadoresKeyboard.types"
import { MARCADORES_MAIN_HOTKEYS } from "@/lib/hotkeys"
import { useHotkeysOnElement } from "@/lib/hotkeys/useHotkeysOnElement"
import { useLiveRef } from "@/lib/hooks/useLiveRef"

export type Params = Omit<MarcadoresKeyboardContext, "lastKeyRef"> & {
  mainRef: RefObject<HTMLElement | null>
  enabled?: boolean
}

export function useMarcadoresMainHotkeys(params: Params) {
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)
  const { mainRef, enabled = true, ...ctx } = params
  const ctxRef = useLiveRef(ctx)

  useHotkeysOnElement(
    mainRef,
    MARCADORES_MAIN_HOTKEYS,
    (event) => {
      handleMarcadoresKeyDown(event, { ...ctxRef.current, lastKeyRef })
    },
    { enabled },
    [enabled]
  )
}
