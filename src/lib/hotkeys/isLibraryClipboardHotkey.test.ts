import { describe, expect, it } from "vitest"

import { isLibraryClipboardHotkey } from "./isLibraryClipboardHotkey"

function evt(partial: Partial<KeyboardEvent> & Pick<KeyboardEvent, "key">): KeyboardEvent {
  return {
    key: partial.key,
    code: partial.code ?? "",
    ctrlKey: partial.ctrlKey ?? false,
    metaKey: partial.metaKey ?? false,
    altKey: partial.altKey ?? false,
  } as KeyboardEvent
}

describe("isLibraryClipboardHotkey", () => {
  it("matches Ctrl/Cmd+X and Ctrl/Cmd+V", () => {
    expect(isLibraryClipboardHotkey(evt({ key: "v", ctrlKey: true }))).toBe(true)
    expect(isLibraryClipboardHotkey(evt({ key: "x", metaKey: true }))).toBe(true)
    expect(isLibraryClipboardHotkey(evt({ key: "V", ctrlKey: true }))).toBe(true)
  })

  it("rejects plain letters and Alt combos", () => {
    expect(isLibraryClipboardHotkey(evt({ key: "v" }))).toBe(false)
    expect(isLibraryClipboardHotkey(evt({ key: "v", ctrlKey: true, altKey: true }))).toBe(false)
  })
})
