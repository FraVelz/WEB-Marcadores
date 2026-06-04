"use client"

import { useId } from "react"

import type { StatCountRow } from "@/features/estadisticas/computeEstadisticas"

import { StatChartSrTable } from "@/features/estadisticas/components/statChartA11y"

type StatBarChartProps = {
  rows: StatCountRow[]
  /** Título accesible del gráfico (tabla oculta + figcaption). */
  caption: string
  emptyLabel?: string
  valueSuffix?: string
  valueHeader?: string
}

export function StatBarChart({
  rows,
  caption,
  emptyLabel = "Sin datos",
  valueSuffix,
  valueHeader = "Cantidad",
}: StatBarChartProps) {
  const captionId = useId()

  if (rows.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        {emptyLabel}
      </p>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <figure
      className="border-app-border-muted bg-app-raised rounded-xl border p-3 sm:p-4"
      aria-labelledby={captionId}
    >
      <figcaption id={captionId} className="sr-only">
        {caption}
      </figcaption>

      <StatChartSrTable caption={caption} rows={rows} valueHeader={valueHeader} valueSuffix={valueSuffix} />

      <ol className="flex flex-col gap-2.5" aria-hidden="true">
        {rows.map((row) => (
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
            <meter
              className="stat-meter w-full"
              min={0}
              max={max}
              value={row.value}
              optimum={max}
              title={`${row.label}: ${row.value.toLocaleString("es")}${valueSuffix ? ` ${valueSuffix}` : ""}`}
            >
              {row.value.toLocaleString("es")}
              {valueSuffix ? ` ${valueSuffix}` : ""}
            </meter>
          </li>
        ))}
      </ol>
    </figure>
  )
}
