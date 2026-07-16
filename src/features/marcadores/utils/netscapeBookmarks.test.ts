import { describe, expect, it } from "vitest"

import { parseNetscapeBookmarksHtml } from "./netscapeBookmarks"

const SAMPLE = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>Dev</H3>
    <DL><p>
        <DT><A HREF="https://example.com/docs">Docs</A>
        <DT><A HREF="javascript:alert(1)">Bad</A>
        <DT><A HREF="https://example.org">Org &amp; Co</A>
    </DL><p>
    <DT><A HREF="https://root.example">Root link</A>
</DL><p>
`

describe("parseNetscapeBookmarksHtml", () => {
  it("parses folders and http(s) links, skips dangerous schemes", () => {
    const result = parseNetscapeBookmarksHtml(SAMPLE)
    expect(result.folderCount).toBe(1)
    expect(result.linkCount).toBe(3)
    expect(result.skippedLinks).toBe(1)
    expect(result.roots).toHaveLength(2)
    const folder = result.roots[0]
    expect(folder?.type).toBe("folder")
    if (folder?.type === "folder") {
      expect(folder.name).toBe("Dev")
      expect(folder.children).toEqual([
        { type: "link", title: "Docs", url: "https://example.com/docs" },
        { type: "link", title: "Org & Co", url: "https://example.org" },
      ])
    }
    expect(result.roots[1]).toEqual({ type: "link", title: "Root link", url: "https://root.example" })
  })
})
