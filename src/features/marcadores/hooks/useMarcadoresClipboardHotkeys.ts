"use client"

import { useLiveRef } from "@/lib/hooks/useLiveRef"
import { MARCADORES_CLIPBOARD_HOTKEYS } from "@/lib/hotkeys"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

import { handleMarcadoresClipboardKeyDown } from "@/features/marcadores/hooks/marcadoresKeyboardHandler"
import type { MarcadoresKeyboardContext } from "@/features/marcadores/hooks/marcadoresKeyboard.types"

type Params = Omit<MarcadoresKeyboardContext, "lastKeyRef"> & {
  enabled?: boolean
}

/**
 * Cut/paste bound on `document` so Ctrl+V still works after focusing the explorer
 * rail or the search field (main-scoped hotkeys alone miss those targets).
 */
export function useMarcadoresClipboardHotkeys(params: Params) {
  const { enabled = true, ...ctx } = params
  const ctxRef = useLiveRef(ctx)

  useHotkeys(
    MARCADORES_CLIPBOARD_HOTKEYS,
    (event) => {
      handleMarcadoresClipboardKeyDown(event, {
        ...ctxRef.current,
        lastKeyRef: { current: null },
      })
    },
    { enabled },
    [enabled]
  )
}
