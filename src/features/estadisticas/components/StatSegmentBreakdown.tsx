"use client"

import { StatPieChart } from "@/features/estadisticas/components/StatPieChart"
import { statusBreakdownToPieModel } from "@/features/estadisticas/components/statPieChartData"
import type { EstadisticasSnapshot } from "@/features/estadisticas/computeEstadisticas"

const CHART_CAPTION = "Estado de la biblioteca: activos, favoritos y archivados"

export function StatSegmentBreakdown({ breakdown }: { breakdown: EstadisticasSnapshot["statusBreakdown"] }) {
  const { slices, config } = statusBreakdownToPieModel(breakdown)

  return <StatPieChart caption={CHART_CAPTION} slices={slices} config={config} emptyLabel="Sin marcadores" />
}
