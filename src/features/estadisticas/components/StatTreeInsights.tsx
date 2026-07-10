import type { EstadisticasSnapshot } from "@/features/estadisticas/computeEstadisticas"

import { StatBarChart } from "@/features/estadisticas/components/StatBarChart"

export function StatTreeInsights({ tree }: { tree: EstadisticasSnapshot["tree"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ul className="border-app-border-muted bg-app-raised grid grid-cols-2 gap-2 rounded-xl border p-3 sm:p-4">
        <li>
          <p className="text-app-fg-muted text-[11px] font-medium uppercase">Profundidad máx.</p>
          <p className="text-app-fg mt-1 text-xl font-semibold tabular-nums">{tree.maxDepth}</p>
        </li>
        <li>
          <p className="text-app-fg-muted text-[11px] font-medium uppercase">Carpetas vacías</p>
          <p className="text-app-fg mt-1 text-xl font-semibold tabular-nums">{tree.emptyFolderCount}</p>
        </li>
        <li className="col-span-2">
          <p className="text-app-fg-muted text-[11px] font-medium uppercase">Enlaces en raíz</p>
          <p className="text-app-fg mt-1 text-xl font-semibold tabular-nums">{tree.linksAtRoot}</p>
        </li>
      </ul>
      <div>
        <p className="text-app-fg-muted mb-2 text-xs font-medium">Carpetas más profundas</p>
        <StatBarChart
          caption="Carpetas más profundas por nivel"
          rows={tree.deepestFolders}
          emptyLabel="Sin carpetas"
          valueSuffix="niv."
        />
      </div>
    </div>
  )
}
