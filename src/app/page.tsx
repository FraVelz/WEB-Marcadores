import { cookies } from "next/headers"

import { LoginPage } from "@/features/login/LoginPage"
import { cookieHeaderFromRequestCookies, isDemoMode } from "@/lib/demo-data"

export const metadata = {
  title: "Marcadores · Inicia sesión",
  description:
    "Accede a tus marcadores o prueba la demo: carpetas, búsqueda y atajos de teclado en una interfaz limpia.",
}

export default async function Page() {
  const cookieStore = await cookies()
  const demo = isDemoMode(cookieHeaderFromRequestCookies(cookieStore))

  return <LoginPage demo={demo} />
}
