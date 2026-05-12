"use client"

import { useState, useRef, useEffect, useEffectEvent } from "react"
import Image from "next/image"

import { buildFolderOptions, getFaviconUrl, getFolderPathLabel } from "@/lib/bookmark-utils"
import BookmarkDetailFolderSection from "./bookmark/BookmarkDetailFolderSection"
import BookmarkDetailTagsSection from "./bookmark/BookmarkDetailTagsSection"

import { cn } from "@/lib/utils"

type Bookmark = {
  id: string
  title: string
  url: string
  description?: string
  folder_id?: string | null
  tags?: string[]
  created_at?: string
}

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number }

type Props = {
  bookmark: Bookmark | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  allTags: string[]
  folders: Folder[]
  embedded?: boolean
}

function BookmarkDetailPanelInner({
  bookmark,
  onClose,
  onUpdate,
  allTags,
  folders,
  embedded = false,
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
  const folderOptions = buildFolderOptions(folders)
  const currentFolderPath = getFolderPathLabel(folders, bookmark.folder_id || null)

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
              "md:h-full md:max-h-full md:min-h-0 md:max-w-[320px] md:min-w-[280px] md:border-l md:shadow-none"
            )
          : cn(
              "border-app-border-muted bg-app-raised fixed top-0 right-0 z-50 h-full max-h-dvh w-full max-w-full border-l shadow-xl",
              "sm:left-auto sm:max-w-80"
            )
      }
    >
      <div className="flex h-full min-h-0 flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:pt-4 md:pb-4">
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
              <h2 className="text-app-fg font-semibold">{bookmark.title}</h2>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-app-link mt-1 block truncate text-xs hover:underline"
              >
                {bookmark.url}
              </a>
            </div>
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
              <p className="text-app-fg-secondary text-sm">{bookmark.description}</p>
            </div>
          ) : null}

          {created && <p className="text-app-fg-label text-xs">Añadido: {created}</p>}

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
            className={cn(
              "bg-app-primary flex-1 rounded-lg py-2 text-center text-sm font-medium text-white",
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
  allTags,
  folders,
  embedded = false,
}: Props) {
  const onCloseEvent = useEffectEvent(onClose)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      onCloseEvent()
    }
    if (bookmark) window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [bookmark])

  if (!bookmark) return null

  return (
    <BookmarkDetailPanelInner
      key={bookmark.id}
      bookmark={bookmark}
      onClose={onClose}
      onUpdate={onUpdate}
      allTags={allTags}
      folders={folders}
      embedded={embedded}
    />
  )
}
