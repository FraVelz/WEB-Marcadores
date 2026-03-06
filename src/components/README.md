# Componentes reutilizables

Componentes Astro/MDX para la documentación de marcadores.

## Estructura

```
src/components/
├── BookmarkLink.astro    # Enlace con icono (opcional)
├── SectionCount.astro    # Badge con conteo de enlaces
└── utils/
    └── favicon.ts        # Utilidades (getFaviconUrl, etc.)
```

## Uso en MDX

```mdx
import { BookmarkLink } from '../components/BookmarkLink.astro';

<BookmarkLink href="https://example.com" title="Ejemplo" />
```

## Personalización

Los componentes pueden extenderse para añadir más funcionalidad (filtros, búsqueda, etc.).
