# ADR 0002 — No soft delete / papelera (mid defer)

- **Status:** Accepted
- **Date:** 2026-07-15
- **Ticket:** C3-2

## Context

Guide `03-web-marcadores.md` places **soft delete / papelera with 30-day restore** in the **días 91–180** (mid) roadmap, not in the hired polish stop for Oleada 3. Deletes today are hard (`useMarcadoresActions` → Supabase `.delete()`). Recovery path already documented: JSON backup export/import (`docs/ops/backup-export-restore.md`, `docs/ops/bookmarks-perdidos.md`).

## Decision

**No soft delete / trash UI in Oleada 3.** Keep hard delete + confirm modal. Treat backup/export as the restore story until mid scope.

## Consequences

- **Positive:** No schema migration (`deleted_at`, purge job, RLS on trash), no dual-path UI, honest mid defer.
- **Positive:** Runbooks already say “sin papelera” — stay consistent.
- **Negative:** Accidental delete without a recent export is unrecoverable from the product alone.

## When to revisit

Ship soft delete when pursuing **mid** signal on tree+authz (guide §12 weeks 13–24), with:

- `deleted_at` on bookmarks/folders (or tombstone table)
- Papelera UI + restore
- Scheduled hard purge (e.g. 30 days)
- Updated runbook replacing “no soft-delete”

## Alternatives considered

| Option | Why not now |
|--------|-------------|
| Soft delete now | Mid feature; schema + purge ops exceed Oleada 3 polish |
| Soft delete folders only | Incomplete story; still needs restore UX |
| Undo toast (60s) | Nice UX but not a substitute for 30-day trash; optional later |

## References

- `src/features/marcadores/hooks/useMarcadoresActions.ts`
- `docs/ops/bookmarks-perdidos.md`
- `docs/ops/backup-export-restore.md`
- Plan 12 §5.2 C3-2
