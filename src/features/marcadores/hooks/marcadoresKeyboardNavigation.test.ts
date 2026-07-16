import { describe, expect, it, vi } from "vitest"

import { applyMarcadoresBrowseNavigationKeys } from "./marcadoresKeyboardNavigation"
import type { FlatFolder, GridItem } from "../utils/types"

describe("tree keyboard expand/collapse", () => {
  const folders: FlatFolder[] = [
    { id: "f1", parent_id: null, name: "Root", sort_order: 0 },
    { id: "f2", parent_id: "f1", name: "Child", sort_order: 0 },
  ]
  const bookmarks = [{ id: "b1", folder_id: "f1", title: "Link", url: "https://example.com" }] as never
  const flatList: GridItem[] = [
    { type: "folder", id: "f1", folderId: "f1", label: "Root" },
    { type: "folder", id: "f2", folderId: "f2", label: "Child" },
  ]

  function baseDeps(overrides: Record<string, unknown> = {}) {
    return {
      totalCount: flatList.length,
      flatList,
      selectedIndex: 0,
      selectMode: false,
      breadcrumb: [],
      gridCols: 1,
      setSelectedIds: vi.fn(),
      setSelectedIndex: vi.fn(),
      setSelectedFolderId: vi.fn(),
      openBookmarkTab: vi.fn(),
      setInfoPanelEnabled: vi.fn(),
      setDetailBookmark: vi.fn(),
      treeMode: true,
      treeCollapsedIds: new Set<string>(["f1"]),
      onToggleFolderCollapse: vi.fn(),
      folders,
      bookmarks,
      ...overrides,
    }
  }

  it("ArrowRight expands a collapsed folder with children", () => {
    const onToggleFolderCollapse = vi.fn()
    const handled = applyMarcadoresBrowseNavigationKeys(
      { key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent,
      baseDeps({ onToggleFolderCollapse })
    )
    expect(handled).toBe(true)
    expect(onToggleFolderCollapse).toHaveBeenCalledWith("f1")
  })

  it("ArrowLeft collapses an expanded folder with children", () => {
    const onToggleFolderCollapse = vi.fn()
    const handled = applyMarcadoresBrowseNavigationKeys(
      { key: "ArrowLeft", preventDefault: vi.fn() } as unknown as KeyboardEvent,
      baseDeps({
        treeCollapsedIds: new Set(),
        onToggleFolderCollapse,
      })
    )
    expect(handled).toBe(true)
    expect(onToggleFolderCollapse).toHaveBeenCalledWith("f1")
  })
})
