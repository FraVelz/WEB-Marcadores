# Actualizar documentación (ortografía + espejo EN/ES)

Usar cuando el usuario invoque **`/update-docs`**, adjunte `.cursor/commands/update-docs.md` o mencione esta
instrucción, con uno o más archivos Markdown (`@`).

## Modos

- **Por defecto / `@` archivos:** ortografía + sync del par bilingüe (según idioma fuente).
- **`sync-en` / "sincronizar a inglés":** tomar `README.md` (y docs ES si aplica) como
  **fuente** y **actualizar o crear** el espejo EN (`README.EN.md` / `README.en.md`). No
  reescribir el ES salvo typos. En el EN, la cabecera debe incluir:
  `This document is in English. [Versión en español](./README.md)`.

## Objetivo

1. **Revisar ortografía y redacción** del archivo fuente (según el idioma del documento) y **aplicar correcciones en el
   mismo archivo**.
2. **Sincronizar el contenido** con la versión en el **otro idioma** del proyecto, manteniendo el mismo significado y
   estructura.
3. Si el documento es o debe tratarse como **generado por IA**, mantener al final la **marca y la fecha de última
   actualización** y **actualizar el contenido factual** según el tipo de archivo (estructura del repo, rutas, scripts,
   etc.).

## Idioma fuente y archivo espejo

- Inferir el idioma del contenido (ES vs EN), no solo por la ruta.
- **Pares habituales en este monorepo:**
  - Raíz: `README.md` ↔ homólogo en inglés. **Comprobar en el repo** cuál existe: `README.EN.md`, `README.en.md` u otra
    convención ya usada; no inventar el nombre del archivo.
  - Docs: `docs/es/` ↔ `docs/en/` (misma ruta relativa dentro de cada árbol, salvo excepciones documentadas en este
    archivo).
  - Subcarpeta `docs/` en la raíz: si existe el par, p. ej. `docs/README.md` ↔ `docs/README.EN.md`.

Si no existe par conocido (p. ej. un `readme.md` solo dentro de `src/features/...`), **no inventar** otro archivo:
corregir ortografía del adjunto y **avisar** que no hay espejo bilingüe en el repo.

## Documentación generada por IA

### Cuándo aplica

- El archivo **ya incluye** al final una línea o bloque que indica que fue generado por IA (o equivalente).
- El usuario **indica** que el archivo fue generado por IA aunque aún **no tenga la marca**: en ese caso, **añadir o
  normalizar** el pie y tratarlo como generado por IA en lo sucesivo.

### Pie obligatorio al final del archivo

En **cada archivo tocado** que entre en esta categoría, el **último contenido** del Markdown debe incluir la marca y la
**fecha exacta del día de ejecución** del comando (fecha actual del entorno o la indicada en la conversación como “hoy”;
no inventar fechas).

**Archivos en español** (ejemplo de formato):

```markdown
---

_Archivo generado por IA. Última actualización: sábado, 22 de mayo de 2026._
```

**Archivo espejo en inglés** (`README.en.md`, `README.EN.md`, `docs/en/...`):

```markdown
---

_AI-generated file. Last updated: Saturday, May 22, 2026._
```

También puede usarse un bloque cita al final del README (convención del proyecto):

```markdown
> Este documento fue generado o actualizado con asistencia de inteligencia artificial. Última actualización: **22 de
> mayo de 2026**.
```

```markdown
> This document was generated or updated with AI assistance. Last updated: **May 22, 2026**.
```

- Si ya existía un pie similar, **reemplazarlo** actualizando la fecha; si hubo cambios sustantivos, actualizar
  contenido y fecha.
- No duplicar marcas en el mismo archivo.

### Actualizar según el tipo de documento

| Tipo de documento (ejemplos)               | Acción                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| Estructura de carpetas, árbol del proyecto | Inspeccionar el repo y **alinear** el documento con la realidad actual. |
| Rutas, comandos, scripts, stack            | Contrastar con `package.json`, `src/`, CI, etc.                         |
| Resúmenes ejecutivos / índices             | Ajustar enlaces rotos y referencias obsoletas.                          |

Si no es posible inferir el tipo, **preguntar al usuario** solo cuando haga falta información que no esté en el repo.

## README bilingüe en la raíz

Cuando el usuario actualice `README.md` o su homólogo en inglés en la **raíz del repo**:

1. **Enlace bilingüe** justo tras el `#` del título: en `README.md` → «English version» hacia `./README.EN.md` (o
   `./README.en.md`); en el inglés, la cabecera debe incluir: `This document is in English. [Versión en español](./README.md)`.
2. **Conservar** el orden y los encabezados de secciones ya establecidos en ese README (no reordenar ni fusionar sin
   petición explícita).
3. **Contrastar** con el código: `package.json` (scripts, gestor `pnpm`/`npm`), estructura real de carpetas en bloques
   `text`, URLs de deploy, variables de entorno mencionadas.
4. Si el proyecto usa **pie de asistencia de IA** en README, actualizarlo en **ambos** idiomas con la **misma fecha
   calendario** y formato adaptado a cada lengua.
5. No ampliar el alcance a otros `.md` salvo que el usuario lo pida; para muchos archivos bajo `docs/es` y `docs/en`,
   valorar **`/update-global-ia-docs`** si existe en este repo.

## Pasos para el agente

1. **Leer** los archivos `@` indicados.
2. Determinar si deben tratarse como **generados por IA**.
3. **Corregir** en el archivo fuente: ortografía, tildes, puntuación, redacción breve sin cambiar alcance técnico.
4. Si es IA o contenido factual: **actualizar** según la tabla de tipos (explorar el repo).
5. Si es IA: **asegurar o añadir** el pie con fecha de hoy (y equivalente en el espejo).
6. **Resolver la ruta espejo** (`README` o `docs/es` ↔ `docs/en`).
7. **Actualizar el archivo en el otro idioma:** traducción alineada, misma estructura Markdown, enlaces relativos
   corregidos (`docs/es/...` ↔ `docs/en/...`), identificadores de código sin traducir.
8. Si el usuario pasó **varios** archivos, repetir por cada uno con par bilingüe.
9. **Resumen final** al usuario: archivos tocados, tratamiento IA, ambigüedades resueltas.

## Barrido masivo (`docs/es` + `docs/en`)

Si el repositorio tiene **mucha** documentación bajo `docs/es/` y `docs/en/` y existe el comando
**`/update-global-ia-docs`**, usarlo para refrescar en bloque los `.md` con pie de IA. **`/update-docs`** sigue siendo
el comando para **uno o pocos archivos** concretos (incluido README raíz).

## Restricciones

- No eliminar secciones enteras salvo petición explícita o que el fuente ya las haya eliminado.
- No añadir **contenido narrativo nuevo** en el espejo más allá de traducción alineada; excepción: pie IA y datos
  factuales del repo.
- Respuesta al usuario en **español** si no indica otro idioma.
