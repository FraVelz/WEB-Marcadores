# Marcadores

[Versión en español](./README.md)

Bookmark manager. Organizes links into folders and browses them in the browser. Data lives in Supabase.

| | |
| --- | --- |
| Autor | [Fravelz](https://github.com/FraVelz) |
| Licencia | This repository does not include a license file. |
| Sitio | https://web-marcadores.vercel.app |

## Stack

- Next.js, React, TypeScript, Tailwind CSS
- Supabase
- pnpm

## Base layout

Repository skeleton. Inner files change; these pieces stay.

```text
src/
  app/          routes
  components/   shared UI
  features/     product areas
  lib/          data and session
  layouts/      page frames
supabase/       schema and policies
public/         static files
docs/           notes
```

## Run

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```
