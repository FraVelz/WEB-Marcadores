import { listTrash } from "@/lib/agent/queries"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "trash:read", async (ctx) => {
    const items = await listTrash(ctx.userId)
    await writeAudit({ ctx, action: "list_trash", req, payload: { count: items.length } })
    return jsonOk({ items })
  })
}
