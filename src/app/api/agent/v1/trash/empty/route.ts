import { assertConfirm } from "@/lib/agent/validate"
import { emptyTrash } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function POST(req: Request) {
  return withAgent(req, "trash:write", async (ctx) => {
    const body = (await req.json().catch(() => ({}))) as { confirm?: unknown }
    assertConfirm(body.confirm, "empty trash")
    const result = await emptyTrash(ctx.userId)
    await writeAudit({ ctx, action: "empty_trash", req, payload: result })
    return jsonOk({ ok: true, ...result })
  })
}
