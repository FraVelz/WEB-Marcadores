import hotkeys from "hotkeys-js"

let configured = false

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('[role="dialog"]'))
}

export function ensureHotkeysFilter() {
  if (configured || typeof window === "undefined") return
  configured = true

  hotkeys.filter = (event) => {
    if (event.key === "Escape") return true
    return !isTypingTarget(event.target)
  }
}
