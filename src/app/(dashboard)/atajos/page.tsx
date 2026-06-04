import { AtajosPage } from "@/features/atajos/AtajosPage"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Atajos",
    description: "Referencia de atajos de teclado para navegar y editar tu biblioteca de marcadores.",
    path: "/atajos",
  })

export default AtajosPage
