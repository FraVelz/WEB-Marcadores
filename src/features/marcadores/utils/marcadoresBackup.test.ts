import { describe, expect, it } from "vitest"

import {
  buildMarcadoresBackupJson,
  flattenBackupForImport,
  flattenNetscapeForest,
  parseMarcadoresBackupJson,
  stringifyMarcadoresBackup,
} from "./marcadoresBackup"
import type { NetscapeNode } from "./netscapeBookmarks"

describe("marcadoresBackup", () => {
  it("round-trips export JSON", () => {
    const backup = buildMarcadoresBackupJson(
      [{ id: "f1", parent_id: null, name: "A", sort_order: 0 }],
      [{ id: "b1", title: "T", url: "https://example.com", folder_id: "f1", tags: ["x"] }]
    )
    const raw = stringifyMarcadoresBackup(backup)
    const parsed = parseMarcadoresBackupJson(raw)
    expect(parsed.folders).toHaveLength(1)
    expect(parsed.bookmarks[0]?.url).toBe("https://example.com")
    expect(parsed.bookmarks[0]?.folder_id).toBe("f1")
  })

  it("rejects non-http urls in backup bookmarks", () => {
    const raw = JSON.stringify({
      version: 1,
      exportedAt: "2026-07-15T00:00:00.000Z",
      folders: [],
      bookmarks: [{ title: "x", url: "javascript:alert(1)" }],
    })
    expect(() => parseMarcadoresBackupJson(raw)).toThrow(/no contiene/)
  })

  it("flattens netscape forest preserving parent links", () => {
    const roots: NetscapeNode[] = [
      {
        type: "folder",
        name: "Dev",
        children: [{ type: "link", title: "Docs", url: "https://example.com" }],
      },
    ]
    const flat = flattenNetscapeForest(roots)
    expect(flat.filter((i) => i.type === "folder")).toHaveLength(1)
    expect(flat.filter((i) => i.type === "link")).toHaveLength(1)
    const folder = flat.find((i) => i.type === "folder")
    const link = flat.find((i) => i.type === "link")
    expect(folder && link && link.parentTempId === folder.tempId).toBe(true)
  })

  it("flattens backup folders parents-first", () => {
    const items = flattenBackupForImport({
      version: 1,
      exportedAt: "2026-07-15T00:00:00.000Z",
      folders: [
        { id: "child", parent_id: "root", name: "Child", sort_order: 0 },
        { id: "root", parent_id: null, name: "Root", sort_order: 0 },
      ],
      bookmarks: [{ title: "L", url: "https://example.com", folder_id: "child" }],
    })
    const folderIds = items.filter((i) => i.type === "folder").map((i) => i.tempId)
    expect(folderIds.indexOf("root")).toBeLessThan(folderIds.indexOf("child"))
  })
})
