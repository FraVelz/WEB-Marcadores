"use client"

import { useMemo } from "react"

import { Bar, EvilComposedChart, Grid, Tooltip, XAxis, YAxis } from "@/components/evilcharts/charts/composed-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/chart"
import { buildStatChartAriaLabel } from "@/features/estadisticas/components/statChartA11y"
import type { StatCountRow } from "@/features/estadisticas/computeEstadisticas"

const MONTHLY_CHART_CONFIG = {
  altas: {
    label: "Altas",
    colors: {
      light: ["#3b82f6", "#2563eb"],
      dark: ["#60a5fa", "#3b82f6"],
    },
  },
} satisfies ChartConfig

type MonthDatum = {
  month: string
  altas: number
  monthKey: string
}

function formatMonthTick(value: string): string {
  const parts = value.trim().split(/\s+/)
  if (parts.length < 2) return value.slice(0, 3)
  return `${parts[0]} ${parts[1].slice(-2)}`
}

type StatMonthlyComposedChartProps = {
  caption: string
  rows: StatCountRow[]
  emptyLabel?: string
}

export function StatMonthlyComposedChart({
  caption,
  rows,
  emptyLabel = "Sin datos",
}: StatMonthlyComposedChartProps) {
  const data = useMemo<MonthDatum[]>(
    () =>
      rows.map((row) => ({
        month: row.label,
        altas: row.value,
        monthKey: row.hint ?? row.label,
      })),
    [rows]
  )

  if (data.length === 0) {
    return (
      <p className="text-app-fg-muted border-app-border-muted bg-app-raised rounded-xl border px-4 py-6 text-sm">
        {emptyLabel}
      </p>
    )
  }

  const showBrush = data.length > 6

  return (
    <figure
      className="border-app-border-muted bg-app-raised relative rounded-xl border p-2 sm:p-3"
      aria-label={buildStatChartAriaLabel(caption, rows)}
    >
      <EvilComposedChart
        className="h-[min(16rem,55vw)] w-full min-w-0"
        xDataKey="month"
        data={data}
        config={MONTHLY_CHART_CONFIG}
        showBrush={showBrush}
        brushHeight={44}
        brushFormatLabel={(value) => formatMonthTick(String(value))}
        animationType="left-to-right"
        barCategoryGap={12}
      >
        <Grid vertical={false} stroke="var(--app-border)" strokeOpacity={0.65} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthTick}
          tick={{ fill: "var(--app-fg-muted)", fontSize: 11 }}
        />
        <YAxis
          width={36}
          tick={{ fill: "var(--app-fg-muted)", fontSize: 11 }}
          allowDecimals={false}
        />
        <Tooltip variant="default" roundness="xl" />
        <Bar
          dataKey="altas"
          variant="gradient"
          radius={6}
          isClickable
          enableHoverHighlight
        />
      </EvilComposedChart>
    </figure>
  )
}
