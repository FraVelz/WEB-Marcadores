"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import { SearchHighlightText } from "@/features/marcadores/components/SearchHighlightText"
import {
  descriptionMatchSnippet,
  getBookmarkMatchFields,
  shouldShowDescriptionSnippet,
} from "@/features/marcadores/utils/bookmarkSearch"
import { cn } from "@/lib/utils"

import { getFavicon } from "../../utils/utils"
import type { Bookmark, FlatFolder } from "../../utils/types"

export function FolderContent({ label }: { label: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-2 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-app-folder/15">
        <svg className="text-app-folder size-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div className="min-w-0 w-full">
        <span className="text-app-fg block truncate font-medium">{label}</span>
        <p className="text-app-fg-muted mt-0.5 text-xs">Carpeta</p>
      </div>
    </div>
  )
}

type LinkContentProps = {
  bookmark: Bookmark
  locationLabel?: string
  searchQuery?: string
  searchInDescription?: boolean
  folderName?: string
  onToggleFavorite?: (isFavorite: boolean) => void
}

export function LinkContent({
  bookmark,
  locationLabel,
  searchQuery = "",
  searchInDescription = true,
  folderName,
  onToggleFavorite,
}: LinkContentProps) {
  const favicon = getFavicon(bookmark.url)
  const [faviconError, setFaviconError] = useState(false)
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "")
    } catch {
      return bookmark.url
    }
  })()

  const matchFields = useMemo(
    () => getBookmarkMatchFields(bookmark, searchQuery, searchInDescription),
    [bookmark, searchQuery, searchInDescription]
  )

  const descriptionSnippet = useMemo(() => {
    if (!matchFields || !shouldShowDescriptionSnippet(bookmark, matchFields)) return null
    return descriptionMatchSnippet(bookmark.description, searchQuery)
  }, [bookmark, matchFields, searchQuery])

  const highlight = searchQuery.trim() !== ""
  const tag = bookmark.tags?.[0] || folderName
  const isFavorite = bookmark.is_favorite ?? false

  return (
    <div className="flex w-full flex-col items-center gap-3 py-2 text-center">
      {onToggleFavorite ? (
        <button
          type="button"
          className={cn(
            "absolute top-3 right-3 rounded-md p-1 transition-colors",
            isFavorite ? "text-amber-400" : "text-app-fg-muted hover:text-amber-400"
          )}
          aria-label={isFavorite ? "Quitar de favoritos" : "Marcar favorito"}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(!isFavorite)
          }}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ) : null}

      {favicon && !faviconError ? (
        <Image
          src={favicon}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-xl"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      ) : (
        <div className="bg-app-hover flex size-12 items-center justify-center rounded-xl">
          <svg className="text-app-accent size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        </div>
      )}

      <div className="min-w-0 w-full px-1">
        <span className="text-app-fg line-clamp-2 text-sm font-semibold">
          {highlight ? <SearchHighlightText text={bookmark.title || ""} query={searchQuery} /> : bookmark.title}
        </span>
        {descriptionSnippet ? (
          <p className="text-app-fg-secondary mt-1 line-clamp-1 text-xs">
            <SearchHighlightText text={descriptionSnippet} query={searchQuery} />
          </p>
        ) : null}
        {locationLabel ? (
          <p className="text-app-fg-muted mt-1 truncate text-xs" title={locationLabel}>
            {highlight ? <SearchHighlightText text={locationLabel} query={searchQuery} /> : locationLabel}
          </p>
        ) : (
          <p className="text-app-fg-muted mt-1 truncate text-xs">
            {highlight ? <SearchHighlightText text={hostname} query={searchQuery} /> : hostname}
          </p>
        )}
      </div>

      {tag ? (
        <span className="bg-app-primary/10 text-app-primary mt-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          {tag}
        </span>
      ) : null}
    </div>
  )
}

export function resolveFolderName(folders: FlatFolder[], folderId: string | null | undefined): string | undefined {
  if (!folderId) return undefined
  return folders.find((f) => f.id === folderId)?.name
}
