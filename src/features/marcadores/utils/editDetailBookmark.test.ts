import { describe, expect, it, vi } from "vitest"

import type { Bookmark } from "@/features/marcadores/utils/types"
import { editDetailBookmark } from "@/features/marcadores/utils/editDetailBookmark"

const shown: Bookmark = {
  id: "b1",
  title: "Google Trends",
  url: "https://trends.google.es/trends/",
}

describe("editDetailBookmark", () => {
  it("opens the editor for the bookmark shown in the detail panel", () => {
    const openEdit = vi.fn()

    editDetailBookmark(shown, openEdit)

    expect(openEdit).toHaveBeenCalledTimes(1)
    expect(openEdit).toHaveBeenCalledWith(shown)
  })

  it("does nothing when the panel has no bookmark", () => {
    const openEdit = vi.fn()

    editDetailBookmark(null, openEdit)

    expect(openEdit).not.toHaveBeenCalled()
  })
})
