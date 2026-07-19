/** Ctrl/Cmd+X or Ctrl/Cmd+V — library cut/paste, not OS clipboard into inputs. */
export function isLibraryClipboardHotkey(event: KeyboardEvent): boolean {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return false
  const key = event.key.toLowerCase()
  if (key === "x" || key === "v") return true
  return event.code === "KeyX" || event.code === "KeyV"
}
