import { shortcutSections } from "./data"
import { cn } from "@/lib/utils"

function Kbd({ className, children }: { className?: string; children: React.ReactNode }) {
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
  const parts = keys
    .split(/\s*\/\s*/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length < 2) {
    return <Kbd>{keys}</Kbd>
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {parts.map((part, i) => (
        <span key={`${part}-${i}`} className="flex items-center gap-2">
          {i > 0 ? (
            <span
              className="text-app-fg-muted text-[11px] font-medium tracking-wider uppercase select-none"
              aria-hidden
            >
              o
            </span>
          ) : null}

          <Kbd>{part}</Kbd>
        </span>
      ))}
    </span>
  )
}

export function AtajosPage() {
  return (
    <div className="overflow-auto p-4 pb-12 sm:p-6">
      <header className="mb-6 max-w-3xl sm:mb-8">
        <h1 className="text-app-fg text-xl font-bold tracking-tight sm:text-2xl">Atajos de teclado</h1>

        <p className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
          Referencia rápida de combinaciones. Las alternativas equivalentes se muestran como teclas separadas.
        </p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {shortcutSections.map((section) => (
          <section key={section.title} className="scroll-mt-6">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h2 className="text-app-fg text-base font-semibold">{section.title}</h2>

              {section.hint ? (
                <p className="text-app-fg-muted max-w-xl text-xs leading-snug sm:text-right">{section.hint}</p>
              ) : null}
            </div>

            <ul
              className="border-app-border-muted divide-app-border-muted bg-app-raised divide-y rounded-xl border"
              role="list"
            >
              {section.rows.map((row, i) => (
                <li
                  key={`${section.title}-${row.keys}-${i}`}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6 sm:py-3"
                >
                  <div className="sm:w-[min(42%,14rem)] sm:flex-shrink-0">
                    <KeyCombo keys={row.keys} />
                  </div>

                  <p className="text-app-fg-secondary text-sm leading-snug sm:min-w-0 sm:flex-1">{row.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
