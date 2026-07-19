import { SectionsClient } from "./components/SectionsClient"
import { DashboardPageHeader } from "@/layouts/dashboard/components/DashboardPageHeader"

export function PerfilPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardPageHeader title="Perfil" subtitle="Cuenta, apariencia y preferencias del sitio." />
      <div className="min-h-0 flex-1 overflow-auto p-4 pb-10 sm:p-6">
        <SectionsClient />
      </div>
    </div>
  )
}
