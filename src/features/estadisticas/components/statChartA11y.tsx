import type { StatCountRow } from "@/features/estadisticas/computeEstadisticas"

export function buildStatChartAriaLabel(
  caption: string,
  rows: StatCountRow[],
  options?: { valueSuffix?: string }
): string {
  const suffix = options?.valueSuffix ? ` ${options.valueSuffix}` : ""
  const details = rows
    .map((row) => `${row.label}: ${row.value.toLocaleString("es")}${suffix}`)
    .join("; ")
  return details ? `${caption}. ${details}` : caption
}
