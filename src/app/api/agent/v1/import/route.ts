import { createBookmark, createFolder } from "@/lib/agent/mutations"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"
import { flattenBackupForImport, parseMarcadoresBackupJson } from "@/features/marcadores/utils/marcadoresBackup"

export async function POST(req: Request) {
  return withAgent(req, "library:import", async (ctx) => {
    const body = await req.text()
    const backup = parseMarcadoresBackupJson(body)
    const items = flattenBackupForImport(backup)
    const idMap = new Map<string, string>()
    let folders = 0
    let bookmarks = 0
    for (const item of items) {
      if (item.type === "folder") {
        const parent_id = item.parentTempId ? (idMap.get(item.parentTempId) ?? null) : null
        const folder = await createFolder(ctx.userId, {
          name: item.name,
          parent_id,
          sort_order: item.sort_order,
        })
        idMap.set(item.tempId, folder.id as string)
        folders += 1
      } else {
        const folder_id = item.parentTempId ? (idMap.get(item.parentTempId) ?? null) : null
        await createBookmark(ctx.userId, {
          title: item.title,
          url: item.url,
          folder_id,
          description: item.description,
          tags: item.tags,
          is_favorite: item.is_favorite,
          metadata: item.metadata,
        })
        bookmarks += 1
      }
    }
    await writeAudit({
      ctx,
      action: "import_library",
      req,
      payload: { folders, bookmarks },
    })
    return jsonOk({ ok: true, folders, bookmarks }, 201)
  })
}
