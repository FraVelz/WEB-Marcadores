"use client"

import type { ReactNode } from "react"

import DemoBanner from "@/features/marcadores/components/DemoBanner"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"

export function MarcadoresDesktopFloatingOverlays(props: { demoMode: boolean; pasteError: string | null }): ReactNode {
  return (
    <>
      {props.pasteError ? <PasteErrorBanner message={props.pasteError} /> : null}
      {props.demoMode ? <DemoBanner /> : null}
    </>
  )
}
