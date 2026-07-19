import { moveFolder } from "@/lib/agent/mutations"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as { parent_id?: string | null }
    const folder = await moveFolder(ctx.userId, id, body.parent_id ?? null)
    await writeAudit({
      ctx,
      action: "move_folder",
      req,
      resourceType: "folder",
      resourceId: id,
      payload: { parent_id: body.parent_id ?? null },
    })
    return jsonOk({ folder })
  })
}
