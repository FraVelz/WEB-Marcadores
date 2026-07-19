# MCP Agent + Papelera

Remote MCP (Streamable HTTP) and Agent REST for WEB-Marcadores.

## Endpoints

| Surface     | URL                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| MCP         | `POST/GET /api/mcp` (Bearer `wm_…` or Supabase JWT)                                                                                   |
| Agent REST  | `/api/agent/v1/*`                                                                                                                     |
| OpenAPI     | `GET /api/agent/v1/openapi`                                                                                                           |
| Health      | `GET /api/agent/v1/health`                                                                                                            |
| Trash purge | `POST /api/agent/v1/cron/purge-trash` (`Authorization: Bearer $CRON_SECRET`) — schedule via GitHub Actions (not Vercel Cron on Hobby) |

## Cursor MCP config

Create a PAT in **Perfil → Agent Access**, then add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "web-marcadores": {
      "url": "https://YOUR_HOST/api/mcp",
      "headers": {
        "Authorization": "Bearer wm_YOUR_TOKEN"
      }
    }
  }
}
```

## Scopes

`bookmarks:read`, `bookmarks:write`, `library:export`, `library:import`, `trash:read`, `trash:write`

Token CRUD uses the browser session cookie only (not PATs).

## Soft-delete / trash

Deletes from UI, API, and MCP set `deleted_at` (30-day retention). Hard purge requires `confirm: true` + `trash:write`, or the scheduled GitHub Action / `pg_cron` after retention.

See [trash-purge.md](./trash-purge.md).

## Folder write tools (MCP)

| Tool            | Purpose                                      |
| --------------- | -------------------------------------------- |
| `create_folder` | Create under optional `parent_id`            |
| `update_folder` | Rename / reparent / `sort_order`             |
| `move_folder`   | Reparent only (`parent_id` null = root)      |
| `delete_folder` | Soft-delete folder + subtree (30-day trash)  |

## Env

- `SUPABASE_SERVICE_ROLE_KEY` (required for agent/MCP)
- `CRON_SECRET` (purge job)
- `AGENT_RATE_LIMIT_PER_MIN` (default 120)
- `TRASH_RETENTION_DAYS` (documented; code constant is 30)

Demo mode has no agent access.
