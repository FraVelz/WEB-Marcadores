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
      <span>
        {flatList.length} elemento{flatList.length !== 1 ? "s" : ""}
      </span>
      {item?.type === "link" && <span className="max-w-[400px] truncate">{item.bookmark.url}</span>}
    </div>
  )
}
