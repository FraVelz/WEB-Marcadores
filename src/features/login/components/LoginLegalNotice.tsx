import Link from "next/link"

import { LEGAL_LINKS } from "@/features/legal/legalLinks"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

export function LoginLegalNotice() {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-app-fg-muted text-center text-xs leading-relaxed">
        Al registrarte aceptas los{" "}
        <Link href="/terminos" className="text-app-link hover:underline">
          términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="text-app-link hover:underline">
          política de privacidad
        </Link>
        .
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={cn("text-app-fg-muted hover:text-app-fg", FOCUS_RING)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
