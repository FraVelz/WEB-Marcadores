"use client"

import type { ReactNode } from "react"

import { MARCADORES_GLOBAL_ALERT_Z_CLASS } from "@/features/marcadores/utils/layerZIndex"
import { cn } from "@/lib/utils"

type Props = {
  variant: "desk" | "stacked"
  children: ReactNode
}

/** Contenedor de banners críticos (confirmación, error, demo) siempre por encima del escritorio. */
export function MarcadoresGlobalAlertLayer({ variant, children }: Props) {
  if (variant === "desk") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 left-0 flex flex-col items-center gap-2 p-2",
          MARCADORES_GLOBAL_ALERT_Z_CLASS
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex w-full max-w-lg flex-col items-center gap-2",
            "[&>*]:w-full [&>*]:overflow-hidden [&>*]:rounded-lg [&>*]:shadow-2xl"
          )}
        >
          {children}
        </div>
      </div>
    )
  }

  return <div className={cn("relative isolate", MARCADORES_GLOBAL_ALERT_Z_CLASS)}>{children}</div>
}
