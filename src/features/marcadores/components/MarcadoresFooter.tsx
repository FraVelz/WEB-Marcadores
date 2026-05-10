"use client"

import { cn } from "@/lib/utils"
import type { GridItem } from "../utils/types"

type Props = {
  flatList: GridItem[]
  selectedIndex: number
}

export default function MarcadoresFooter({ flatList, selectedIndex }: Props) {
  const item = flatList[selectedIndex]
  return (
    <div
      className={cn(
        "border-app-border flex items-center justify-between border-t",
        "bg-app-sidebar text-app-fg-label px-3 py-1 text-xs"
      )}
    >
      <span className="shrink-0">
        {flatList.length} elemento{flatList.length !== 1 ? "s" : ""}
      </span>
      {item?.type === "link" && (
        <span className="min-w-0 max-w-[min(65vw,20rem)] truncate text-right text-[10px] leading-tight sm:max-w-[400px] sm:text-xs">
          {item.bookmark.url}
        </span>
      )}
    </div>
  )
}
