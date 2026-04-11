export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://web-marcadores.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Marcadores | Gestor de favoritos y carpetas",
    template: "%s | Marcadores",
  },
  description:
    "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
  keywords: ["marcadores", "favoritos", "bookmarks", "organización", "carpetas"],
  authors: [{ name: "Marcadores" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "Marcadores",
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "Interfaz principal de Marcadores: explorador de carpetas, vista de marcadores y navegación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcadores | Gestor de favoritos y carpetas",
    description:
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. Prueba el demo sin iniciar sesión.",
    images: ["/screenshot.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
