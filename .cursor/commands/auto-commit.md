# Commit local del proyecto actual

Ejecuta un **solo commit en el repositorio local**. **No ejecutes `git push`** ni modifiques la configuración de git.

## Antes de commitear

1. Revisa `git status` y `git diff` (staged y unstaged) para entender qué entra en el commit.
2. Consulta `git log -20 --oneline` (o un rango razonable) y **imita el estilo de este repo**: prefijos como `feat`, `fix`, `docs`, `refactor`, `chore`, `delete`, y opcionalmente ámbito `tipo(ámbito):` (p. ej. `feat(global): …`), en línea con los mensajes recientes.

## Mensaje: Conventional Commits

- **Idioma:** el mensaje del commit (título y cuerpo) va **siempre en inglés**.
- Formato por línea: `<tipo>(<ámbito>): <acción>` — descripción en minúsculas, imperativa, sin punto final. Si no tiene ámbito claro: `<tipo>: <acción>`.
- Tipos habituales aquí: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `test`, `delete`.
- En **un mismo commit**, cuando haga falta cubrir varios frentes, usa **una línea por tema** con ese patrón: la **primera** resume lo más importante; las **siguientes** (después de una línea en blanco) repiten `<tipo>(<ámbito>): <acción>` por cada bloque relevante del diff. Si los cambios son muy distintos, sigue valorando **commits separados**.
- Pasa el mensaje con HEREDOC, por ejemplo:

```bash
git commit -m "$(cat <<'EOF'
feat(marcadores): add desktop layout bar

fix(dashboard): fix shortcut collision on md viewport
docs: update cursor commands
EOF
)"
```

## Reglas estrictas

- Solo crear commit si hay cambios que incluir; no commits vacíos.
- **No** añadir trailers `Co-authored-by` (ni variantes) ni mencionar Cursor en el mensaje del commit; el autor del commit es solo quien trabaja en el repo.
- **Prohibido** push, force-push, reset destructivo, `--no-verify` / saltarse hooks, y cambiar `git config`, salvo que el usuario lo pida explícitamente en otro mensaje.

Tras el commit, muestra `git status` para confirmar que el árbol quedó limpio respecto a lo commiteado.
