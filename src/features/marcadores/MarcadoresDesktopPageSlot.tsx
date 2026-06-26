"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"

import BookmarkDetailPanel from "@/features/marcadores/components/bookmark/BookmarkDetailPanel"

import { MarcadoresDesktopShell } from "@/features/marcadores/desktop/MarcadoresDesktopShell"
import type { MarcadoresDesktopLibraryPaneBodyProps } from "@/features/marcadores/MarcadoresDesktopLibraryPaneBody"
import type { Bookmark } from "@/features/marcadores/utils/types"

type BodyField = MarcadoresDesktopLibraryPaneBodyProps

export function MarcadoresDesktopPageSlot(props: {
  deskLibWinIds: string[]
  setDeskLibWinIds: Dispatch<SetStateAction<string[]>>
  addDeskLibraryWindow: () => void
  resolvedDeskLibPaneId: string | null
  focusDeskLibraryPane: (id: string) => void
  closeDeskLibraryWindow: (id: string) => void
  floatingOverlays: ReactNode
  detailBookmark: Bookmark | null
  detailSearchQuery?: string
  closeBookmarkDetailPanel: () => void
  recordBookmarkOpened: (id: string) => Promise<void>
  onBookmarkUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  allTags: string[]
  folders: BodyField["folders"]
  desktopPaneDerived: BodyField["desktopPaneDerived"]
  breadcrumb: BodyField["breadcrumbFallback"]
  flatList: BodyField["flatListFallback"]
  listForDeleteFallback: BodyField["listForDeleteFallback"]
  body: Omit<
    BodyField,
    "winId" | "focused" | "desktopPaneDerived" | "flatListFallback" | "listForDeleteFallback" | "breadcrumbFallback"
  >
}) {
  return (
    <MarcadoresDesktopShell
      libraryWindowIds={props.deskLibWinIds}
      setLibraryWindowIds={props.setDeskLibWinIds}
      onAddLibraryWindow={props.addDeskLibraryWindow}
      focusedLibraryPaneId={props.resolvedDeskLibPaneId}
      onFocusLibraryPane={props.focusDeskLibraryPane}
      floatingOverlays={props.floatingOverlays}
      onRequestCloseLibraryWindow={props.closeDeskLibraryWindow}
      detailOpen={Boolean(props.detailBookmark)}
      detailTitle={props.detailBookmark?.title}
      onCloseDetail={props.closeBookmarkDetailPanel}
      detailContent={
        props.detailBookmark ? (
          <BookmarkDetailPanel
            bookmark={props.detailBookmark}
            onClose={props.closeBookmarkDetailPanel}
            onTelemetryOpen={props.recordBookmarkOpened}
            onUpdate={props.onBookmarkUpdate}
            allTags={props.allTags}
            folders={props.folders}
            embedded
            omitEmbeddedHeader
            searchQuery={props.detailSearchQuery ?? ""}
          />
        ) : null
      }
      libraryPaneShareProps={{
        desktopPaneDerived: props.desktopPaneDerived,
        flatListFallback: props.flatList,
        listForDeleteFallback: props.listForDeleteFallback,
        breadcrumbFallback: props.breadcrumb,
        ...props.body,
      }}
    />
  )
}
