import { describe, expect, it } from "vitest"

import { parseScopes, requireScope, AgentAuthError, type AgentAuthContext } from "./auth"
import { daysLeftInTrash, trashPurgeAt } from "./constants"
import { assertConfirm, mergeMetadata, sanitizeMetadata } from "./validate"

describe("agent scopes", () => {
  it("defaults scopes when empty", () => {
    expect(parseScopes([])).toEqual(["bookmarks:read", "trash:read"])
  })

  it("filters unknown scopes", () => {
    expect(parseScopes(["bookmarks:read", "nope", "trash:write"])).toEqual(["bookmarks:read", "trash:write"])
  })

  it("requireScope throws when missing", () => {
    const ctx: AgentAuthContext = {
      userId: "u",
      scopes: ["bookmarks:read"],
      tokenId: null,
      authKind: "jwt",
    }
    expect(() => requireScope(ctx, "trash:write")).toThrow(AgentAuthError)
  })
})

describe("metadata", () => {
  it("merges and rejects proto", () => {
    expect(mergeMetadata({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
    expect(() => sanitizeMetadata(JSON.parse('{"__proto__":{"x":1}}'))).toThrow(/forbidden/)
  })

  it("assertConfirm requires true", () => {
    expect(() => assertConfirm(false, "purge")).toThrow(/confirm/)
    expect(() => assertConfirm(true, "purge")).not.toThrow()
  })
})

describe("trash retention", () => {
  it("computes purge date and days left", () => {
    const deleted = new Date("2026-06-01T00:00:00.000Z")
    const purge = trashPurgeAt(deleted)
    expect(purge.toISOString()).toBe("2026-07-01T00:00:00.000Z")
    expect(daysLeftInTrash(deleted, new Date("2026-06-10T00:00:00.000Z"))).toBe(21)
  })
})
