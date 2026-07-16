# Alerta — error rate mutaciones Marcadores (C2-5)

## Objetivo

Avisar cuando fallen create/rename/move/delete/import de carpetas o bookmarks a un ritmo anómalo.

## Señal

Mutaciones capturadas con `captureMutationError` (`src/lib/sentry/captureMutationError.ts`):

- Tag `area` = `marcadores`
- Tag `mutation` ∈ `create_folder`, `rename_folder`, `move_folder`, `delete_folder`, `create_bookmark`, `update_bookmark`, `move_bookmark`, `delete_bookmarks`, `import_bookmarks`, …

## Configuración en Sentry (UI)

1. Proyecto Sentry del deploy Marcadores.
2. **Alerts → Create Alert → Issues**.
3. Filtro: `area:marcadores` **and** `mutation:*` (o lista explícita).
4. Condición sugerida (tráfico bajo):
   - **Number of events** en el issue/grupo ≥ **5** en **1 hora**, **o**
   - **New issue** con tag `mutation` en entorno `production`.
5. Acción: email / Discord / Slack del maintainer.
6. Entorno: solo `production` (ignorar `development`).

## Sin DSN

Sin `NEXT_PUBLIC_SENTRY_DSN` la captura es no-op. La alerta **no** dispara hasta configurar DSN en Vercel (Production + Preview si se desea).

Ver [`sentry.md`](./sentry.md).

## Verificación

1. Con DSN en preview: forzar un fallo (p. ej. revocar sesión y mover carpeta) o `Sentry.captureException(new Error("marcadores-mutation-smoke"))` con tags.
2. Confirmar evento en Issues &lt; 1 min.
3. Confirmar que la regla de alerta entra en estado “resolved” tras smoke o se dispara el canal.

## Relacionado

- Sentry setup: [`sentry.md`](./sentry.md)
- Runbook datos perdidos: [`bookmarks-perdidos.md`](./bookmarks-perdidos.md)

Actualizado: 2026-07-15.
