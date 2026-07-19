import { PapeleraClient } from "@/features/papelera/PapeleraClient"
import { DashboardPageHeader } from "@/layouts/dashboard/components/DashboardPageHeader"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Papelera",
    description: "Restaura o elimina definitivamente marcadores y carpetas (retención 30 días).",
    path: "/papelera",
  })

export default function PapeleraPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardPageHeader
        title="Papelera"
        subtitle="Elementos eliminados se conservan 30 días antes de borrarse de forma permanente."
      />
      <div className="min-h-0 flex-1 overflow-auto p-4 pb-10 sm:p-6">
        <PapeleraClient />
      </div>
    </div>
  )
}
