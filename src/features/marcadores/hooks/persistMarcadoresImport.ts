"use client"

import type { Dispatch, SetStateAction } from "react"

import { createClient } from "@/lib/supabase/client"
import { captureMutationError } from "@/lib/sentry/captureMutationError"
import { isHttpUrl } from "@/lib/isHttpUrl"

import {
  flattenBackupForImport,
  flattenNetscapeForest,
  parseMarcadoresBackupJson,
  type FlattenedImportItem,
} from "../utils/marcadoresBackup"
import {
  assertImportItemCount,
  assertImportRateLimit,
  getDefaultImportRateStore,
  recordImportAttempt,
} from "../utils/importRateLimit"
import { assertImportSize, parseNetscapeBookmarksHtml } from "../utils/netscapeBookmarks"
import type { Bookmark, FlatFolder } from "../utils/types"
import { buildFolderTree } from "../utils/utils"

function beginImportGate(itemCount: number): void {
  const store = getDefaultImportRateStore()
  assertImportRateLimit(store)
  assertImportItemCount(itemCount)
  recordImportAttempt(store)
}

export type ImportSummary = {
  foldersCreated: number
  bookmarksCreated: number
  skippedLinks: number
  source: "netscape" | "json"
}

type PersistDeps = {
  demoMode: boolean
  supabase: ReturnType<typeof createClient>
  folders: FlatFolder[]
  setFolders: Dispatch<SetStateAction<FlatFolder[]>>
  setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void
  refreshFolders: () => void
  refreshTags: () => void
  fetchData: () => Promise<void>
  /** Carpeta destino de importación (null = raíz). */
  targetFolderId: string | null
}

async function persistFlattenedImport(
  deps: PersistDeps,
  items: FlattenedImportItem[],
  skippedLinks: number,
  source: ImportSummary["source"]
): Promise<ImportSummary> {
  const {
    demoMode,
    supabase,
    folders,
    setFolders,
    setBookmarks,
    setCtxFolders,
    refreshFolders,
    refreshTags,
    fetchData,
    targetFolderId,
  } = deps

  const idMap = new Map<string, string>()
  let foldersCreated = 0
  let bookmarksCreated = 0
  let nextSort = folders.filter((f) => (f.parent_id ?? null) === targetFolderId).length

  const resolveParent = (parentTempId: string | null): string | null => {
    if (parentTempId == null) return targetFolderId
    return idMap.get(parentTempId) ?? targetFolderId
  }

  if (demoMode) {
    const newFolders: FlatFolder[] = []
    const newBookmarks: Bookmark[] = []

    for (const item of items) {
      if (item.type === "folder") {
        const id = `f-import-${Date.now()}-${foldersCreated}`
        idMap.set(item.tempId, id)
        newFolders.push({
          id,
          parent_id: resolveParent(item.parentTempId),
          name: item.name,
          sort_order: item.parentTempId == null ? nextSort++ : item.sort_order,
        })
        foldersCreated += 1
      } else if (isHttpUrl(item.url)) {
        newBookmarks.push({
          id: `b-import-${Date.now()}-${bookmarksCreated}`,
          title: item.title,
          url: item.url,
          folder_id: resolveParent(item.parentTempId),
          created_at: new Date().toISOString(),
          tags: [],
        })
        bookmarksCreated += 1
      } else {
        skippedLinks += 1
      }
    }

    setFolders((prev) => {
      const next = [...prev, ...newFolders]
      setCtxFolders(buildFolderTree(next))
      return next
    })
    setBookmarks((prev) => [...prev, ...newBookmarks])
    refreshFolders()
    refreshTags()
    return { foldersCreated, bookmarksCreated, skippedLinks, source }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Debes iniciar sesión para importar")

  try {
    for (const item of items) {
      if (item.type === "folder") {
        const parent_id = resolveParent(item.parentTempId)
        const sort_order = item.parentTempId == null ? nextSort++ : item.sort_order
        const { data, error } = await supabase
          .from("folders")
          .insert({
            user_id: user.id,
            parent_id,
            name: item.name,
            sort_order,
          })
          .select()
          .single()
        if (error || !data) throw error ?? new Error("No se pudo crear carpeta en import")
        idMap.set(item.tempId, data.id)
        foldersCreated += 1
      } else {
        if (!isHttpUrl(item.url)) {
          skippedLinks += 1
          continue
        }
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          title: item.title,
          url: item.url,
          folder_id: resolveParent(item.parentTempId),
          tags: item.tags ?? [],
          description: item.description ?? null,
          is_favorite: item.is_favorite ?? false,
          metadata: item.metadata ?? {},
        })
        if (error) throw error
        bookmarksCreated += 1
      }
    }
    await fetchData()
    refreshFolders()
    refreshTags()
  } catch (error) {
    captureMutationError(error, { mutation: "import_bookmarks" })
    throw error
  }

  return { foldersCreated, bookmarksCreated, skippedLinks, source }
}

export async function importNetscapeHtmlFile(deps: PersistDeps, file: File): Promise<ImportSummary> {
  assertImportSize(file.size)
  const text = await file.text()
  const parsed = parseNetscapeBookmarksHtml(text)
  const items = flattenNetscapeForest(parsed.roots)
  beginImportGate(items.length)
  return persistFlattenedImport(deps, items, parsed.skippedLinks, "netscape")
}

export async function importBackupJsonFile(deps: PersistDeps, file: File): Promise<ImportSummary> {
  assertImportSize(file.size)
  const text = await file.text()
  const backup = parseMarcadoresBackupJson(text)
  const items = flattenBackupForImport(backup)
  beginImportGate(items.length)
  return persistFlattenedImport(deps, items, 0, "json")
}
