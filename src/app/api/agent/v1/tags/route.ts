import { listTags } from "@/lib/agent/queries"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const tags = await listTags(ctx.userId)
    await writeAudit({ ctx, action: "list_tags", req })
    return jsonOk({ tags })
  })
}
