import type { StatBookmarkRow, StatDuplicateGroup } from "@/features/estadisticas/computeEstadisticas"

import { cn } from "@/lib/utils"

export function StatBookmarkList({
  rows,
  emptyLabel = "Nada que mostrar",
}: {
  rows: StatBookmarkRow[]
  emptyLabel?: string
}) {
  if (rows.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-5 text-sm">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul
      className="border-app-border-muted divide-app-border-muted bg-app-raised divide-y overflow-hidden rounded-xl border"
      role="list"
    >
      {rows.map((row) => (
        <li key={row.id} className="px-4 py-3">
          <p className="text-app-fg truncate text-sm font-medium">{row.title}</p>
          {(row.subtitle || row.meta) && (
            <p className="text-app-fg-muted mt-0.5 truncate text-xs">
              {[row.subtitle, row.meta].filter(Boolean).join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export function StatDuplicateList({ groups }: { groups: StatDuplicateGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-5 text-sm">
        No hay URLs duplicadas
      </p>
    )
  }

  return (
    <ul
      className="border-app-border-muted divide-app-border-muted bg-app-raised divide-y overflow-hidden rounded-xl border"
      role="list"
    >
      {groups.map((g) => (
        <li key={g.key} className="px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-app-fg min-w-0 truncate font-mono text-xs" title={g.key}>
              {g.key.length > 48 ? `${g.key.slice(0, 48)}…` : g.key}
            </p>
            <span className="text-app-accent shrink-0 text-xs font-semibold tabular-nums">{g.count}×</span>
          </div>
          {g.sampleTitles.length > 0 ? (
            <p className={cn("text-app-fg-muted mt-1 text-xs leading-snug")}>{g.sampleTitles.join(" · ")}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
