# Trash purge (30 days)

Soft-deleted bookmarks and folders stay in trash until `deleted_at + 30 days`, then are hard-deleted.

## Automatic purge (sin Vercel Cron)

Vercel Cron requiere plan de pago. En Hobby usamos una de estas opciones gratuitas:

### Opción A — GitHub Actions (recomendada)

Workflow: [`.github/workflows/purge-trash.yml`](../../.github/workflows/purge-trash.yml) (diario 04:00 UTC + `workflow_dispatch`).

Secrets del repo:

| Secret        | Valor                                                 |
| ------------- | ----------------------------------------------------- |
| `CRON_SECRET` | mismo que en Vercel / `.env`                          |
| `SITE_URL`    | `https://web-marcadores.vercel.app` (sin slash final) |

### Opción B — Supabase `pg_cron` + SQL

Si tienes `pg_cron` habilitado en el proyecto:

```sql
-- Hard-delete past retention (adjust interval if TRASH_RETENTION_DAYS changes)
select cron.schedule(
  'purge-marcadores-trash',
  '0 4 * * *',
  $$
    delete from public.bookmarks
    where deleted_at is not null
      and deleted_at < now() - interval '30 days';
    delete from public.folders
    where deleted_at is not null
      and deleted_at < now() - interval '30 days';
  $$
);
```

### Endpoint HTTP (cualquier cron externo)

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
