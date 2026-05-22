# Instrucciones para actualizar la documentación del repo (`README`)

Cuando el usuario **invoca el comando `/update-readme`**, **adjunta** `.cursor/commands/update-readme.md` **o menciona** esta instrucción en el chat, el asistente debe aplicar las reglas siguientes antes de responder.

## Objetivo

Mantener alineados **`README.md`** (español) y **`README.EN.md`** (inglés) con el estado real del proyecto **WEB-Marcadores** (Next.js + Supabase), **sin cambiar la estructura ni el orden de secciones** descritos más abajo.

## Archivos a tocar

- `README.md` — español
- `README.EN.md` — inglés

No ampliar el alcance a otros markdown salvo que el usuario lo pida aparte.

## Enlace bilingüe en la cabecera (obligatorio)

El **texto del enlace debe estar en el idioma del archivo al que lleva**, no del archivo en el que está.

| Archivo        | Ubicación                    | Enlace hacia     | Texto del enlace (ejemplo obligatorio)                               |
| -------------- | ---------------------------- | ---------------- | -------------------------------------------------------------------- |
| `README.md`    | Justo tras el `#` del título | `./README.EN.md` | **English version** (nunca «Versión en inglés» en el README español) |
| `README.EN.md` | Justo tras el `#` del título | `./README.md`    | **Versión en español** (never “Spanish version” on the English page) |

Usar rutas relativas exactamente como en la tabla (`./README.EN.md` y `./README.md`).

## Conservar la estructura

Respetar **este orden y estos encabezados** (los títulos con emoji deben mantenerse tal cual salvo errores ortográficos corregibles en la misma lengua):

1. `#` — título: **Marcadores** (mismo nombre en ambos README salvo que acordéis otro nombre de producto)
2. Línea con enlace bilingüe (regla anterior)
3. **Sitio publicado** — una línea con la URL de despliegue vigente (p. ej. Vercel `web-marcadores.vercel.app` o la que indique `NEXT_PUBLIC_SITE_URL` / `src/app/layout.tsx`; mismo enlace en ambos idiomas, texto alrededor en el idioma de cada archivo)
4. Imagen de captura (`./public/screenshots/marcadores.png`) — `![Captura de pantalla]` / `![Screenshot]`
5. Párrafo introductorio
6. `## ✨ Características` / `## ✨ Features`
7. `## 🛠️ Tecnologías` / `## 🛠️ Stack`
8. `## 🚀 Desarrollo local` / `## 🚀 Local development`
9. `## 📁 Estructura del proyecto` / `## 📁 Project layout` — bloque `text` con un **árbol resumido** (no hace falta listar todos los archivos). Donde ayude a orientarse, incluir **algunas subcarpetas y sub-archivos representativos** (p. ej. bajo `src/app/(dashboard)/`, `src/features/*/`, `src/components/bookmark/`, `src/lib/supabase/`) con la jerarquía en árbol (`│`, `├──`, `└──`). Tras las entradas relevantes, comentario `#` (o guión largo `—` en el texto si encaja) con **mini resumen** en el idioma de ese README; no inventar rutas. Priorizar lo que entiende alguien nuevo; **sin** párrafo narrativo adicional tras el bloque
10. `## 🎯 Áreas de contenido` / `## 🎯 Content areas` (rutas del App Router coherentes con `src/app/`)
11. `## 📝 Información` / `## 📝 Details` (variables de entorno, enlaces de autor/repo si aplica)
12. `## 🙏 Contribuciones` / `## 🙏 Contributing`
13. `---`
14. Cierre amigable (estrella en GitHub, en el idioma del archivo)
15. **Pie de asistencia de IA** (siguiente sección)

No reordenar secciones, no fusionarlas y no cambiar convenciones (por ejemplo lista con guiones largos `—` en español donde ya existan).

## Pie final: texto generado con IA + fecha

**Al final absoluto de cada README**, después del cierre amigable y del `---` si ya existe ese bloque, añadir (o sustituir si ya existe un bloque de cita similar) **una línea en bloque cita**:

- En **`README.md`** (español):

  ```markdown
  > Este documento fue generado o actualizado con asistencia de inteligencia artificial. Última actualización: **DD de mes de AAAA** (fecha del día en que se aplica el cambio; usar español para el nombre del mes).
  ```

- En **`README.EN.md`** (inglés):

  ```markdown
  > This document was generated or updated with AI assistance. Last updated: **Month DD, YYYY** (calendar date when the update is applied; month name in English).
  ```

Si ambos README se editan el mismo día, ambos deben mostrar **la misma fecha calendario** con formato adaptado al idioma de cada archivo.

## Contenido a verificar en cada pasada

Al actualizar, contrastar contra el código y la config cuando sea relevante:

- `package.json` — scripts (`dev`, `build`, `start`, `lint`, `format`, `react:doctor`); **no** hay script `preview` típico de Vite; gestor **pnpm** si existe `pnpm-lock.yaml`
- `next.config.ts` — opciones de Next.js (p. ej. React Compiler)
- `src/app/` — rutas, layouts y páginas del dashboard
- `src/proxy.ts` — demo, cookies, rutas protegidas (si el README menciona comportamiento de auth/demo)
- `src/lib/supabase/` y variables en `.env.example`
- `vercel.json` si aplica
- Bloque de estructura (`text`): rutas **relevantes** + **algunos hijos** (subcarpetas y archivos clave) cuando aclaren el mapa del código; con comentario `#` donde convenga; contrastar con el repo — **sin** exhaustividad y **sin** afirmar archivos que no existan (ambos README deben mantener la misma jerarquía de ejemplo)

Si algo del README deja de ser cierto, corregirlo en **ambos** idiomas de forma paralela.

## Idioma de la conversación

Si el usuario pide respuestas en español, el mensaje de chat sigue en español; los README mantienen cada uno su lengua fija (es / en).
