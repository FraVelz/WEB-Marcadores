import { assertConfirm } from "@/lib/agent/validate"
import { purgeTrashItem } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ type: string; id: string }> }

export async function DELETE(req: Request, context: Ctx) {
  const { type, id } = await context.params
  return withAgent(req, "trash:write", async (ctx) => {
    if (type !== "bookmark" && type !== "folder") {
      const err = new Error("type must be bookmark|folder") as Error & { status: number; code: string }
      err.status = 400
      err.code = "invalid_type"
      throw err
    }
    const body = (await req.json().catch(() => ({}))) as { confirm?: unknown }
    assertConfirm(body.confirm, "purge")
    await purgeTrashItem(ctx.userId, type, id)
    await writeAudit({
      ctx,
      action: "purge_trash",
      req,
      resourceType: type,
      resourceId: id,
    })
    return jsonOk({ ok: true })
  })
}
