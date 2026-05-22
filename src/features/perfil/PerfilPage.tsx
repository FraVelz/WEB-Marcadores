import { SectionsClient } from "./components/SectionsClient"

export function PerfilPage() {
  return (
    <div className="overflow-auto p-4 pb-10 sm:p-6">
      <h1 className="text-app-fg mb-4 text-center text-xl font-semibold sm:mb-6 sm:text-2xl">Perfil</h1>

      <SectionsClient />
    </div>
  )
}
