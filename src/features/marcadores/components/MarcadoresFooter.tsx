"use client"

import { cn } from "@/lib/utils"
import type { GridItem } from "../types"

type Props = {
  flatList: GridItem[]
  selectedIndex: number
}

export default function MarcadoresFooter({ flatList, selectedIndex }: Props) {
  const item = flatList[selectedIndex]
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-zinc-700",
        "bg-[#252526] px-3 py-1 text-xs text-zinc-500"
      )}
    >
      <span>
        {flatList.length} elemento{flatList.length !== 1 ? "s" : ""}
      </span>
      {item?.type === "link" && <span className="max-w-[400px] truncate">{item.bookmark.url}</span>}
    </div>
  )
}
