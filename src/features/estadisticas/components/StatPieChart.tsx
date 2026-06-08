"use client"

import { EvilPieChart, Legend, Pie, Tooltip } from "@/components/evilcharts/charts/pie-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/chart"
import { buildStatChartAriaLabel } from "@/features/estadisticas/components/statChartA11y"
import type { StatPieSlice } from "@/features/estadisticas/components/statPieChartData"

type StatPieChartProps = {
  caption: string
  slices: StatPieSlice[]
  config: ChartConfig
  emptyLabel?: string
  valueSuffix?: string
}

export function StatPieChart({ caption, slices, config, emptyLabel = "Sin datos", valueSuffix }: StatPieChartProps) {
  const visible = slices.filter((slice) => slice.value > 0)

  if (visible.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        {emptyLabel}
      </p>
    )
  }

  const ariaRows = visible.map((slice) => ({ label: slice.label, value: slice.value }))

  return (
    <figure
      className="border-app-border-muted bg-app-raised relative rounded-xl border p-2 sm:p-3"
      aria-label={buildStatChartAriaLabel(caption, ariaRows, { valueSuffix })}
    >
      <EvilPieChart
        className="mx-auto aspect-square max-h-[min(18rem,72vw)] w-full max-w-xs [&_[data-slot=chart]]:overflow-visible"
        data={visible}
        dataKey="value"
        nameKey="segment"
        config={config}
      >
        <Legend isClickable align="center" />
        <Tooltip variant="default" roundness="xl" />
        <Pie isClickable innerRadius={44} paddingAngle={2} cornerRadius={6} />
      </EvilPieChart>
    </figure>
  )
}
