import { describe, expect, it } from "vitest"

import { benchmarkFlatten, flattenTreeRows, makeSyntheticLibrary } from "./measureTreeFlatten"

/** Threshold from plan C3-1: virtualize only if >300 measured *and* jank. */
export const VIRTUALIZE_NODE_THRESHOLD = 300

describe("measureTreeFlatten (C3-1)", () => {
  it("builds synthetic libraries at the 300-node gate", () => {
    const lib = makeSyntheticLibrary(VIRTUALIZE_NODE_THRESHOLD)
    expect(lib.nodeCount).toBeGreaterThanOrEqual(VIRTUALIZE_NODE_THRESHOLD)
    const rows = flattenTreeRows(lib.folders, lib.bookmarks)
    expect(rows.length).toBe(lib.nodeCount)
  })

  it("records flatten timings at 100/300/500/1000 (evidence for ADR skip)", () => {
    const samples = [100, 300, 500, 1000].map((n) => benchmarkFlatten(n))
    for (const s of samples) {
      expect(s.rowCount).toBe(s.nodeCount)
      // Pure walk stays well under INP budget even at 1000 nodes.
      expect(s.avgMs).toBeLessThan(50)
    }
    // Soft assert documented in ADR: 300-node flatten is sub-millisecond class on CI.
    const at300 = samples.find((s) => s.nodeCount >= VIRTUALIZE_NODE_THRESHOLD)!
    expect(at300.avgMs).toBeLessThan(5)
  })
})
