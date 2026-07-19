"use client"

import { useEffect, type RefObject } from "react"

export const DIALOG_FOCUSABLE_SELECTOR = [
  "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]),",
  "select:not([disabled]), [tabindex]:not([tabindex='-1'])",
].join(" ")

type Options = {
  enabled?: boolean
  /** Element to focus on open; defaults to first focusable in container */
  initialFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Traps Tab/Shift+Tab inside `containerRef`, focuses on open, restores trigger on cleanup.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, options: Options = {}) {
  const { enabled = true, initialFocusRef } = options

  useEffect(() => {
    if (!enabled) return
    const el = containerRef.current
    if (!el) return

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusInitial = () => {
      const preferred = initialFocusRef?.current
      if (preferred) {
        preferred.focus()
        return
      }
      const focusables = el.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR)
      focusables[0]?.focus()
    }
    const raf = requestAnimationFrame(focusInitial)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const focusables = [...el.querySelectorAll<HTMLElement>(DIALOG_FOCUSABLE_SELECTOR)].filter(
        (node) => !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true"
      )
      if (focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
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
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("keydown", handleKeyDown)
      if (trigger?.isConnected) {
        requestAnimationFrame(() => trigger.focus())
      }
    }
  }, [enabled, containerRef, initialFocusRef])
}
