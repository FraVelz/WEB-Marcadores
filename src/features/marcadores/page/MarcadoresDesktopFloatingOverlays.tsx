"use client"

import type { ReactNode } from "react"

import DemoBanner from "@/features/marcadores/components/DemoBanner"
import DeleteConfirmBanner from "@/features/marcadores/components/DeleteConfirmBanner"
import PasteErrorBanner from "@/features/marcadores/components/PasteErrorBanner"

import type { GridItem } from "@/features/marcadores/utils/types"

export function MarcadoresDesktopFloatingOverlays(props: {
  demoMode: boolean
  pasteError: string | null
  deleteConfirmItem: GridItem | null
  onConfirmDelete: (item: GridItem) => void
  onCancelDelete: () => void
}): ReactNode {
  return (
    <>
      {props.pasteError ? <PasteErrorBanner message={props.pasteError} /> : null}
      {props.deleteConfirmItem ? (
        <DeleteConfirmBanner
          item={props.deleteConfirmItem}
          onConfirm={() => props.onConfirmDelete(props.deleteConfirmItem!)}
          onCancel={props.onCancelDelete}
        />
      ) : null}
      {props.demoMode ? <DemoBanner /> : null}
    </>
  )
}
