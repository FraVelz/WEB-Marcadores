import { getBookmark, listBookmarks } from "@/lib/agent/queries"
import { createBookmark } from "@/lib/agent/mutations"
import { withAgent, writeAudit, jsonOk } from "@/lib/agent/route-helpers"

export async function GET(req: Request) {
  return withAgent(req, "bookmarks:read", async (ctx) => {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (id) {
      const bookmark = await getBookmark(ctx.userId, id)
      await writeAudit({ ctx, action: "get_bookmark", req, resourceType: "bookmark", resourceId: id })
      return jsonOk({ bookmark })
    }
    const rows = await listBookmarks(ctx.userId, {
      folderId: url.searchParams.has("folder_id") ? url.searchParams.get("folder_id") : undefined,
      tag: url.searchParams.get("tag") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
    })
    await writeAudit({ ctx, action: "list_bookmarks", req, payload: { count: rows.length } })
    return jsonOk({ bookmarks: rows })
  })
}

export async function POST(req: Request) {
  return withAgent(req, "bookmarks:write", async (ctx) => {
    const body = (await req.json()) as Record<string, unknown>
    const bookmark = await createBookmark(ctx.userId, {
      url: String(body.url ?? ""),
      title: body.title != null ? String(body.title) : undefined,
      description: body.description != null ? String(body.description) : null,
      folder_id: (body.folder_id as string | null | undefined) ?? null,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
      ...(body.is_favorite !== undefined ? { is_favorite: Boolean(body.is_favorite) } : {}),
    })
    await writeAudit({
      ctx,
      action: "create_bookmark",
      req,
      resourceType: "bookmark",
      resourceId: bookmark.id,
    })
    return jsonOk({ bookmark }, 201)
  })
}
