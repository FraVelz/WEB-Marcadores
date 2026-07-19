import { restoreBatch } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function POST(req: Request) {
  return withAgent(req, "trash:write", async (ctx) => {
    const body = (await req.json()) as { batch_id?: string }
    if (!body.batch_id) {
      const err = new Error("batch_id required") as Error & { status: number; code: string }
      err.status = 400
      err.code = "invalid_batch"
      throw err
    }
    const result = await restoreBatch(ctx.userId, body.batch_id)
    await writeAudit({
      ctx,
      action: "restore_batch",
      req,
      payload: { batch_id: body.batch_id, ...result },
    })
    return jsonOk({ ok: true, ...result })
  })
}
