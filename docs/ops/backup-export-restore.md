# Backup / export + restore (C2-2)

## Qué hay en la app

| Acción                | Dónde                                     | Formato                                      |
| --------------------- | ----------------------------------------- | -------------------------------------------- |
| **Exportar**          | Toolbar secundaria → icono subir/export   | JSON `marcadores-backup-YYYY-MM-DD.json`     |
| **Importar Netscape** | Toolbar → icono import → `.html` / `.htm` | Netscape Bookmark File (Chrome/Firefox/Edge) |
| **Restaurar backup**  | Mismo import → `.json`                    | Schema v1 (`docs` abajo)                     |

Implementación: `src/features/marcadores/utils/marcadoresBackup.ts`, `netscapeBookmarks.ts`, `persistMarcadoresImport.ts`.

## Export (backup)

1. Inicia sesión (o usa `/demo` para probar en memoria).
2. Abre Marcadores → exportar JSON.
3. Guarda el archivo fuera del navegador (Drive, disco, etc.).
4. El JSON incluye carpetas + marcadores del usuario cargados en la sesión (RLS ya filtró en Supabase).

### Schema v1

```json
{
  "version": 1,
  "exportedAt": "2026-07-15T12:00:00.000Z",
  "folders": [{ "id": "…", "parent_id": null, "name": "Dev", "sort_order": 0 }],
  "bookmarks": [{ "title": "Docs", "url": "https://…", "folder_id": "…", "tags": [], "is_favorite": false }]
}
```

- Solo URLs `http`/`https` se reimportan.
- Límite de archivo de import: **5 MB**.
- Rate limit import (cliente): **5 intentos / 10 min** + máx. **5000** nodos por archivo (`importRateLimit.ts`).
- Soft delete / papelera: **no** en mid hired — ver `docs/adr/0002-no-soft-delete.md`.

## Restore

1. **Preferido:** importar el JSON de backup en la carpeta destino (raíz o carpeta actual).
2. Se crean **nuevas** filas (nuevos IDs); no sobrescribe ni borra lo existente.
3. Si restauras en una cuenta vacía, el resultado es un espejo del backup.
4. Alternativa Chrome→app: export HTML desde el navegador → import Netscape.

## Verificación rápida

```bash
pnpm test -- src/features/marcadores/utils/marcadoresBackup.test.ts src/features/marcadores/utils/netscapeBookmarks.test.ts
```

En UI: export → borrar un marcador de prueba → reimportar JSON → el enlace reaparece (como copia).

## Relacionado

- Runbook pérdida de datos: [`bookmarks-perdidos.md`](./bookmarks-perdidos.md)
- Uso real (evidencia humana): [`uso-real-checklist.md`](./uso-real-checklist.md)

Actualizado: 2026-07-15.
