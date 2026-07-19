export async function GET() {
  return Response.json({
    openapi: "3.1.0",
    info: {
      title: "WEB-Marcadores Agent API",
      version: "1.0.0",
      description: "Authenticated agent API (PAT wm_… or Supabase JWT). Soft-delete trash retains 30 days.",
    },
    servers: [{ url: "/api/agent/v1" }],
    paths: {
      "/health": { get: { summary: "Health" } },
      "/search": { get: { summary: "Search bookmarks", security: [{ bearerAuth: [] }] } },
      "/bookmarks": {
        get: { summary: "List/get bookmarks" },
        post: { summary: "Create bookmark" },
      },
      "/bookmarks/{id}": {
        get: { summary: "Get bookmark" },
        patch: { summary: "Update bookmark" },
        delete: { summary: "Soft-delete bookmark" },
      },
      "/folders": { get: { summary: "List folders" }, post: { summary: "Create folder" } },
      "/folders/{id}": { patch: { summary: "Update folder" }, delete: { summary: "Soft-delete folder subtree" } },
      "/tags": { get: { summary: "List tags" } },
      "/stats": { get: { summary: "Library stats" } },
      "/trash": { get: { summary: "List trash" } },
      "/trash/{type}/{id}/restore": { post: { summary: "Restore from trash" } },
      "/trash/{type}/{id}": { delete: { summary: "Hard purge (confirm:true)" } },
      "/trash/restore-batch": { post: { summary: "Restore by batch_id" } },
      "/trash/empty": { post: { summary: "Empty trash (confirm:true)" } },
      "/export": { get: { summary: "Export library JSON v2" } },
      "/import": { post: { summary: "Import library JSON" } },
      "/tokens": { get: { summary: "List PATs (session cookie)" }, post: { summary: "Create PAT (session cookie)" } },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", description: "wm_… PAT or Supabase JWT" },
      },
    },
  })
}
