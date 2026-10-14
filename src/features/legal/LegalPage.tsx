import Link from "next/link"
import type { ReactNode } from "react"

import { LEGAL_LINKS } from "@/features/legal/legalLinks"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="bg-app-canvas text-app-fg min-h-dvh">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-app-fg-label text-xs font-medium tracking-wide uppercase">Marcadores</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-app-fg-muted mt-2 text-sm">Última actualización: {updated}</p>
        <article className="mt-8 space-y-8">{children}</article>
        <nav className="border-app-border mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn("text-app-link hover:underline", FOCUS_RING)}>
              {link.label}
            </Link>
          ))}
          <Link href="/" className={cn("text-app-fg-secondary hover:text-app-fg", FOCUS_RING)}>
            Inicio
          </Link>
        </nav>
      </main>
    </div>
  )
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const className = cn("text-app-link hover:underline", FOCUS_RING)
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-app-fg text-lg font-semibold">{title}</h2>
      <div className="text-app-fg-secondary space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
