import { listAliveBookmarks, listAliveFolders, listTrash } from "@/lib/agent/queries"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"
import { buildMarcadoresBackupJson } from "@/features/marcadores/utils/marcadoresBackup"

export async function GET(req: Request) {
  return withAgent(req, "library:export", async (ctx) => {
    const url = new URL(req.url)
    const includeTrash = url.searchParams.get("include_trash") === "true"
    const [folders, bookmarks] = await Promise.all([listAliveFolders(ctx.userId), listAliveBookmarks(ctx.userId)])
    const backup = buildMarcadoresBackupJson(folders, bookmarks)
    let trash = undefined
    if (includeTrash) {
      trash = await listTrash(ctx.userId)
    }
    await writeAudit({
      ctx,
      action: "export_library",
      req,
      payload: { bookmarks: bookmarks.length, folders: folders.length, include_trash: includeTrash },
    })
    return jsonOk({ ...backup, ...(trash ? { trash } : {}) })
  })
}
