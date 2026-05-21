import type { ReactNode } from "react"

type StatSectionProps = {
  title: string
  hint?: string
  children: ReactNode
}

export function StatSection({ title, hint, children }: StatSectionProps) {
  return (
    <section className="scroll-mt-6">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="text-app-fg text-base font-semibold">{title}</h2>
        {hint ? <p className="text-app-fg-muted max-w-xl text-xs leading-snug sm:text-right">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}
