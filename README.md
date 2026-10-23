# Marcadores

[English version](./README.EN.md)

Gestor de marcadores. Organiza enlaces en carpetas y los recorre desde el navegador. Los datos viven en Supabase.

| | |
| --- | --- |
| Autor | [Fravelz](https://github.com/FraVelz) |
| Licencia | No hay archivo de licencia en el repositorio. |
| Sitio | https://web-marcadores.vercel.app |

## Tecnologías

- Next.js, React, TypeScript, Tailwind CSS
- Supabase
- pnpm

## Estructura base

Esqueleto del repositorio. El contenido interno cambia; estas piezas se mantienen.

```text
src/
  app/          rutas
  components/   interfaz compartida
  features/     áreas del producto
  lib/          datos y sesión
  layouts/      marcos de página
supabase/       esquema y políticas
public/         estáticos
docs/           notas
```

## Puesta en marcha

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```
