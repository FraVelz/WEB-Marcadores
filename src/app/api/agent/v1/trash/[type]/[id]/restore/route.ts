import { restoreTrashItem } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ type: string; id: string }> }

export async function POST(req: Request, context: Ctx) {
  const { type, id } = await context.params
  return withAgent(req, "trash:write", async (ctx) => {
    if (type !== "bookmark" && type !== "folder") {
      const err = new Error("type must be bookmark|folder") as Error & { status: number; code: string }
      err.status = 400
      err.code = "invalid_type"
      throw err
    }
    await restoreTrashItem(ctx.userId, type, id)
    await writeAudit({
      ctx,
      action: "restore_trash",
      req,
      resourceType: type,
      resourceId: id,
    })
    return jsonOk({ ok: true })
  })
}
