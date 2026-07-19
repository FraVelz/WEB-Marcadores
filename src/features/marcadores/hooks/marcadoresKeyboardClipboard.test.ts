import { afterEach, describe, expect, it, vi } from "vitest"

import { handleMarcadoresClipboardKeyDown } from "./marcadoresKeyboardHandler"
import type { MarcadoresKeyboardContext } from "./marcadoresKeyboard.types"
import type { Bookmark, CutItem, GridItem } from "../utils/types"

function keyEvent(partial: Partial<KeyboardEvent> & { key: string; code?: string }): KeyboardEvent {
  return {
    key: partial.key,
    code: partial.code ?? `Key${partial.key.toUpperCase()}`,
    ctrlKey: partial.ctrlKey ?? false,
    metaKey: partial.metaKey ?? false,
    altKey: partial.altKey ?? false,
    preventDefault: vi.fn(),
    target: partial.target ?? null,
  } as unknown as KeyboardEvent
}

describe("handleMarcadoresClipboardKeyDown", () => {
  const bookmark = {
    id: "b1",
    title: "Example",
    url: "https://example.com",
    folder_id: "f1",
  } as Bookmark

  const linkItem: GridItem = {
    type: "link",
    bookmark,
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function baseCtx(overrides: Partial<MarcadoresKeyboardContext> = {}): MarcadoresKeyboardContext {
    return {
      lastKeyRef: { current: null },
      breadcrumb: [],
      deleteConfirmItem: null,
      setDeleteConfirmItem: vi.fn(),
      onConfirmDelete: vi.fn(),
      flatList: [linkItem],
      selectedIndex: 0,
      totalCount: 1,
      gridCols: 3,
      selectMode: false,
      selectedFolderId: "dest",
      folders: [],
      bookmarks: [bookmark],
      cutItem: null,
      setCutItem: vi.fn(),
      setSelectedIds: vi.fn(),
      setSelectedIndex: vi.fn(),
      setSelectedFolderId: vi.fn(),
      setInfoPanelEnabled: vi.fn(),
      setDetailBookmark: vi.fn(),
      handlePasteFolder: vi.fn(async () => undefined),
      handlePasteLink: vi.fn(async () => undefined),
      onAddBookmark: vi.fn(),
      onNewFolder: vi.fn(),
      onEditItem: vi.fn(),
      openBookmarkTab: vi.fn(),
      treeMode: false,
      treeCollapsedIds: new Set(),
      onToggleFolderCollapse: vi.fn(),
      ...overrides,
    }
  }

  function stubDocument(active: EventTarget | null = null) {
    vi.stubGlobal("document", { activeElement: active })
  }

  it("cuts the focused link with Ctrl+X", () => {
    stubDocument()
    const setCutItem = vi.fn()
    const e = keyEvent({ key: "x", ctrlKey: true })
    const handled = handleMarcadoresClipboardKeyDown(e, baseCtx({ setCutItem }))
    expect(handled).toBe(true)
    expect(e.preventDefault).toHaveBeenCalled()
    expect(setCutItem).toHaveBeenCalledWith({
      type: "link",
      bookmark,
      sourceFolderId: "dest",
    })
  })

  it("pastes a cut link into the current folder with Ctrl+V", () => {
    stubDocument()
    const cutItem: CutItem = { type: "link", bookmark, sourceFolderId: "f1" }
    const setCutItem = vi.fn()
    const handlePasteLink = vi.fn(async () => undefined)
    const e = keyEvent({ key: "v", ctrlKey: true })
    const handled = handleMarcadoresClipboardKeyDown(
      e,
      baseCtx({ cutItem, setCutItem, handlePasteLink, selectedFolderId: "dest" })
    )
    expect(handled).toBe(true)
    expect(e.preventDefault).toHaveBeenCalled()
    expect(handlePasteLink).toHaveBeenCalledWith("b1", "dest")
    expect(setCutItem).toHaveBeenCalledWith(null)
  })

  it("does not claim Ctrl+V when there is nothing cut (search paste can proceed)", () => {
    stubDocument()
    const e = keyEvent({ key: "v", ctrlKey: true })
    const handled = handleMarcadoresClipboardKeyDown(e, baseCtx({ cutItem: null }))
    expect(handled).toBe(false)
    expect(e.preventDefault).not.toHaveBeenCalled()
  })
})
