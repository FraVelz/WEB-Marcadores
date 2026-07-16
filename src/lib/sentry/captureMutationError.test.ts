import { describe, expect, it } from "vitest"

import { scrubUrlForSentry } from "./captureMutationError"

describe("scrubUrlForSentry", () => {
  it("redacts sensitive query params", () => {
    expect(scrubUrlForSentry("https://x.test/a?token=abc&ok=1")).toBe("https://x.test/a?token=[redacted]&ok=1")
    expect(scrubUrlForSentry("https://x.test/?access_token=zzz")).toBe("https://x.test/?access_token=[redacted]")
  })
})
