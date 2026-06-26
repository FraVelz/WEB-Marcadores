"use client"

import BookmarkModal from "@/features/marcadores/components/bookmark/BookmarkModal"
import MarcadoresFooter from "@/features/marcadores/components/MarcadoresFooter"
import { MarcadoresDesktopPageSlot } from "@/features/marcadores/MarcadoresDesktopPageSlot"
import { MarcadoresPageMainLayout } from "@/features/marcadores/MarcadoresPageMainLayout"
import { MarcadoresPageStackedChrome } from "@/features/marcadores/MarcadoresPageStackedChrome"
import { MarcadoresStackedPageSlot } from "@/features/marcadores/MarcadoresStackedPageSlot"
import { useMarcadoresPage } from "@/features/marcadores/useMarcadoresPage"

export function MarcadoresPage() {
  const m = useMarcadoresPage()
  const modal = m.bookmarkModal
  const pane = m.libraryPaneScope.getState()

  if (m.loading) return <div className="text-app-fg-label flex flex-1 items-center justify-center">Cargando…</div>

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!m.desktopWindowChrome ? <MarcadoresPageStackedChrome m={m} /> : null}

      <MarcadoresPageMainLayout
        desktopWindowChrome={m.desktopWindowChrome}
        desktopSlot={
          <MarcadoresDesktopPageSlot
            deskLibWinIds={m.deskLibWinIds}
            setDeskLibWinIds={m.setDeskLibWinIds}
            addDeskLibraryWindow={m.addDeskLibraryWindow}
            resolvedDeskLibPaneId={m.resolvedDeskLibPaneId}
            focusDeskLibraryPane={m.focusDeskLibraryPane}
            closeDeskLibraryWindow={m.closeDeskLibraryWindow}
            floatingOverlays={m.desktopFloatingOverlays}
            detailBookmark={pane.detailBookmark}
            detailSearchQuery={pane.searchValue.trim()}
            closeBookmarkDetailPanel={m.closeBookmarkDetailPanel}
            recordBookmarkOpened={m.recordBookmarkOpened}
            onBookmarkUpdate={m.onBookmarkUpdate}
            allTags={m.allTags}
            folders={m.folders}
            desktopPaneDerived={m.desktopPaneDerived}
            breadcrumb={m.breadcrumb}
            flatList={m.flatList}
            listForDeleteFallback={m.focusFlatList}
            body={m.paneBody}
          />
        }
        stackedSlot={<MarcadoresStackedPageSlot m={m} />}
      />

      {!m.desktopWindowChrome ? (
        <MarcadoresFooter flatList={m.focusFlatList} selectedIndex={pane.selectedIndex} />
      ) : null}

      {modal.open ? (
        <BookmarkModal
          key={modal.editing?.id ?? `new-${modal.nonce}`}
          onClose={modal.close}
          onSubmit={m.onModalSubmit}
          initialData={
            modal.editing
              ? {
                  title: modal.editing.title,
                  url: modal.editing.url,
                  description: modal.editing.description || "",
                  folder_id: modal.editing.folder_id || "",
                  tags: modal.editing.tags?.join(", ") || "",
                }
              : null
          }
          allTags={m.allTags}
          folders={m.folders}
          currentFolderId={modal.folderId}
        />
      ) : null}
    </div>
  )
}
