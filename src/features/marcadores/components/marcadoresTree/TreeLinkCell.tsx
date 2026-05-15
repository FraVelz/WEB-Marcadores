"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

import { getFavicon } from "../../utils/utils"
import type { Bookmark } from "../../utils/types"

export function TreeLinkCell({ bookmark, padForCheckbox }: { bookmark: Bookmark; padForCheckbox: boolean }) {
  const favicon = getFavicon(bookmark.url)
  const [faviconError, setFaviconError] = useState(false)
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "")
    } catch {
      return bookmark.url
    }
  })()

  return (
    <>
      <span className={cn("w-7 shrink-0", padForCheckbox && "ml-6")} aria-hidden />
      {favicon && !faviconError ? (
        <Image
          src={favicon}
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 rounded"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      ) : (
        <div className="bg-app-hover flex size-7 shrink-0 items-center justify-center rounded">
          <svg className="text-app-accent size-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d={
                "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 " +
                "5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2z" +
                "m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 " +
                "3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
              }
            />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1 py-1">
        <span className="text-app-fg font-medium">{bookmark.title}</span>
        <p className="text-app-fg-label truncate text-xs">{hostname}</p>
      </div>
    </>
  )
}
