"use client"

import type { ReactNode } from "react"

import DemoBanner from "@/features/marcadores/components/DemoBanner"

export function MarcadoresDesktopFloatingOverlays(props: { demoMode: boolean }): ReactNode {
  return <>{props.demoMode ? <DemoBanner /> : null}</>
}
