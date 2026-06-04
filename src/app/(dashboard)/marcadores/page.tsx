import { MarcadoresPage } from "@/features/marcadores/MarcadoresPage"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Marcadores",
    description: "Gestiona carpetas, marcadores, búsqueda y vista de escritorio o explorador simple.",
    path: "/marcadores",
  })

export default MarcadoresPage
