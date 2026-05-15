export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import { AppAppearanceProvider } from "@/contexts/AppAppearanceContext"
import { APP_APPEARANCE_STORAGE_KEY } from "@/lib/appAppearance"
import { TAB_SCOPE_FALLBACK_ID, TAB_SCOPE_SESSION_KEY } from "@/lib/tabScopedStorage"

import "./globals.css"

const APPEARANCE_INIT_SCRIPT = `try{
var SK=${JSON.stringify(TAB_SCOPE_SESSION_KEY)};
var FB=${JSON.stringify(TAB_SCOPE_FALLBACK_ID)};
var BK=${JSON.stringify(APP_APPEARANCE_STORAGE_KEY)};
var sid=null;
try{
sid=sessionStorage.getItem(SK);
if(!sid){sid=crypto.randomUUID();sessionStorage.setItem(SK,sid)}
}catch(__){sid=FB}
var k=sid+'::'+BK;
var raw=null;
try{
raw=localStorage.getItem(BK);
if(raw==null)raw=localStorage.getItem(k);
}catch(__){}
var d=null;
try{if(raw)d=JSON.parse(raw)}catch(__){}
if(!d||typeof d!=='object'){
document.documentElement.classList.add('dark');
}else{
var r=document.documentElement;
if(d.theme==='light'){r.classList.remove('dark')}
else if(d.theme==='dark'){r.classList.add('dark')}
else{if(window.matchMedia('(prefers-color-scheme: dark)').matches)r.classList.add('dark');else r.classList.remove('dark')}
if(d.useCustomPalette&&d.customColors&&typeof d.customColors==='object'){
var pairs=[['canvas','--app-canvas'],['sidebar','--app-sidebar'],['toolbar','--app-toolbar'],['raised','--app-raised'],['fg','--app-fg'],['primary','--app-primary']];
for(var i=0;i<pairs.length;i++){var key=pairs[i][0];var vv=d.customColors[key];
if(typeof vv!=='string')continue;var m=vv.match(/^#?([0-9a-f]{6})$/i);if(!m)continue;var hc='#'+m[1].toLowerCase();
r.style.setProperty(pairs[i][1],hc)}
var pk=d.customColors.primary;var pm=(typeof pk==='string'&&pk.match(/^#?([0-9a-f]{6})$/i));
if(pm){var pr='#'+pm[1].toLowerCase();r.style.setProperty('--app-accent',pr);r.style.setProperty('--app-link',pr);r.style.setProperty('--app-focus',pr);r.style.setProperty('--app-primary-hover','color-mix(in srgb,'+pr+' 82%, black)')}}
var tss=d.textSelection;
if(typeof tss==='string'){
var tsm=tss.match(/^#?([0-9a-f]{6})$/i);
if(tsm){var tsx='#'+tsm[1].toLowerCase();r.style.setProperty('--app-text-selection-bg','color-mix(in srgb,'+tsx+' 30%, transparent)');}
}
var dwt=d.deskWindowTransparency;if(typeof dwt==='number'&&isFinite(dwt)){var dt=Math.min(1,Math.max(0,dwt));r.style.setProperty('--app-desk-window-solid-pct',String(100-dt*62)+'%')}
}
}catch(__){}`

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
    "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. " +
    "Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
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
      "Organiza tus marcadores en carpetas, usa atajos y explora tu colección. " +
      "Interfaz oscura tipo explorador. Prueba el demo sin iniciar sesión.",
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Tema antes de pintar para evitar flash; sin tapiz aquí */}
        <Script id="appearance-init-bootstrap" strategy="beforeInteractive">
          {APPEARANCE_INIT_SCRIPT}
        </Script>
        <AppAppearanceProvider>{children}</AppAppearanceProvider>
      </body>
    </html>
  )
}
