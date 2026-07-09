# Audit WEB-Marcadores (2026-07-09)

## Summary

History rewritten to remove Cursor co-author trailers. Local CI: lint (warnings only), format, build pass.

## P0 (resolved)

- Git history cleaned and force-pushed
- Production build succeeds

## P1 (monitor)

- 14 high dependency advisories in audit — review lockfile updates
- React hooks exhaustive-deps warnings in drag/drop hooks

## P2 (backlog)

- Keyboard focus regression tests for explorer/grid
- Lighthouse on `/marcadores` dashboard routes

## Checks

| Area     | Status                                             |
| -------- | -------------------------------------------------- |
| Security | Supabase RLS assumed; session in server components |
| SEO      | App metadata per route                             |
| a11y     | `focusStyles.ts`, skip links, ARIA on modals       |
| UX       | Three-column layout, command palette               |
