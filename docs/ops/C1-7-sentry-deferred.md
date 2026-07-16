# C1-7 — Sentry deferred (Oleada 2)

**Ticket:** C1-7 Sentry en mutaciones fallidas  
**Estado:** deferred → plan 12 §4.C ticket **C2-4**

## Por qué

`@sentry/nextjs` (o equivalente) **no** está en `dependencies` de este repo. Solo aparecen paquetes Sentry transitivos vía otras deps, sin SDK de app usable.

## Criterio de cierre (Oleada 2)

1. Añadir `@sentry/nextjs` (o `@sentry/react` + server wiring).
2. Capturar errores en mutaciones fallidas: create/rename/move/delete folder, bookmark persist, paste.
3. Sample rate bajo en cliente; no loguear URLs con tokens/query sensibles.
4. Cerrar C2-4 + alerta C2-5.

Actualizado: 2026-07-15.
