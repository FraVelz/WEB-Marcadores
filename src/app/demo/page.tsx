import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DEMO_SESSION_COOKIE } from "@/lib/demo-data"

export const metadata = {
  title: "Demo Marcadores",
  description: "Entrada directa a la interfaz en modo demo (sin credenciales), si el proyecto tiene demo habilitado.",
}

/**
 * Ruta /demo: activa cookie de sesión demo y entra al explorador.
 * El proxy también setea la cookie; esta página la refuerza si el proxy no corre.
 */
export default async function DemoPage() {
  const cookieStore = await cookies()
  cookieStore.set(DEMO_SESSION_COOKIE, "true", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  })
  redirect("/marcadores")
}
