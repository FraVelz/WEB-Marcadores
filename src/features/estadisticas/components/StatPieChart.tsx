"use client"

import { useId } from "react"

import { EvilPieChart, Legend, Pie, Tooltip } from "@/components/evilcharts/charts/pie-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/chart"
import { StatChartSrTable } from "@/features/estadisticas/components/statChartA11y"
import type { StatPieSlice } from "@/features/estadisticas/components/statPieChartData"

type StatPieChartProps = {
  caption: string
  slices: StatPieSlice[]
  config: ChartConfig
  emptyLabel?: string
  valueHeader?: string
  valueSuffix?: string
}

export function StatPieChart({
  caption,
  slices,
  config,
  emptyLabel = "Sin datos",
  valueHeader = "Cantidad",
  valueSuffix,
}: StatPieChartProps) {
  const captionId = useId()
  const visible = slices.filter((slice) => slice.value > 0)

  if (visible.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        {emptyLabel}
      </p>
    )
  }

  const srRows = visible.map((slice) => ({ label: slice.label, value: slice.value }))

  return (
    <figure
      className="border-app-border-muted bg-app-raised rounded-xl border p-2 sm:p-3"
      aria-labelledby={captionId}
    >
      <figcaption id={captionId} className="sr-only">
        {caption}
      </figcaption>

      <StatChartSrTable caption={caption} rows={srRows} valueHeader={valueHeader} valueSuffix={valueSuffix} />

      <EvilPieChart
        className="mx-auto aspect-square max-h-[min(18rem,72vw)] w-full max-w-xs"
        data={visible}
        dataKey="value"
        nameKey="segment"
        config={config}
      >
        <Legend isClickable align="center" />
        <Tooltip />
        <Pie isClickable innerRadius={44} paddingAngle={2} cornerRadius={6} />
      </EvilPieChart>
    </figure>
  )
}
