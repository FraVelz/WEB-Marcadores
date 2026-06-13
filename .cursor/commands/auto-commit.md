# Autocommit — WEB-Marcadores (Next.js + Supabase)

Usar cuando el usuario pida **hacer commit** del trabajo actual. Mensajes **Conventional Commits**, coherentes con
`git log` de este repo. **No** hacer `git push` salvo petición explícita.

## Cuándo ejecutar

- Invocación de **`/auto-commit`** o petición explícita de **commit** / **autocommit**.
- **No** commitear si el usuario no lo pidió.

## Antes de commitear

1. `git status` — staged y unstaged.
2. `git diff` — qué entra en el commit.
3. `git log -15 --oneline` — tono reciente.
4. **Respetar borrados:** si el diff elimina líneas o archivos, **no restaurarlos** ni "arreglar" el contenido antes del commit salvo petición explícita del usuario. Un borrado suele ser intencional.

**No** incluir `.env`, claves Supabase ni `.next/` salvo petición explícita.

## Ámbitos (`scope`) habituales en este repo

`marcadores`, `dashboard`, `auth`, `app`, `estadisticas`, `perfil`, `atajos`, `bookmark`, `appearance`, `supabase`,
`readme`, `cursor`, `ci`, `layout`, `header`, `deps`.

Rutas de referencia: `src/app/(dashboard)/`, `src/features/marcadores/`, `src/features/estadisticas/`,
`src/components/`, `src/layouts/`, `src/lib/supabase/`, `README.md` / `README.EN.md`, `.cursor/`.

## Formas de mensaje

### A) Formato lista — varias áreas

```text
refactor(marcadores): unify useMarcadoresPage and remove legacy layers

fix(app): cache appearance snapshot and prevent render loop
docs(readme): align bilingual README with current routes
```

### B) Formato clásico — un tema

```text
feat(estadisticas): add bookmarks analytics page with kpis and css charts
```

## Tipos

| Tipo              | Uso aquí                                  |
| ----------------- | ----------------------------------------- |
| `feat`            | Marcadores, dashboard, demo, estadísticas |
| `fix`             | Auth, UI, hidratación, contraste          |
| `docs`            | README bilingüe, `.cursor/commands/`      |
| `refactor`        | Features, hooks, estado del escritorio    |
| `chore` / `style` | Deps, Prettier, ESLint                    |
| `ci`              | Workflows GitHub                          |

## Commit

```bash
git commit -m "$(cat <<'EOF'
feat(app): persist appearance in cookies with ssr theme bootstrap

chore(cursor): standardize update-docs and auto-commit commands
EOF
)"
```

## Reglas

- Mensaje en **inglés**; respuesta al chat en **español**.
- Cumplir `.cursor/rules/git-commits.mdc` (sin coautoría IA).
- Hook rechazado → nuevo commit; sin `--no-verify` salvo petición explícita.
- Enmendar si el entorno inyecta `Co-authored-by: Cursor` (commit no publicado).

## Comandos relacionados

- Documentación README: **`/update-docs`**.
