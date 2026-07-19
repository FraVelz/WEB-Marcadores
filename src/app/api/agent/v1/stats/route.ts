import { getStats } from "@/lib/agent/queries"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const stats = await getStats(ctx.userId)
    await writeAudit({ ctx, action: "get_stats", req })
    return jsonOk(stats)
  })
}
