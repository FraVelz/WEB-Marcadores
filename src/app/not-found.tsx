import Link from "next/link"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Página no encontrada",
}

export default function NotFound() {
  return (
    <div className="bg-app-login-canvas flex min-h-screen items-center justify-center p-4">
      <main
        className={cn(
          "border-app-login-border bg-app-login-card w-full max-w-md rounded-xl border px-5 py-8 sm:p-8",
          "text-center shadow-xl"
        )}
      >
        <p className="text-app-fg font-mono text-6xl font-bold">
          <span className="text-app-primary">4</span>
          <span className="text-app-fg">0</span>
          <span className="text-app-primary">4</span>
        </p>

        <h1 className="text-app-fg mt-4 text-xl font-semibold">Página no encontrada</h1>

        <p className="text-app-fg-muted mt-2 text-sm">La ruta que buscas no existe o ha cambiado.</p>

        <Link
          href="/"
          className={cn(
            "bg-app-primary mt-8 inline-block rounded-lg px-6 py-2.5",
            "hover:bg-app-primary-hover text-fg text-sm font-medium"
          )}
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  )
}
