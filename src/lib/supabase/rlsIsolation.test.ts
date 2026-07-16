import { describe, expect, it } from "vitest"

import { rlsAllowInsert, rlsAllowMutation, rlsSelectOwnedRows } from "./rlsPolicy"

const USER_A = "11111111-1111-1111-1111-111111111111"
const USER_B = "22222222-2222-2222-2222-222222222222"

const folders = [
  { id: "f-a1", user_id: USER_A, name: "A root" },
  { id: "f-a2", user_id: USER_A, name: "A nested" },
  { id: "f-b1", user_id: USER_B, name: "B root" },
]

const bookmarks = [
  { id: "b-a1", user_id: USER_A, url: "https://a.example" },
  { id: "b-b1", user_id: USER_B, url: "https://b.example" },
]

describe("RLS isolation user A ≠ B", () => {
  it("SELECT: user A only sees own folders", () => {
    const visible = rlsSelectOwnedRows(folders, USER_A)
    expect(visible.map((f) => f.id)).toEqual(["f-a1", "f-a2"])
    expect(visible.some((f) => f.user_id === USER_B)).toBe(false)
  })

  it("SELECT: user B only sees own folders", () => {
    const visible = rlsSelectOwnedRows(folders, USER_B)
    expect(visible.map((f) => f.id)).toEqual(["f-b1"])
    expect(visible.some((f) => f.user_id === USER_A)).toBe(false)
  })

  it("SELECT: user A cannot read B bookmarks", () => {
    const visible = rlsSelectOwnedRows(bookmarks, USER_A)
    expect(visible.map((b) => b.id)).toEqual(["b-a1"])
    expect(visible.find((b) => b.id === "b-b1")).toBeUndefined()
  })

  it("SELECT: anonymous gets empty set", () => {
    expect(rlsSelectOwnedRows(folders, null)).toEqual([])
    expect(rlsSelectOwnedRows(bookmarks, null)).toEqual([])
  })

  it("INSERT: A cannot insert row claimed as B", () => {
    expect(rlsAllowInsert(USER_A, USER_B)).toBe(false)
    expect(rlsAllowInsert(USER_A, USER_A)).toBe(true)
  })

  it("UPDATE/DELETE: A cannot mutate B row", () => {
    const bFolder = folders.find((f) => f.id === "f-b1")!
    expect(rlsAllowMutation(USER_A, bFolder)).toBe(false)
    expect(rlsAllowMutation(USER_B, bFolder)).toBe(true)
  })

  it("UPDATE/DELETE: missing row is denied", () => {
    expect(rlsAllowMutation(USER_A, null)).toBe(false)
    expect(rlsAllowMutation(USER_A, undefined)).toBe(false)
  })
})
