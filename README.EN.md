# Marcadores

[Versión en español](./README.md)

**Published site:** [web-marcadores.vercel.app](https://web-marcadores.vercel.app) (default deployment if `NEXT_PUBLIC_SITE_URL` is unset; source on [GitHub](https://github.com/FraVelz/WEB-Marcadores)).

![Screenshot](./public/screenshot.png)

Bookmark manager built with Next.js and Supabase. Organize links in folders, use shortcuts, and browse your collection with a dark explorer-style interface. You can use **demo mode** without configuring Supabase.

## ✨ Features

- Nested folders, bookmark grid, and a detail panel with metadata and tags
- Supabase authentication and SSR session handling via `@supabase/ssr`
- **Demo mode** without `.env.local`: in-memory data and access via the login button or `/demo` route (set `NEXT_PUBLIC_DEMO_MODE=true` in production to force it)
- Keyboard shortcuts plus **Shortcuts** and **Profile** views
- Cohesive UI with Tailwind CSS v4

## 🛠️ Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)
- **Tailwind CSS** v4 with PostCSS
- **pnpm** (lockfile in the repo)
- Tooling: ESLint (`eslint-config-next`), Prettier, `react-doctor`

## 🚀 Local development

```bash
pnpm install
pnpm dev
```

Other scripts:

- `pnpm run build` / `pnpm run start` — production build and server
- `pnpm run lint` / `pnpm run lint:fix` — ESLint
- `pnpm run format` / `pnpm run format:check` — Prettier
- `pnpm run react:doctor` — React diagnostics

Without a valid `.env.local` or Supabase credentials, the app runs in demo mode (in-memory data).

## 📁 Project layout

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

## 🎯 Content areas

- **`/`** — sign-in (or demo entry)
- **`/marcadores`** — main folder and bookmark explorer
- **`/atajos`** — shortcuts page
- **`/perfil`** — profile and account actions
- **`/demo`** — redirect into the dashboard with a demo session cookie

## 📝 Details

Copy `.env.example` to `.env.local` and fill in the variables when using Supabase outside demo mode.

| Variable                        | Description                             |
| ------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key                  |
| `NEXT_PUBLIC_SITE_URL`          | Site URL (Open Graph; default Vercel in code) |
| `NEXT_PUBLIC_DEMO_MODE`         | `true` to force demo mode in production |

**FraVelz**

- **GitHub:** [@FraVelz](https://github.com/FraVelz)
- **Repository:** [WEB-Marcadores](https://github.com/FraVelz/WEB-Marcadores)

## 🙏 Contributing

Issues and pull requests are welcome.

---

If this project helps you, a GitHub star is appreciated.

> This document was generated or updated with AI assistance. Last updated: **May 10, 2026**.
