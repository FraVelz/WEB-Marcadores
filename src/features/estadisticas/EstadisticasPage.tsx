"use client"

import { StatBarChart } from "@/features/estadisticas/components/StatBarChart"
import { StatBookmarkList, StatDuplicateList } from "@/features/estadisticas/components/StatBookmarkList"
import { StatKpiGrid } from "@/features/estadisticas/components/StatKpiGrid"
import { StatPieChart } from "@/features/estadisticas/components/StatPieChart"
import { statRowsToPieModel } from "@/features/estadisticas/components/statPieChartData"
import { StatSection } from "@/features/estadisticas/components/StatSection"
import { StatSegmentBreakdown } from "@/features/estadisticas/components/StatSegmentBreakdown"
import { StatTreeInsights } from "@/features/estadisticas/components/StatTreeInsights"
import { useEstadisticasData } from "@/features/estadisticas/hooks/useEstadisticasData"

export function EstadisticasPage() {
  const { loading, stats, demoMode } = useEstadisticasData()

  if (loading) {
    return <div className="text-app-fg-label flex flex-1 items-center justify-center p-8">Cargando estadísticas…</div>
  }

  const topDomainsPie = statRowsToPieModel(stats.topDomains)
  const topRootFoldersPie = statRowsToPieModel(stats.topRootFolders)
  const topTagsPie = statRowsToPieModel(stats.topTags)

  return (
    <div className="overflow-auto p-4 pb-12 text-center sm:p-6">
      <header className="mx-auto mb-6 max-w-5xl sm:mb-8">
        <h1 className="text-app-fg text-xl font-semibold tracking-tight sm:text-2xl">Estadísticas</h1>

        <p className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
          Resumen de tu biblioteca de marcadores: uso, organización e higiene de datos.
          {demoMode ? (
            <span className="text-app-fg-muted mt-1 block text-xs">Modo demo: métricas sobre datos de ejemplo.</span>
          ) : null}
        </p>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <StatSection title="Resumen" hint="Solo enlaces no archivados salvo donde se indica">
          <StatKpiGrid kpis={stats.kpis} />
        </StatSection>

        <StatSection title="Estado de la biblioteca" hint="Activos, favoritos y archivados">
          <StatSegmentBreakdown breakdown={stats.statusBreakdown} />
        </StatSection>

        <div className="grid gap-10 lg:grid-cols-2">
          <StatSection title="Top dominios" hint="Sitios con más marcadores (top 5 + otros)">
            <StatPieChart
              caption="Top dominios: marcadores por sitio web"
              slices={topDomainsPie.slices}
              config={topDomainsPie.config}
              emptyLabel="Aún no hay enlaces"
              valueHeader="Marcadores"
            />
          </StatSection>

          <StatSection title="Por carpeta raíz" hint="Incluye subcarpetas bajo cada raíz">
            <StatPieChart
              caption="Marcadores por carpeta raíz"
              slices={topRootFoldersPie.slices}
              config={topRootFoldersPie.config}
              emptyLabel="Sin carpetas con enlaces"
              valueHeader="Marcadores"
            />
          </StatSection>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <StatSection title="Etiquetas más usadas" hint="Top 5 + resto agrupado">
            <StatPieChart
              caption="Etiquetas más usadas en la biblioteca"
              slices={topTagsPie.slices}
              config={topTagsPie.config}
              emptyLabel="Ningún marcador tiene etiquetas"
              valueHeader="Usos"
            />
          </StatSection>

          <StatSection title="Más abiertos desde la app" hint="Según open_count al abrir enlace o panel">
            <StatBookmarkList rows={stats.mostOpened} emptyLabel="Ningún marcador abierto aún" />
          </StatSection>
        </div>

        <StatSection title="Altas por mes" hint="Según created_at; últimos 14 meses con datos">
          <StatBarChart
            caption="Altas de marcadores por mes"
            rows={stats.createdByMonth}
            emptyLabel="Sin fechas de creación registradas"
            valueHeader="Altas"
          />
        </StatSection>

        <StatSection title="Árbol de carpetas" hint="Profundidad y carpetas sin enlaces">
          <StatTreeInsights tree={stats.tree} />
        </StatSection>

        <StatSection
          title="Para revisar"
          hint="Listas acotadas; usa filtros en Marcadores para ver el conjunto completo"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-app-fg-secondary mb-2 text-sm font-medium">Nunca abiertos</h3>
              <StatBookmarkList rows={stats.neverOpened} emptyLabel="Todos tienen al menos una apertura" />
            </div>

            <div>
              <h3 className="text-app-fg-secondary mb-2 text-sm font-medium">Sin etiquetas</h3>
              <StatBookmarkList rows={stats.noTags} emptyLabel="Todos tienen al menos una etiqueta" />
            </div>

            <div>
              <h3 className="text-app-fg-secondary mb-2 text-sm font-medium">Sin uso reciente (&gt;6 meses o nunca)</h3>
              <StatBookmarkList rows={stats.stale} emptyLabel="Biblioteca al día" />
            </div>

            <div>
              <h3 className="text-app-fg-secondary mb-2 text-sm font-medium">URLs duplicadas</h3>
              <StatDuplicateList groups={stats.duplicates} />
            </div>
          </div>
        </StatSection>
      </div>
    </div>
  )
}
