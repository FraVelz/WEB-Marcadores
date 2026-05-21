import { cn } from "@/lib/utils"

import type { EstadisticasSnapshot } from "@/features/estadisticas/computeEstadisticas"

type KpiDef = { label: string; value: number; accent?: boolean }

export function StatKpiGrid({ kpis }: { kpis: EstadisticasSnapshot["kpis"] }) {
  const items: KpiDef[] = [
    { label: "Enlaces activos", value: kpis.totalLinks },
    { label: "Carpetas", value: kpis.totalFolders },
    { label: "Etiquetas únicas", value: kpis.uniqueTags },
    { label: "Favoritos", value: kpis.favorites },
    { label: "Archivados", value: kpis.archived },
    { label: "Nunca abiertos", value: kpis.neverOpened, accent: kpis.neverOpened > 0 },
    { label: "Duplicados (grupos)", value: kpis.duplicateClusters, accent: kpis.duplicateClusters > 0 },
    { label: `Sin uso >${6} meses`, value: kpis.staleCount, accent: kpis.staleCount > 0 },
  ]

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" role="list">
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            "border-app-border-muted bg-app-raised rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5",
            item.accent && "border-app-accent/40"
          )}
        >
          <p className="text-app-fg-muted text-[11px] leading-tight font-medium tracking-wide uppercase">
            {item.label}
          </p>
          <p className={cn("text-app-fg mt-1 text-2xl font-semibold tabular-nums", item.accent && "text-app-accent")}>
            {item.value.toLocaleString("es")}
          </p>
        </li>
      ))}
    </ul>
  )
}
