"use client"

import { cn } from "@/lib/utils"
import type { GridItem } from "../utils/types"

type Props = {
  variant?: "default" | "zones"
  flatList: GridItem[]
  selectedIndex: number
  poolCount?: number
}

export default function MarcadoresFooter(props: Props) {
  const variant = props.variant ?? "default"
  const flatList = props.flatList
  const selectedIndex = props.selectedIndex
  const item = flatList[selectedIndex]

  const count = variant === "zones" ? (props.poolCount ?? flatList.length) : flatList.length

  return (
    <div
      className={cn(
        "border-app-border flex items-center justify-between border-t",
        "bg-app-sidebar text-app-fg-label px-3 py-1 text-xs"
      )}
    >
      <span className="shrink-0">
        {count} marcador{count !== 1 ? "es" : ""}
        {variant === "zones" ? <span className="text-app-fg-muted"> · Paneles zonas</span> : null}
      </span>
      {variant !== "zones" && item?.type === "link" ? (
        <span className="max-w-[min(65vw,20rem)] min-w-0 truncate text-right text-[10px] leading-tight sm:max-w-[400px] sm:text-xs">
          {item.bookmark.url}
        </span>
      ) : variant === "zones" ? (
        <span className="text-app-fg-muted truncate text-[10px] sm:text-xs">Espacio modular</span>
      ) : null}
    </div>
  )
}
