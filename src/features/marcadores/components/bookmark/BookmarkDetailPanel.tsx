"use client"

import { useState, useRef } from "react"
import Image from "next/image"

import type { Bookmark } from "@/features/marcadores/utils/types"

import { SearchHighlightText } from "@/features/marcadores/components/SearchHighlightText"
import { buildFolderOptions, getFaviconUrl, getFolderPathLabel } from "@/lib/bookmark-utils"
import BookmarkDetailFolderSection from "./BookmarkDetailFolderSection"
import BookmarkDetailTagsSection from "./BookmarkDetailTagsSection"

import { cn } from "@/lib/utils"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number }

type Props = {
  bookmark: Bookmark | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  onTelemetryOpen?: (id: string) => Promise<void>
  allTags: string[]
  folders: Folder[]
  embedded?: boolean
  /** Query debounced del buscador; resalta coincidencias en título, URL y descripción. */
  searchQuery?: string
  /** Oculta la cabecera interna cuando el panel va dentro de un marco de ventana de escritorio */
  omitEmbeddedHeader?: boolean
}

function BookmarkDetailPanelInner({
  bookmark,
  onClose,
  onUpdate,
  onTelemetryOpen,
  allTags,
  folders,
  embedded = false,
  omitEmbeddedHeader = false,
  searchQuery = "",
}: Props & { bookmark: NonNullable<Props["bookmark"]> }) {
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)
  const [moveFolderId, setMoveFolderId] = useState(bookmark.folder_id || "")
  const [faviconBroken, setFaviconBroken] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const tags = bookmark.tags || []
  const favicon = getFaviconUrl(bookmark.url)
  const created = bookmark.created_at
    ? new Date(bookmark.created_at).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null
  const opened = bookmark.opened_at
    ? new Date(bookmark.opened_at).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null
  const folderOptions = buildFolderOptions(folders)
  const currentFolderPath = getFolderPathLabel(folders, bookmark.folder_id || null)
  const highlight = searchQuery.trim() !== ""

  const handleTelemetry = () => {
    if (onTelemetryOpen) void onTelemetryOpen(bookmark.id)
  }

  const handleAddTag = async (tag: string) => {
    const t = tag.trim()
    if (!t || tags.includes(t)) return
    setSaving(true)
    await onUpdate(bookmark.id, { tags: [...tags, t] })
    setSaving(false)
    setNewTag("")
  }

  const handleRemoveTag = async (tag: string) => {
    setSaving(true)
    await onUpdate(bookmark.id, { tags: tags.filter((t) => t !== tag) })
    setSaving(false)
  }

  const handleMoveFolder = async () => {
    const targetId = moveFolderId || null
    if (targetId === (bookmark.folder_id || null)) return
    setSaving(true)
    await onUpdate(bookmark.id, { folder_id: targetId })
    setSaving(false)
  }

  const toggleFavorite = async () => {
    setSaving(true)
    await onUpdate(bookmark.id, { is_favorite: !(bookmark.is_favorite ?? false) })
    setSaving(false)
  }

  const toggleArchived = async () => {
    setSaving(true)
    const archived = bookmark.archived_at ? null : new Date().toISOString()
    await onUpdate(bookmark.id, { archived_at: archived })
    setSaving(false)
  }

  const panelContent = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={embedded ? false : true}
      aria-label={embedded ? "Propiedades del marcador" : "Detalle del marcador"}
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
      className={
        embedded
          ? cn(
              "border-app-border bg-app-sidebar flex max-h-none min-h-0 flex-col overflow-hidden",
              "fixed inset-0 z-[45] h-dvh shadow-none md:relative md:inset-auto md:z-auto",
              omitEmbeddedHeader
                ? "h-full min-h-0 w-full max-w-none border-0 md:h-full md:max-h-full"
                : "md:h-full md:max-h-full md:min-h-0 md:max-w-[320px] md:min-w-[280px] md:border-l md:shadow-none"
            )
          : cn(
              "border-app-border-muted bg-app-raised fixed top-0 right-0 z-50 h-full max-h-dvh w-full max-w-full border-l shadow-xl",
              "sm:left-auto sm:max-w-80"
            )
      }
    >
      <div className="flex h-full min-h-0 flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:pt-4 md:pb-4">
        {!omitEmbeddedHeader ? (
          <div className="border-app-border mb-4 flex items-center justify-between border-b pb-2">
            <h3 className="text-app-fg-label text-xs font-semibold tracking-wider uppercase">
              {embedded ? "Propiedades" : "Detalle"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-app-fg-label hover:bg-app-hover hover:text-app-fg rounded p-1"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex items-start gap-3">
            {favicon && !faviconBroken ? (
              <Image
                src={favicon}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded"
                unoptimized
                onError={() => setFaviconBroken(true)}
              />
            ) : (
              <div className="bg-app-hover flex size-10 shrink-0 items-center justify-center rounded">
                <span className="text-app-fg-muted text-xs">⋯</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-app-fg font-semibold">
                {highlight ? <SearchHighlightText text={bookmark.title || ""} query={searchQuery} /> : bookmark.title}
              </h2>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                onAuxClick={(e) => {
                  if (e.button !== 1) return
                  handleTelemetry()
                }}
                onClick={handleTelemetry}
                className="text-app-link mt-1 block truncate text-xs hover:underline"
              >
                {highlight ? <SearchHighlightText text={bookmark.url || ""} query={searchQuery} /> : bookmark.url}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void toggleFavorite()}
              className={cn(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                bookmark.is_favorite
                  ? "border-app-accent bg-app-selection ring-app-focus ring-1"
                  : "border-app-border-muted bg-app-toolbar hover:border-app-accent"
              )}
            >
              {bookmark.is_favorite ? "Favorito ★" : "Marcar favorito"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void toggleArchived()}
              className="border-app-border-muted bg-app-toolbar hover:border-app-accent rounded-md border px-2 py-1 text-xs"
            >
              {bookmark.archived_at ? "Restaurar" : "Archivar"}
            </button>
          </div>

          <BookmarkDetailFolderSection
            currentFolderPath={currentFolderPath}
            folderOptions={folderOptions}
            moveFolderId={moveFolderId}
            onMoveFolderIdChange={setMoveFolderId}
            onMove={handleMoveFolder}
            saving={saving}
            bookmarkFolderId={bookmark.folder_id || null}
          />

          {bookmark.description ? (
            <div>
              <div className="text-app-fg-label mb-1 text-xs font-medium">Descripción</div>
              <p className="text-app-fg-secondary text-sm">
                {highlight ? (
                  <SearchHighlightText text={bookmark.description} query={searchQuery} />
                ) : (
                  bookmark.description
                )}
              </p>
            </div>
          ) : null}

          <div className="text-app-fg-muted space-y-1 text-xs">
            {created && <p>Añadido: {created}</p>}
            <p>Aperturas: {bookmark.open_count ?? 0}</p>
            {opened ? <p>Última apertura: {opened}</p> : <p>Nunca abierto desde la app</p>}
          </div>

          <BookmarkDetailTagsSection
            tags={tags}
            newTag={newTag}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            allTags={allTags}
            saving={saving}
          />
        </div>

        <div className="border-app-border-muted mt-4 flex gap-2 border-t pt-4">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTelemetry}
            className={cn(
              "bg-app-primary flex-1 rounded-lg py-2 text-center text-sm font-medium text-white no-underline",
              "hover:bg-app-primary-hover"
            )}
          >
            Abrir
          </a>
        </div>
      </div>
    </div>
  )

  if (embedded) return panelContent

  return (
    <>
      <button
        type="button"
        className="bg-app-overlay-strong fixed inset-0 z-40 cursor-default border-0"
        aria-label="Cerrar panel de detalle"
        onClick={onClose}
      />
      <div className="relative z-50">{panelContent}</div>
    </>
  )
}

export default function BookmarkDetailPanel({
  bookmark,
  onClose,
  onUpdate,
  onTelemetryOpen,
  allTags,
  folders,
  embedded = false,
  omitEmbeddedHeader = false,
  searchQuery = "",
}: Props) {
  useHotkeys(
    "esc",
    () => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      onClose()
    },
    { enabled: Boolean(bookmark) },
    [bookmark, onClose]
  )

  if (!bookmark) return null

  return (
    <BookmarkDetailPanelInner
      key={bookmark.id}
      bookmark={bookmark}
      onClose={onClose}
      onUpdate={onUpdate}
      onTelemetryOpen={onTelemetryOpen}
      allTags={allTags}
      folders={folders}
      embedded={embedded}
      omitEmbeddedHeader={omitEmbeddedHeader}
      searchQuery={searchQuery}
    />
  )
}
