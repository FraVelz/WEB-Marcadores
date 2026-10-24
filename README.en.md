<p align="center">
  <a href="README.md">Español</a> · <a href="README.en.md">English</a>
</p>

<h1 align="center">Marcadores</h1>

<p align="center">
  <img src="public/screenshots/marcadores.png" alt="Bookmark grid" width="800">
</p>

<p align="center">Bookmarks in folders, with demo mode and Supabase.</p>

Public app for organizing links. Without `.env.local` it runs in memory. The published site is [web-marcadores.vercel.app](https://web-marcadores.vercel.app).

<p align="center">
  <a href="https://github.com/FraVelz/WEB-Marcadores/actions/workflows/ci.yml"><img src="https://github.com/FraVelz/WEB-Marcadores/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
</p>

<p align="center">
  <a href="https://skillicons.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://skillicons.dev/icons?i=nextjs,react,ts,supabase,tailwind,pnpm&theme=dark&perline=6">
      <source media="(prefers-color-scheme: light)" srcset="https://skillicons.dev/icons?i=nextjs,react,ts,supabase,tailwind,pnpm&theme=light&perline=6">
      <img alt="Next.js, React, TypeScript, Supabase, Tailwind, pnpm" src="https://skillicons.dev/icons?i=nextjs,react,ts,supabase,tailwind,pnpm&perline=6">
    </picture>
  </a>
</p>

## Features

- Folders, a grid, and a 30-day trash.
- Demo mode without Supabase.
- Shortcuts, stats, and profile.
- CI and tests in the repository.

> [!NOTE]
> The repository has no license file. That file is the gap if you want to show this seriously.

## Tech stack

- **Next.js and React** — the app.
- **Supabase** — session and data when env is set.
- **pnpm** — install and scripts.

## Quick start

```bash
pnpm install
pnpm dev
```

> [!IMPORTANT]
> `pnpm test` is the repo test script. CI runs the `ci.yml` workflow.

## Usage

Without credentials, use demo mode. With Supabase, copy `.env.example` to `.env.local` and start again.

> [!TIP]
> Run `pnpm lint` and `pnpm test` before a change.

## Contributing

Repository by [FraVelz](https://github.com/FraVelz). There is no `CONTRIBUTING.md`.

> [!WARNING]
> Do not commit `.env.local`. The tracked example is `.env.example`.

## License

This repository does not include a license file.
