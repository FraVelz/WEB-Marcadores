import { PerfilPage } from "@/features/perfil/PerfilPage"
import { generateRouteMetadata } from "@/lib/generatePageMetadata"

export const generateMetadata = () =>
  generateRouteMetadata({
    title: "Perfil",
    description: "Tema, colores, imagen de fondo, transparencia del escritorio y cuenta de usuario.",
    path: "/perfil",
  })

export default PerfilPage
