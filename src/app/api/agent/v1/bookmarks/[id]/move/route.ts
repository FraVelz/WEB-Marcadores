import { moveBookmark } from "@/lib/agent/mutations"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as { folder_id?: string | null }
    const bookmark = await moveBookmark(ctx.userId, id, body.folder_id ?? null)
    await writeAudit({
      ctx,
      action: "move_bookmark",
      req,
      resourceType: "bookmark",
      resourceId: id,
      payload: { folder_id: body.folder_id ?? null },
    })
    return jsonOk({ bookmark })
  })
}
