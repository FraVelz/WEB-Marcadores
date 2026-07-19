import { listFolders } from "@/lib/agent/queries"
import { createFolder } from "@/lib/agent/mutations"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const folders = await listFolders(ctx.userId)
    await writeAudit({ ctx, action: "list_folders", req, payload: { count: folders.length } })
    return jsonOk({ folders })
  })
}

export async function POST(req: Request) {
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as { name?: string; parent_id?: string | null; color?: string | null }
    const folder = await createFolder(ctx.userId, {
      name: String(body.name ?? ""),
      parent_id: body.parent_id ?? null,
      color: body.color ?? null,
    })
    await writeAudit({
      ctx,
      action: "create_folder",
      req,
      resourceType: "folder",
      resourceId: folder.id,
    })
    return jsonOk({ folder }, 201)
  })
}
