# Runbook — Bookmarks perdidos (C2-3)

**Síntoma:** el usuario no ve carpetas/enlaces que cree haber guardado.

## 1. Triage rápido (2 min)

| Pregunta | Si sí… |
|----------|--------|
| ¿Está en `/demo`? | Demo es **memoria de sesión**; no es la cuenta. Salir de demo e iniciar sesión. |
| ¿Otra cuenta / otro navegador? | Comprobar email en Perfil; no hay sync cross-account. |
| ¿Filtro de búsqueda activo? | Limpiar búsqueda; empty search ≠ carpeta vacía. |
| ¿Carpeta distinta / árbol colapsado? | Breadcrumb → raíz; expandir árbol. |

## 2. ¿Datos en Supabase?

1. Usuario autenticado en producción.
2. Dashboard Supabase → Table Editor → `bookmarks` / `folders` filtrar por `user_id`.
3. Si **hay filas** pero la UI no: problema de fetch/cliente (consola, RLS, sesión).
4. Si **no hay filas**: no se persistió o se borró — ir a restore.

## 3. RLS / aislamiento

Policies en `supabase/rls-policies.sql` (solo `auth.uid() = user_id`).

- Si el usuario ve datos ajenos → incidente de seguridad (no este runbook).
- Si no ve los suyos con sesión válida → revisar políticas aplicadas en el proyecto remoto vs SQL del repo.

## 4. Restore desde backup

1. Pedir el JSON exportado (`docs/ops/backup-export-restore.md`).
2. Importar `.json` en Marcadores (no borra lo existente; crea copia).
3. Si solo tiene HTML del navegador: import Netscape `.html`.
4. Confirmar conteo de enlaces tras import.

Sin backup: no hay papelera soft-delete aún — comunicar límite honesto.

## 5. Mutaciones fallidas / Sentry

1. Sentry → Issues con tag `area:marcadores` y `mutation:*` (create/move/delete/import).
2. Correlacionar timestamp con la queja del usuario.
3. Alertas: [`alerts-mutations.md`](./alerts-mutations.md).

## 6. Cierre

- Anotar: demo vs authed, ¿datos en DB?, ¿restore aplicado?, issue Sentry.
- Si fue confusión demo/cuenta: mejorar copy del banner (ya existe `DemoBanner`).

Actualizado: 2026-07-15.
