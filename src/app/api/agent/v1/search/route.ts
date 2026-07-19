import { searchBookmarks } from "@/lib/agent/queries"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const url = new URL(req.url)
    const rows = await searchBookmarks(ctx.userId, {
      q: url.searchParams.get("q") ?? undefined,
      tag: url.searchParams.get("tag") ?? undefined,
      folderId: url.searchParams.has("folder_id") ? url.searchParams.get("folder_id") : undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    })
    await writeAudit({ ctx, action: "search_bookmarks", req, payload: { count: rows.length } })
    return jsonOk({ bookmarks: rows })
  })
}
