import { getBookmark } from "@/lib/agent/queries"
import { updateBookmark } from "@/lib/agent/mutations"
import { softDeleteBookmark } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const bookmark = await getBookmark(ctx.userId, id)
    await writeAudit({ ctx, action: "get_bookmark", req, resourceType: "bookmark", resourceId: id })
    return jsonOk({ bookmark })
  })
}

export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as Record<string, unknown>
    const bookmark = await updateBookmark(ctx.userId, id, body as never)
    await writeAudit({ ctx, action: "update_bookmark", req, resourceType: "bookmark", resourceId: id })
    return jsonOk({ bookmark })
  })
}

export async function DELETE(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const result = await softDeleteBookmark(ctx.userId, id)
    await writeAudit({
      ctx,
      action: "soft_delete_bookmark",
      req,
      resourceType: "bookmark",
      resourceId: id,
      payload: result,
    })
    return jsonOk({ ok: true, ...result })
  })
}
