import type { StatCountRow } from "@/features/estadisticas/computeEstadisticas"

import { cn } from "@/lib/utils"

type StatBarChartProps = {
  rows: StatCountRow[]
  emptyLabel?: string
  valueSuffix?: string
}

export function StatBarChart({ rows, emptyLabel = "Sin datos", valueSuffix }: StatBarChartProps) {
  if (rows.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        {emptyLabel}
      </p>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <ul
      className="border-app-border-muted bg-app-raised flex flex-col gap-2.5 rounded-xl border p-3 sm:p-4"
      role="list"
    >
      {rows.map((row) => {
        const pct = Math.round((row.value / max) * 100)
        return (
          <li key={`${row.label}::${row.hint ?? ""}`}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-app-fg min-w-0 truncate font-medium" title={row.label}>
                {row.label}
              </span>
              <span className="text-app-fg-secondary shrink-0 tabular-nums">
                {row.value.toLocaleString("es")}
                {valueSuffix ? ` ${valueSuffix}` : ""}
              </span>
            </div>
            <div className="bg-app-canvas h-2 overflow-hidden rounded-full" role="presentation" aria-hidden>
              <div
                className={cn("bg-app-accent h-full rounded-full motion-safe:transition-[width]")}
                style={{ width: `${Math.max(pct, row.value > 0 ? 4 : 0)}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
