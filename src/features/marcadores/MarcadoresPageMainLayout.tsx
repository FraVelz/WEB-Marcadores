"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function MarcadoresPageMainLayout(props: {
  desktopWindowChrome: boolean
  zonesBoard: boolean
  zonesSlot: ReactNode
  desktopSlot: ReactNode
  stackedSlot: ReactNode
}) {
  const { desktopWindowChrome, zonesBoard, zonesSlot, desktopSlot, stackedSlot } = props
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 overflow-hidden",
        desktopWindowChrome ? "flex-col" : "flex-col md:flex-row"
      )}
    >
      {zonesBoard ? zonesSlot : desktopWindowChrome ? desktopSlot : stackedSlot}
    </div>
  )
}
