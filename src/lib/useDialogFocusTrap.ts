"use client"

import { useEffect, useRef, type RefObject } from "react"

const FOCUSABLE_SELECTOR = [
  "button:not([disabled]), input:not([disabled]), textarea:not([disabled]),",
  "select:not([disabled]), [tabindex]:not([tabindex='-1'])",
].join(" ")

type Options = {
  /** Re-bind trap when open state or disabled controls change. */
  enabled?: boolean
  /** Element to focus on open (defaults to first focusable). */
  initialFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Focus trap + restore for `role="dialog"` overlays.
 * Call while the dialog is mounted.
 */
export function useDialogFocusTrap(dialogRef: RefObject<HTMLElement | null>, options: Options = {}) {
  const { enabled = true, initialFocusRef } = options
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    requestAnimationFrame(() => {
      const preferred = initialFocusRef?.current
      if (preferred) {
        preferred.focus()
        return
      }
      const root = dialogRef.current
      if (!root) return
      const first = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0]
      first?.focus()
    })
    return () => {
      const trigger = triggerRef.current
      if (trigger?.isConnected) {
        requestAnimationFrame(() => trigger.focus())
      }
    }
  }, [dialogRef, enabled, initialFocusRef])

  useEffect(() => {
    if (!enabled) return
    const el = dialogRef.current
    if (!el) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const focusables = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    el.addEventListener("keydown", handleKeyDown)
    return () => el.removeEventListener("keydown", handleKeyDown)
  }, [dialogRef, enabled])
}
