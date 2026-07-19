# Trash purge (30 days)

Soft-deleted bookmarks and folders stay in trash until `deleted_at + 30 days`, then are hard-deleted.

## Automatic purge

Call periodically (Vercel Cron, GitHub Action, or `pg_cron` HTTP):

```http
POST /api/agent/v1/cron/purge-trash
Authorization: Bearer ${CRON_SECRET}
```

Response: `{ "ok": true, "bookmarks": N, "folders": M }`.

## Manual purge

- UI: Papelera → Eliminar / Vaciar
- API: `DELETE /api/agent/v1/trash/{type}/{id}` with `{ "confirm": true }`
- MCP: `purge_from_trash` / `empty_trash` with `confirm: true`

## Apply migration

Run `supabase/migrations/20260719000000_agent_trash_mcp.sql` on the project before enabling agent features.
