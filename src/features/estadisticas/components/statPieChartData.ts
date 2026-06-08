import type { ChartConfig } from "@/components/evilcharts/ui/chart"
import type { EstadisticasSnapshot, StatCountRow } from "@/features/estadisticas/computeEstadisticas"

export type StatPieSlice = { segment: string; label: string; value: number }

const PIE_PALETTE = [
  { light: ["#3b82f6"], dark: ["#60a5fa"] },
  { light: ["#10b981"], dark: ["#34d399"] },
  { light: ["#f59e0b"], dark: ["#fbbf24"] },
  { light: ["#8b5cf6"], dark: ["#a78bfa"] },
  { light: ["#ec4899"], dark: ["#f472b6"] },
  { light: ["#06b6d4"], dark: ["#22d3ee"] },
  { light: ["#84cc16"], dark: ["#a3e635"] },
  { light: ["#f97316"], dark: ["#fb923c"] },
] as const

function slugSegmentKey(label: string, index: number): string {
  const slug = label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32)
  return slug || `segment_${index}`
}

function groupRowsForPie(rows: StatCountRow[], maxSlices: number): StatCountRow[] {
  if (rows.length <= maxSlices) return rows
  const head = rows.slice(0, maxSlices - 1)
  const restValue = rows.slice(maxSlices - 1).reduce((sum, row) => sum + row.value, 0)
  return [...head, { label: "Otros", value: restValue }]
}

export function statRowsToPieModel(
  rows: StatCountRow[],
  options?: { maxSlices?: number }
): { slices: StatPieSlice[]; config: ChartConfig } {
  const maxSlices = options?.maxSlices ?? 6
  const grouped = groupRowsForPie(rows, maxSlices)
  const usedKeys = new Set<string>()
  const slices: StatPieSlice[] = []
  const config: ChartConfig = {}

  grouped.forEach((row, index) => {
    if (row.value <= 0) return

    let segment = slugSegmentKey(row.label, index)
    while (usedKeys.has(segment)) segment = `${segment}_${index}`
    usedKeys.add(segment)

    const palette = PIE_PALETTE[index % PIE_PALETTE.length]
    slices.push({ segment, label: row.label, value: row.value })
    config[segment] = {
      label: row.label,
      colors: { light: [...palette.light], dark: [...palette.dark] },
    }
  })

  return { slices, config }
}

export function statusBreakdownToPieModel(breakdown: EstadisticasSnapshot["statusBreakdown"]): {
  slices: StatPieSlice[]
  config: ChartConfig
} {
  const slices: StatPieSlice[] = [
    { segment: "normal", label: "Activos", value: breakdown.normal },
    { segment: "favorite", label: "Favoritos", value: breakdown.favorite },
    { segment: "archived", label: "Archivados", value: breakdown.archived },
  ].filter((slice) => slice.value > 0)

  const config: ChartConfig = {
    normal: {
      label: "Activos",
      colors: { light: ["#71717a"], dark: ["#a1a1aa"] },
    },
    favorite: {
      label: "Favoritos",
      colors: { light: ["#2563eb"], dark: ["#60a5fa"] },
    },
    archived: {
      label: "Archivados",
      colors: { light: ["#d4d4d8"], dark: ["#52525b"] },
    },
  }

  return { slices, config }
}
