import { EstadisticasPage } from "@/features/estadisticas/EstadisticasPage"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Estadísticas",
    description: "Resumen de uso: marcadores, carpetas y actividad reciente en tu biblioteca.",
    path: "/estadisticas",
  })

export default EstadisticasPage
