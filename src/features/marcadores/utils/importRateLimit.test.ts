import { afterEach, describe, expect, it } from "vitest"

import {
  IMPORT_MAX_ITEMS,
  IMPORT_MAX_ITEMS_MESSAGE,
  IMPORT_RATE_LIMIT_MESSAGE,
  IMPORT_RATE_MAX,
  assertImportItemCount,
  assertImportRateLimit,
  createImportRateStore,
  recordImportAttempt,
  resetDefaultImportRateStore,
} from "./importRateLimit"

afterEach(() => {
  resetDefaultImportRateStore()
})

describe("importRateLimit (C3-3)", () => {
  it("allows up to IMPORT_RATE_MAX attempts in the window", () => {
    const store = createImportRateStore()
    const t0 = 1_000_000
    for (let i = 0; i < IMPORT_RATE_MAX; i++) {
      assertImportRateLimit(store, t0 + i)
      recordImportAttempt(store, t0 + i)
    }
    expect(() => assertImportRateLimit(store, t0 + IMPORT_RATE_MAX)).toThrow(IMPORT_RATE_LIMIT_MESSAGE)
  })

  it("resets after the window elapses", () => {
    const store = createImportRateStore()
    const t0 = 1_000_000
    for (let i = 0; i < IMPORT_RATE_MAX; i++) {
      recordImportAttempt(store, t0)
    }
    expect(() => assertImportRateLimit(store, t0 + 10 * 60 * 1000 + 1)).not.toThrow()
  })

  it("rejects oversized item batches", () => {
    expect(() => assertImportItemCount(IMPORT_MAX_ITEMS)).not.toThrow()
    expect(() => assertImportItemCount(IMPORT_MAX_ITEMS + 1)).toThrow(IMPORT_MAX_ITEMS_MESSAGE)
  })
})
