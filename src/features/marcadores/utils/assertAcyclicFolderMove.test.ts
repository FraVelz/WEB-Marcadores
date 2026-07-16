import { describe, expect, it } from "vitest"

import { assertAcyclicFolderMove, CyclicFolderMoveError, CYCLIC_FOLDER_MOVE_MESSAGE } from "./assertAcyclicFolderMove"
import type { FlatFolder } from "./types"

const folders: FlatFolder[] = [
  { id: "root-a", parent_id: null, name: "A", sort_order: 0 },
  { id: "child-b", parent_id: "root-a", name: "B", sort_order: 0 },
  { id: "grandchild-c", parent_id: "child-b", name: "C", sort_order: 0 },
]

function applyFolderMove(folders: FlatFolder[], folderId: string, destParentId: string | null): FlatFolder[] {
  assertAcyclicFolderMove(folders, folderId, destParentId)
  return folders.map((f) => (f.id === folderId ? { ...f, parent_id: destParentId } : f))
}

describe("assertAcyclicFolderMove", () => {
  it("rejects moving a folder into itself", () => {
    expect(() => assertAcyclicFolderMove(folders, "root-a", "root-a")).toThrow(CyclicFolderMoveError)
    expect(() => assertAcyclicFolderMove(folders, "root-a", "root-a")).toThrow(CYCLIC_FOLDER_MOVE_MESSAGE)
  })

  it("rejects moving a parent folder into its child", () => {
    expect(() => assertAcyclicFolderMove(folders, "root-a", "child-b")).toThrow(CyclicFolderMoveError)
    expect(() => assertAcyclicFolderMove(folders, "root-a", "grandchild-c")).toThrow(CyclicFolderMoveError)
  })

  it("allows moving a child folder to root", () => {
    expect(() => assertAcyclicFolderMove(folders, "child-b", null)).not.toThrow()
  })

  it("allows moving a sibling under another root folder", () => {
    const withSibling: FlatFolder[] = [...folders, { id: "root-d", parent_id: null, name: "D", sort_order: 1 }]
    expect(() => assertAcyclicFolderMove(withSibling, "child-b", "root-d")).not.toThrow()
  })

  it("does not mutate folder state when a cyclic move is rejected", () => {
    const snapshot = structuredClone(folders)

    expect(() => applyFolderMove(folders, "root-a", "child-b")).toThrow(CyclicFolderMoveError)
    expect(folders).toEqual(snapshot)

    const guarded = (() => {
      try {
        return applyFolderMove(folders, "root-a", "child-b")
      } catch {
        return folders
      }
    })()

    expect(guarded).toEqual(snapshot)
  })
})
