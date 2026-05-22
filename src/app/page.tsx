import type { Metadata } from "next"
import { cookies } from "next/headers"

import { LoginPage } from "@/features/login/LoginPage"
import { cookieHeaderFromRequestCookies, isDemoMode } from "@/lib/demo-data"
import { APP_SCREENSHOTS } from "@/lib/siteScreenshots"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://web-marcadores.vercel.app"

export const metadata: Metadata = {
  title: "Marcadores · Inicia sesión",
  description:
    "Accede a tus marcadores o prueba la demo: carpetas, búsqueda y atajos de teclado en una interfaz limpia.",
  openGraph: {
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
    url: siteUrl,
    images: APP_SCREENSHOTS.map((s) => ({
      url: s.publicPath,
      width: 1830,
      height: 1076,
      alt: s.alt,
    })),
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
    images: APP_SCREENSHOTS.map((s) => s.publicPath),
  },
}

export default async function Page() {
  const cookieStore = await cookies()
  const demo = isDemoMode(cookieHeaderFromRequestCookies(cookieStore))

  return <LoginPage demo={demo} />
}
