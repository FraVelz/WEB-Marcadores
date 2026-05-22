"use client"

import { cn } from "@/lib/utils"
import type { GridItem } from "../utils/types"

type Props = {
  flatList: GridItem[]
  selectedIndex: number
}

export default function MarcadoresFooter(props: Props) {
  const { flatList, selectedIndex } = props
  const item = flatList[selectedIndex]
  const count = flatList.length

  return (
    <div
      className={cn(
        "border-app-border flex items-center justify-between border-t",
        "bg-app-sidebar text-app-fg-label px-3 py-1 text-xs"
      )}
    >
      <span className="shrink-0">
        {count} marcador{count !== 1 ? "es" : ""}
      </span>
      {item?.type === "link" ? (
        <span className="max-w-[min(65vw,20rem)] min-w-0 truncate text-right text-[10px] leading-tight sm:max-w-[400px] sm:text-xs">
          {item.bookmark.url}
        </span>
      ) : null}
    </div>
  )
}
