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

export function StatSegmentBreakdown({ breakdown }: { breakdown: EstadisticasSnapshot["statusBreakdown"] }) {
  const total = breakdown.normal + breakdown.favorite + breakdown.archived
  if (total === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        Sin marcadores
      </p>
    )
  }

  return (
    <div className="border-app-border-muted bg-app-raised rounded-xl border p-4">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Activos ${breakdown.normal}, favoritos ${breakdown.favorite}, archivados ${breakdown.archived}`}
      >
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
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" role="list">
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
    </div>
  )
}
