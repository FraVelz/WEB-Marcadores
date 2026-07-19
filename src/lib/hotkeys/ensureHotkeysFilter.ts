import hotkeys from "hotkeys-js"

import { isLibraryClipboardHotkey } from "@/lib/hotkeys/isLibraryClipboardHotkey"

let configured = false

export function isTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('[role="dialog"]'))
}

/** Block library hotkeys in real editors; allow search INPUT for cut/paste. */
export function isHardTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.closest('[role="dialog"]')) return true
  return false
}

export function ensureHotkeysFilter() {
  if (configured || typeof window === "undefined") return
  configured = true

  hotkeys.filter = (event) => {
    if (event.key === "Escape") return true
    if (isLibraryClipboardHotkey(event)) return !isHardTypingTarget(event.target)
    return !isTypingTarget(event.target)
  }
}
