import Link from "next/link"

import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
      <main
        className={cn(
          "border-app-border-muted bg-app-raised w-full max-w-md rounded-xl border px-6 py-10 text-center shadow-sm sm:px-8",
          "flex flex-col items-center"
        )}
      >
        <p className="text-app-fg-muted font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">404</p>

        <div className="bg-app-border-muted mt-5 mb-6 h-px w-10" aria-hidden />

        <h1 className="text-app-fg text-xl font-semibold tracking-tight sm:text-2xl">Página no encontrada</h1>

        <p className="text-app-fg-secondary mt-3 max-w-sm text-sm leading-relaxed">
          La ruta que buscas no existe o ha cambiado. Vuelve a tus marcadores o al inicio de la app.
        </p>

        <div className="border-app-border-muted mt-8 flex w-full flex-col gap-2 border-t pt-8 sm:flex-row sm:justify-center">
          <Link
            href="/marcadores"
            className="bg-app-primary hover:bg-app-primary-hover rounded-lg px-6 py-2.5 text-sm font-medium text-white"
          >
            Ir a marcadores
          </Link>

          <Link
            href="/"
            className={cn(
              "border-app-input-border text-app-fg-secondary rounded-lg border px-6 py-2.5 text-sm font-medium",
              "hover:bg-app-raised-muted"
            )}
          >
            Inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
