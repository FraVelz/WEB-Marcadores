import type { StatCountRow } from "@/features/estadisticas/computeEstadisticas"

export function StatChartSrTable({
  caption,
  rows,
  valueHeader,
  valueSuffix,
}: {
  caption: string
  rows: StatCountRow[]
  valueHeader: string
  valueSuffix?: string
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Etiqueta</th>
          <th scope="col">{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.label}::${row.hint ?? ""}`}>
            <th scope="row">{row.label}</th>
            <td>
              {row.value.toLocaleString("es")}
              {valueSuffix ? ` ${valueSuffix}` : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
