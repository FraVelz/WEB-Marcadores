import { updateFolder } from "@/lib/agent/mutations"
import { softDeleteFolder } from "@/lib/agent/trash"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as Record<string, unknown>
    const folder = await updateFolder(ctx.userId, id, body as never)
    await writeAudit({ ctx, action: "update_folder", req, resourceType: "folder", resourceId: id })
    return jsonOk({ folder })
  })
}

export async function DELETE(req: Request, context: Ctx) {
  const { id } = await context.params
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const result = await softDeleteFolder(ctx.userId, id)
    await writeAudit({
      ctx,
      action: "soft_delete_folder",
      req,
      resourceType: "folder",
      resourceId: id,
      payload: result,
    })
    return jsonOk({ ok: true, ...result })
  })
}
