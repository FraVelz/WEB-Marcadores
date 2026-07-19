import { describe, expect, it } from "vitest"

import {
  bookmarkIdsOutsideDeletedFolders,
  collectAllFolderIds,
  gridItemSelectionId,
  partitionSelectedIds,
  topmostSelectedFolderIds,
} from "./selectionIds"
import type { Bookmark, FlatFolder, GridItem } from "./types"

describe("selectionIds", () => {
  const folders: FlatFolder[] = [
    { id: "f1", parent_id: null, name: "Root", sort_order: 0 },
    { id: "f2", parent_id: "f1", name: "Child", sort_order: 0 },
    { id: "f3", parent_id: null, name: "Sibling", sort_order: 1 },
  ]
  const bookmarks: Bookmark[] = [
    { id: "b1", title: "In root", url: "https://a.test", folder_id: "f1" },
    { id: "b2", title: "Loose", url: "https://b.test", folder_id: null },
  ]

  it("gridItemSelectionId uses folder or bookmark id", () => {
    const folder: GridItem = { type: "folder", id: "f1", folderId: "f1", label: "Root" }
    const link: GridItem = { type: "link", bookmark: bookmarks[0] }
    expect(gridItemSelectionId(folder)).toBe("f1")
    expect(gridItemSelectionId(link)).toBe("b1")
  })

  it("partitionSelectedIds splits folders and bookmarks", () => {
    expect(partitionSelectedIds(new Set(["f1", "b2", "unknown"]), folders, bookmarks)).toEqual({
      folderIds: ["f1"],
      bookmarkIds: ["b2"],
    })
  })

  it("topmostSelectedFolderIds drops nested selections", () => {
    expect(topmostSelectedFolderIds(folders, ["f1", "f2", "f3"]).sort()).toEqual(["f1", "f3"])
  })

  it("bookmarkIdsOutsideDeletedFolders skips links covered by folder delete", () => {
    expect(bookmarkIdsOutsideDeletedFolders(bookmarks, ["b1", "b2"], folders, ["f1"])).toEqual(["b2"])
  })

  it("collectAllFolderIds walks nested children", () => {
    expect(
      [
        ...collectAllFolderIds([
          { id: "a", children: [{ id: "b", children: [{ id: "c" }] }] },
          { id: "d" },
        ]),
      ].sort()
    ).toEqual(["a", "b", "c", "d"])
  })
})
