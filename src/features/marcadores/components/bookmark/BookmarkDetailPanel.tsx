"use client"

import { useState, useRef } from "react"
import Image from "next/image"

import type { Bookmark } from "@/features/marcadores/utils/types"

import { SearchHighlightText } from "@/features/marcadores/components/SearchHighlightText"
import { buildFolderOptions, getFaviconUrl, getFolderPathLabel } from "@/lib/bookmark-utils"
import BookmarkDetailFolderSection from "./BookmarkDetailFolderSection"
import BookmarkDetailTagsSection from "./BookmarkDetailTagsSection"

import { cn } from "@/lib/utils"
import { FOCUS_RING, FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number }

type Props = {
  bookmark: Bookmark | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  onTelemetryOpen?: (id: string) => Promise<void>
  onEdit?: () => void
  onDelete?: () => void
  allTags: string[]
  folders: Folder[]
  embedded?: boolean
  /** Muestra columna vacía en desktop aunque no haya marcador seleccionado */
  persistent?: boolean
  searchQuery?: string
  omitEmbeddedHeader?: boolean
}

function DetailPlaceholder() {
  return (
    <aside className="border-app-border bg-app-sidebar hidden w-full max-w-[20rem] min-w-[17.5rem] shrink-0 flex-col border-l md:flex">
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="bg-app-hover mb-4 flex size-16 items-center justify-center rounded-2xl">
          <svg
            className="text-app-fg-muted size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-app-fg font-medium">Selecciona un marcador</p>
        <p className="text-app-fg-muted mt-1 text-sm">Aquí verás los detalles del enlace</p>
      </div>
    </aside>
  )
}

function ActionIconButton({
  label,
  onClick,
  href,
  danger,
  children,
}: {
  label: string
  onClick?: () => void
  href?: string
  danger?: boolean
  children: React.ReactNode
}) {
  const className = cn(
    "flex size-10 items-center justify-center rounded-lg transition-colors",
    FOCUS_RING_ICON_BTN,
    danger ? "text-app-danger-fg hover:bg-app-danger/15" : "text-app-fg-muted hover:bg-app-hover hover:text-app-fg"
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label} title={label}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={className} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  )
}

function BookmarkDetailPanelInner({
  bookmark,
  onClose,
  onUpdate,
  onTelemetryOpen,
  onEdit,
  onDelete,
  allTags,
  folders,
  embedded = false,
  persistent = false,
  omitEmbeddedHeader = false,
  searchQuery = "",
}: Props & { bookmark: NonNullable<Props["bookmark"]> }) {
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)
  const [moveFolderId, setMoveFolderId] = useState(bookmark.folder_id || "")
  const [faviconBroken, setFaviconBroken] = useState(false)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const tags = bookmark.tags || []
  const favicon = getFaviconUrl(bookmark.url)
  const created = bookmark.created_at
    ? new Date(bookmark.created_at).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const panelContent = (
    <aside
      ref={panelRef}
      aria-label="Detalle del marcador"
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
      className={
        embedded
          ? cn(
              "border-app-border bg-app-sidebar flex max-h-none min-h-0 flex-col overflow-hidden border-l",
              "fixed inset-0 z-[45] h-dvh w-full shadow-xl md:relative md:inset-auto md:z-auto md:h-full md:max-h-full md:w-full md:max-w-[20rem] md:min-w-[17.5rem] md:shadow-none",
              persistent ? "hidden md:flex" : ""
            )
          : cn(
              "border-app-border-muted bg-app-raised fixed top-0 right-0 z-50 h-full max-h-dvh w-full max-w-full border-l shadow-xl",
              "sm:left-auto sm:max-w-80"
            )
      }
    >
      <div className="flex h-full min-h-0 flex-col p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pt-5 md:pb-5">
        {!omitEmbeddedHeader ? (
          <div className="mb-5 flex items-center justify-end md:hidden">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded-lg p-2",
                FOCUS_RING_ICON_BTN
              )}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        ) : null}

        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          {favicon && !faviconBroken ? (
            <Image
              src={favicon}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-2xl"
              unoptimized
              onError={() => setFaviconBroken(true)}
            />
          ) : (
            <div className="bg-app-hover flex size-16 items-center justify-center rounded-2xl">
              <span className="text-app-fg-muted text-lg">⋯</span>
            </div>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => void toggleFavorite()}
            className={cn(
              "rounded-full p-1.5 transition-colors",
              FOCUS_RING_ICON_BTN,
              bookmark.is_favorite ? "text-amber-400" : "text-app-fg-muted hover:text-amber-400"
            )}
            aria-label={bookmark.is_favorite ? "Quitar de favoritos" : "Marcar favorito"}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill={bookmark.is_favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-app-fg text-lg font-semibold">
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
              className={cn("text-app-link mt-2 block truncate text-sm hover:underline", FOCUS_RING)}
            >
              {highlight ? <SearchHighlightText text={bookmark.url || ""} query={searchQuery} /> : bookmark.url}
            </a>
          </div>

          {bookmark.description ? (
            <div>
              <div className="text-app-fg-label mb-1 text-xs font-medium tracking-wide uppercase">Descripción</div>
              <p className="text-app-fg-secondary text-sm leading-relaxed">
                {highlight ? (
                  <SearchHighlightText text={bookmark.description} query={searchQuery} />
                ) : (
                  bookmark.description
                )}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <div className="text-app-fg-label mb-1 text-xs font-medium tracking-wide uppercase">Carpeta</div>
              <p className="text-app-fg text-sm">{currentFolderPath}</p>
            </div>

            {tags.length > 0 ? (
              <div>
                <div className="text-app-fg-label mb-1.5 text-xs font-medium tracking-wide uppercase">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-app-primary/10 text-app-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {created ? (
              <div>
                <div className="text-app-fg-label mb-1 text-xs font-medium tracking-wide uppercase">Añadido</div>
                <p className="text-app-fg-secondary text-sm">{created}</p>
              </div>
            ) : null}
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

        <div className="border-app-border mt-4 flex items-center justify-center gap-2 border-t pt-4">
          <ActionIconButton label="Abrir enlace" href={bookmark.url} onClick={handleTelemetry}>
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ActionIconButton>
          <ActionIconButton label={copied ? "Copiado" : "Copiar URL"} onClick={() => void copyUrl()}>
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </ActionIconButton>
          {onEdit ? (
            <ActionIconButton label="Editar" onClick={onEdit}>
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </ActionIconButton>
          ) : null}
          {onDelete ? (
            <ActionIconButton label="Eliminar" onClick={onDelete} danger>
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
              </svg>
            </ActionIconButton>
          ) : null}
        </div>
      </div>
    </aside>
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
  onEdit,
  onDelete,
  allTags,
  folders,
  embedded = false,
  persistent = false,
  omitEmbeddedHeader = false,
  searchQuery = "",
}: Props) {
  useHotkeys(
    "esc",
    () => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      onClose()
    },
    { enabled: Boolean(bookmark) && !persistent },
    [bookmark, onClose, persistent]
  )

  if (!bookmark) {
    if (persistent && embedded) return <DetailPlaceholder />
    return null
  }

  return (
    <BookmarkDetailPanelInner
      key={bookmark.id}
      bookmark={bookmark}
      onClose={onClose}
      onUpdate={onUpdate}
      onTelemetryOpen={onTelemetryOpen}
      onEdit={onEdit}
      onDelete={onDelete}
      allTags={allTags}
      folders={folders}
      embedded={embedded}
      persistent={persistent}
      omitEmbeddedHeader={omitEmbeddedHeader}
      searchQuery={searchQuery}
    />
  )
}
