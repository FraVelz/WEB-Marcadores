export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { cookies, headers } from "next/headers"

import { resolveSiteUrl, rootLayoutMetadata } from "@/lib/metadata"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google"

import { AppAppearanceProvider } from "@/contexts/AppAppearanceContext"
import { loadAppAppearanceFromCookies } from "@/lib/appAppearance"

import {
  buildAppearanceInlineStyle,
  buildHtmlClassName,
  readPrefersColorSchemeDark,
  resolveDarkClassForServer,
} from "@/lib/appAppearanceHtml"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const siteUrl = resolveSiteUrl(headersList)

  return {
    ...rootLayoutMetadata,
    metadataBase: new URL(siteUrl),
    openGraph: {
      ...rootLayoutMetadata.openGraph,
      url: siteUrl,
    },
  }
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()])

  const appearance = loadAppAppearanceFromCookies(cookieStore)
  const prefersDark = readPrefersColorSchemeDark(headersList)
  const useDark = resolveDarkClassForServer(appearance.theme, prefersDark)

  const htmlClass = buildHtmlClassName(useDark)
  const htmlStyle = buildAppearanceInlineStyle(appearance, useDark)

  return (
    <html lang="es" className={htmlClass} style={htmlStyle} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Script src="/appearance-init.js" strategy="beforeInteractive" />

        <AppAppearanceProvider initialAppearance={appearance}>{children}</AppAppearanceProvider>
        <Analytics />
      </body>
    </html>
  )
}
