# Sentry — mutaciones Marcadores (C2-4)

## Comportamiento

| Pieza             | Path                                              |
| ----------------- | ------------------------------------------------- |
| Client init       | `src/instrumentation-client.ts`                   |
| Server register   | `src/instrumentation.ts`                          |
| Helper mutaciones | `src/lib/sentry/captureMutationError.ts`          |
| Call sites        | `useMarcadoresActions`, `persistMarcadoresImport` |

- **Sin DSN → no-op** (local/CI seguros).
- Sample traces: `0.05`. Replay: off.
- URLs con tokens/query sensibles se redactan antes de extras.

## Env

```bash
NEXT_PUBLIC_SENTRY_DSN=https://…@….ingest.sentry.io/…
# opcional server override:
# SENTRY_DSN=
```

## Mutaciones instrumentadas

create/rename/move/delete folder · create/update/move/delete bookmark · import · record open (best-effort).

## Alerta

Ver [`alerts-mutations.md`](./alerts-mutations.md).

## Cierra defer C1-7

Este ticket reemplaza `docs/ops/C1-7-sentry-deferred.md` (histórico).

Actualizado: 2026-07-15.
