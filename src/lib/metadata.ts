import type { Metadata } from "next"

const METADATA_CRAWLER_UA =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|pinterest|applebot|embedly|skypeuripreview|redditbot|googlebot|bingbot|duckduckbot/i

type HeaderLike = { get(name: string): string | null }

export function resolveSiteUrl(headersList: HeaderLike): string {
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host")
  if (host) {
    const h = host.split(",")[0].trim()
    const protoHeader = headersList.get("x-forwarded-proto")
    const proto = protoHeader ?? (h.includes("localhost") || h.startsWith("127.") ? "http" : "https")
    return `${proto}://${h}`
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (envUrl) return envUrl

  return "https://web-marcadores.vercel.app"
}

export function isMetadataCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  return METADATA_CRAWLER_UA.test(userAgent)
}

/** Rutas generadas por convención de metadata de Next (og:image, twitter:image, icon). */
export function isMetadataAssetPath(pathname: string): boolean {
  const asset =
    /(?:^|\/)(?:opengraph-image|twitter-image|icon)(?:[-.][a-z0-9]+)*$/i
  return asset.test(pathname)
}

export function buildRouteMetadata(opts: {
  title: string
  description: string
  path: string
  siteUrl: string
}): Metadata {
  const base = opts.siteUrl.replace(/\/$/, "")
  const canonicalUrl = opts.path === "/" ? base : `${base}${opts.path}`
  const ogTitle = opts.title.includes("Marcadores") ? opts.title : `${opts.title} | Marcadores`

  return {
    title: opts.title,
    description: opts.description,
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
    },
  }
}

export function buildHomeMetadata(siteUrl: string): Metadata {
  return {
    title: "Marcadores · Inicia sesión",
    description:
      "Accede a tus marcadores o prueba la demo: carpetas, búsqueda y atajos de teclado en una interfaz limpia.",
    openGraph: {
      title: "Marcadores | Gestor de favoritos y carpetas",
      description:
        "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "Marcadores | Gestor de favoritos y carpetas",
      description:
        "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
    },
  }
}

/** Metadatos estáticos del layout raíz (sin metadataBase; se completa en generateMetadata). */
export const rootLayoutMetadata: Metadata = {
  title: {
    default: "Marcadores | Gestor de favoritos y carpetas",
    template: "%s | Marcadores",
  },
  description:
    "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. " +
    "Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
  keywords: ["marcadores", "favoritos", "bookmarks", "organización", "carpetas"],
  authors: [{ name: "Marcadores" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_US",
    siteName: "Marcadores",
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. " +
      "Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
  },
  robots: {
    index: true,
    follow: true,
  },
}
