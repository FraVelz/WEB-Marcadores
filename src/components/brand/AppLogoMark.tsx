import { cn } from "@/lib/utils"

/** Marcador relleno; debe coincidir con `src/app/icon.svg`. */
const BOOKMARK_PATH = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"

const LOGO_PRIMARY = "#1d4ed8"

type Props = {
  className?: string
  /** Tamaño del contenedor cuadrado (Tailwind, p. ej. size-9). */
  sizeClassName?: string
  title?: string
}

/** Logo de la app: cuadrado azul redondeado + marcador blanco (mismo diseño que el favicon). */
export function AppLogoMark({ className, sizeClassName = "size-9", title = "Marcadores" }: Props) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-lg text-white", sizeClassName, className)}
      style={{ backgroundColor: LOGO_PRIMARY }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d={BOOKMARK_PATH} />
      </svg>
    </div>
  )
}
