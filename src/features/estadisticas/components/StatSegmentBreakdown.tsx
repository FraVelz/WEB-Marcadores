"use client"

import { useId } from "react"

import type { EstadisticasSnapshot } from "@/features/estadisticas/computeEstadisticas"

import { cn } from "@/lib/utils"

const SEGMENTS: {
  key: keyof EstadisticasSnapshot["statusBreakdown"]
  label: string
  barClass: string
}[] = [
  { key: "normal", label: "Activos", barClass: "bg-app-nav-active" },
  { key: "favorite", label: "Favoritos", barClass: "bg-app-accent" },
  { key: "archived", label: "Archivados", barClass: "bg-app-fg-muted/50" },
]

const CHART_CAPTION = "Estado de la biblioteca: activos, favoritos y archivados"

export function StatSegmentBreakdown({ breakdown }: { breakdown: EstadisticasSnapshot["statusBreakdown"] }) {
  const captionId = useId()
  const total = breakdown.normal + breakdown.favorite + breakdown.archived

  if (total === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        Sin marcadores
      </p>
    )
  }

  return (
    <figure className="border-app-border-muted bg-app-raised rounded-xl border p-4" aria-labelledby={captionId}>
      <figcaption id={captionId} className="sr-only">
        {CHART_CAPTION}
      </figcaption>

      <table className="sr-only">
        <caption>{CHART_CAPTION}</caption>
        <thead>
          <tr>
            <th scope="col">Estado</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {SEGMENTS.map((seg) => {
            const value = breakdown[seg.key]
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return (
              <tr key={seg.key}>
                <th scope="row">{seg.label}</th>
                <td>{value.toLocaleString("es")}</td>
                <td>{pct}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
        {SEGMENTS.map((seg) => {
          const value = breakdown[seg.key]
          if (value <= 0) return null
          const pct = (value / total) * 100
          return (
            <div
              key={seg.key}
              className={cn(seg.barClass, "h-full min-w-[2px]")}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${value}`}
            />
          )
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-hidden="true">
        {SEGMENTS.map((seg) => {
          const value = breakdown[seg.key]
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <li key={seg.key} className="flex items-center gap-2 text-sm">
              <span className={cn("size-2.5 shrink-0 rounded-sm", seg.barClass)} aria-hidden />
              <span className="text-app-fg-secondary">
                {seg.label}{" "}
                <span className="text-app-fg font-medium tabular-nums">
                  {value} ({pct}%)
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
