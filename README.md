# Marcadores

[English version](./README.EN.md)

**Sitio publicado:** [web-marcadores.vercel.app](https://web-marcadores.vercel.app)

![Captura de pantalla](./public/screenshot.png)

Gestor de marcadores y favoritos con Next.js y Supabase. Organiza enlaces en carpetas, usa atajos y recorre la colección con una interfaz oscura tipo explorador. Puedes usar **modo demo** sin configurar Supabase.

## ✨ Características

- Carpetas anidadas, cuadrícula de marcadores y panel de detalle con metadatos y etiquetas
- Autenticación con Supabase y sesión SSR mediante `@supabase/ssr`
- **Modo demo** sin `.env.local`: datos en memoria y acceso por botón en login o ruta `/demo` (en producción puedes forzar con `NEXT_PUBLIC_DEMO_MODE=true`)
- Atajos de teclado y vistas de **Atajos** y **Perfil**
- Interfaz coherente con Tailwind CSS v4

## 🛠️ Tecnologías

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)
- **Tailwind CSS** v4 con PostCSS
- **pnpm** (lockfile en el repositorio)
- Calidad: ESLint (`eslint-config-next`), Prettier, `react-doctor`

## 🚀 Desarrollo local

```bash
pnpm install
pnpm dev
```

Otros scripts útiles:

- `pnpm run build` / `pnpm run start` — compilación y servidor de producción
- `pnpm run lint` / `pnpm run lint:fix` — ESLint
- `pnpm run format` / `pnpm run format:check` — Prettier
- `pnpm run react:doctor` — diagnóstico de React

Sin `.env.local` o sin credenciales Supabase válidas se activa el modo demo (datos en memoria).

## 📁 Estructura del proyecto

```text
.
├── public/
│   ├── favicon.svg
│   └── screenshot.png
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── atajos/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── marcadores/page.tsx
│   │   │   └── perfil/page.tsx
│   │   ├── demo/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── bookmark/
│   │   ├── BookmarkDetailPanel.tsx
│   │   ├── BookmarkModal.tsx
│   │   ├── DashboardShell.tsx
│   │   ├── ExplorerTree.tsx
│   │   └── TagAutocomplete.tsx
│   ├── contexts/
│   │   └── DashboardContext.tsx
│   ├── features/
│   │   ├── atajos/
│   │   ├── login/
│   │   ├── marcadores/
│   │   └── perfil/
│   ├── lib/
│   │   ├── bookmark-tags.ts
│   │   ├── bookmark-utils.ts
│   │   ├── demo-data.ts
│   │   ├── supabase/client.ts
│   │   └── utils.ts
│   └── proxy.ts
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── vercel.json
└── README.EN.md
```

## 🎯 Áreas de contenido

- **`/`** — inicio de sesión (o acceso demo)
- **`/marcadores`** — vista principal del explorador de carpetas y marcadores
- **`/atajos`** — página de atajos
- **`/perfil`** — perfil y acciones de cuenta
- **`/demo`** — redirección al dashboard con cookie de sesión demo

## 📝 Información

Copia `.env.example` a `.env.local` y rellena las variables si usas Supabase fuera del modo demo.

| Variable                        | Descripción                                              |
| ------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase                                |
| `NEXT_PUBLIC_SITE_URL`          | URL del sitio (Open Graph; por defecto Vercel en código) |
| `NEXT_PUBLIC_DEMO_MODE`         | `true` para forzar modo demo en producción               |

**FraVelz**

- **GitHub:** [@FraVelz](https://github.com/FraVelz)
- **Repositorio:** [WEB-Marcadores](https://github.com/FraVelz/WEB-Marcadores)

## 🙏 Contribuciones

Las mejoras y correcciones son bienvenidas mediante issues o pull requests en el repositorio.

---

Si te resulta útil el proyecto, una estrella en GitHub ayuda a darle visibilidad.

> Este documento fue generado o actualizado con asistencia de inteligencia artificial. Última actualización: **10 de mayo de 2026**.
