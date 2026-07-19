import type { ReactNode } from "react"
import { shortcutSections } from "./data"
import { DashboardPageHeader } from "@/layouts/dashboard/components/DashboardPageHeader"
import { cn } from "@/lib/utils"

function Kbd({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <kbd
      className={cn(
        "border-app-border bg-app-kbd-bg text-app-fg shadow-[inset_0_-2px_0_0_var(--color-app-border-muted)]",
        "inline-flex items-center justify-center rounded-md border px-2 py-1 font-mono text-xs font-medium tracking-tight",
        "min-h-8 whitespace-nowrap",
        className
      )}
    >
      {children}
    </kbd>
  )
}

function KeyCombo({ keys }: { keys: string }) {
  const parts = keys.split(/\s*\/\s*/).flatMap((p) => {
    const t = p.trim()
    return t ? [t] : []
  })

  if (parts.length < 2) {
    return <Kbd>{keys}</Kbd>
  }

  const nodes: ReactNode[] = []
  let seq = 0

  for (const part of parts) {
    if (nodes.length > 0) {
      nodes.push(
        <span
          key={`keycombo-or-${keys}-${seq++}`}
          className="text-app-fg-muted text-[11px] font-medium tracking-wider uppercase select-none"
          aria-hidden
        >
          o
        </span>
      )
    }

    nodes.push(
      <span key={`keycombo-wrap-${keys}-${seq++}`} className="flex items-center gap-2">
        <Kbd>{part}</Kbd>
      </span>
    )
  }

  return <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">{nodes}</span>
}

export function AtajosPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardPageHeader
        title="Atajos de teclado"
        subtitle="Referencia rápida de combinaciones. Las alternativas equivalentes se muestran como teclas separadas."
      />
      <div className="min-h-0 flex-1 overflow-auto p-4 pb-12 text-center sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {shortcutSections.map((section) => (
            <section key={section.title} className="scroll-mt-6">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h2 className="text-app-fg text-base font-semibold">{section.title}</h2>

                {section.hint ? (
                  <p className="text-app-fg-muted max-w-xl text-xs leading-snug sm:text-right">{section.hint}</p>
                ) : null}
              </div>

              <ul className="border-app-border-muted divide-app-border-muted bg-app-raised divide-y overflow-hidden rounded-xl border">
                {section.rows.map((row) => (
                  <li key={`${section.title}::${row.keys}::${row.desc}`} className="group relative">
                    <div
                      aria-hidden
                      className={cn(
                        "from-app-hover pointer-events-none absolute inset-y-0 left-0 z-0 w-0 bg-gradient-to-r from-55% to-transparent",
                        "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out",
                        "group-hover:w-full"
                      )}
                    />
                    <div className="relative z-[1] flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6 sm:py-3">
                      <div className="sm:w-[min(42%,14rem)] sm:flex-shrink-0">
                        <KeyCombo keys={row.keys} />
                      </div>

                      <p className="text-app-fg-secondary text-sm leading-snug sm:min-w-0 sm:flex-1">{row.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
