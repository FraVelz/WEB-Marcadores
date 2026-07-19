import { isHttpUrl } from "@/lib/isHttpUrl"

import type { Bookmark, FlatFolder } from "./types"
import type { NetscapeNode } from "./netscapeBookmarks"

export const MARCADORES_BACKUP_VERSION = 2 as const

export type MarcadoresBackupV2 = {
  version: typeof MARCADORES_BACKUP_VERSION
  exportedAt: string
  folders: Array<{
    id: string
    parent_id: string | null
    name: string
    sort_order: number
  }>
  bookmarks: Array<{
    title: string
    url: string
    description?: string
    folder_id?: string | null
    tags?: string[]
    is_favorite?: boolean
    metadata?: Record<string, unknown>
  }>
}

/** @deprecated Use MarcadoresBackupV2 */
export type MarcadoresBackupV1 = Omit<MarcadoresBackupV2, "version"> & { version: 1 }

export type MarcadoresBackup = MarcadoresBackupV1 | MarcadoresBackupV2

export type FlattenedImportItem =
  | { type: "folder"; tempId: string; parentTempId: string | null; name: string; sort_order: number }
  | {
      type: "link"
      tempId: string
      parentTempId: string | null
      title: string
      url: string
      description?: string
      tags?: string[]
      is_favorite?: boolean
      metadata?: Record<string, unknown>
    }

/** Serializa el estado actual a JSON de backup (solo vivos; sin trash). */
export function buildMarcadoresBackupJson(folders: FlatFolder[], bookmarks: Bookmark[]): MarcadoresBackupV2 {
  return {
    version: MARCADORES_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    folders: folders.map((f) => ({
      id: f.id,
      parent_id: f.parent_id,
      name: f.name,
      sort_order: f.sort_order,
    })),
    bookmarks: bookmarks.map((b) => ({
      title: b.title,
      url: b.url,
      description: b.description,
      folder_id: b.folder_id ?? null,
      tags: b.tags ?? [],
      is_favorite: b.is_favorite ?? false,
      metadata: b.metadata ?? {},
    })),
  }
}

export function stringifyMarcadoresBackup(backup: MarcadoresBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`
}

export function parseMarcadoresBackupJson(raw: string): MarcadoresBackupV2 {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("JSON de backup inválido")
  }
  if (!parsed || typeof parsed !== "object") throw new Error("JSON de backup inválido")
  const obj = parsed as Record<string, unknown>
  const version = obj.version
  if (version !== 1 && version !== 2) {
    throw new Error("Versión de backup no soportada (esperado 1 o 2)")
  }
  if (!Array.isArray(obj.folders) || !Array.isArray(obj.bookmarks)) {
    throw new Error("Backup incompleto: faltan folders o bookmarks")
  }

  const folders: MarcadoresBackupV2["folders"] = []
  for (const row of obj.folders) {
    if (!row || typeof row !== "object") continue
    const f = row as Record<string, unknown>
    const id = String(f.id ?? "")
    const name = String(f.name ?? "").trim()
    if (!id || !name) continue
    folders.push({
      id,
      parent_id: f.parent_id == null || f.parent_id === "" ? null : String(f.parent_id),
      name,
      sort_order: typeof f.sort_order === "number" ? f.sort_order : folders.length,
    })
  }

  const bookmarks: MarcadoresBackupV2["bookmarks"] = []
  let skipped = 0
  for (const row of obj.bookmarks) {
    if (!row || typeof row !== "object") continue
    const b = row as Record<string, unknown>
    const url = String(b.url ?? "").trim()
    const title = String(b.title ?? "").trim() || url
    if (!isHttpUrl(url)) {
      skipped += 1
      continue
    }
    const metadata =
      b.metadata && typeof b.metadata === "object" && !Array.isArray(b.metadata)
        ? (b.metadata as Record<string, unknown>)
        : {}
    bookmarks.push({
      title,
      url,
      description: typeof b.description === "string" ? b.description : undefined,
      folder_id: b.folder_id == null || b.folder_id === "" ? null : String(b.folder_id),
      tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
      is_favorite: Boolean(b.is_favorite),
      metadata,
    })
  }

  if (skipped > 0 && bookmarks.length === 0 && folders.length === 0) {
    throw new Error("El backup no contiene carpetas ni enlaces http(s) válidos")
  }

  return {
    version: MARCADORES_BACKUP_VERSION,
    exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
    folders,
    bookmarks,
  }
}

/** Aplana árbol Netscape a filas con ids temporales para insertar en orden. */
export function flattenNetscapeForest(
  roots: NetscapeNode[],
  parentTempId: string | null = null
): FlattenedImportItem[] {
  const out: FlattenedImportItem[] = []
  let folderSort = 0
  for (const node of roots) {
    if (node.type === "folder") {
      const tempId = `tmp-f-${out.length}-${Math.random().toString(36).slice(2, 8)}`
      out.push({
        type: "folder",
        tempId,
        parentTempId,
        name: node.name,
        sort_order: folderSort++,
      })
      out.push(...flattenNetscapeForest(node.children, tempId))
    } else {
      out.push({
        type: "link",
        tempId: `tmp-b-${out.length}-${Math.random().toString(36).slice(2, 8)}`,
        parentTempId,
        title: node.title,
        url: node.url,
      })
    }
  }
  return out
}

/** Convierte backup JSON a filas planas (ids del backup como tempId para remap). */
export function flattenBackupForImport(backup: MarcadoresBackup): FlattenedImportItem[] {
  const foldersSorted = backup.folders.toSorted((a, b) => {
    const depth = (id: string, seen = new Set<string>()): number => {
      if (seen.has(id)) return 0
      seen.add(id)
      const row = backup.folders.find((f) => f.id === id)
      if (!row?.parent_id) return 0
      return 1 + depth(row.parent_id, seen)
    }
    const dd = depth(a.id) - depth(b.id)
    if (dd !== 0) return dd
    return a.sort_order - b.sort_order
  })

  const items: FlattenedImportItem[] = foldersSorted.map((f) => ({
    type: "folder" as const,
    tempId: f.id,
    parentTempId: f.parent_id,
    name: f.name,
    sort_order: f.sort_order,
  }))

  for (const b of backup.bookmarks) {
    items.push({
      type: "link",
      tempId: `tmp-b-${items.length}`,
      parentTempId: b.folder_id ?? null,
      title: b.title,
      url: b.url,
      description: b.description,
      tags: b.tags,
      is_favorite: b.is_favorite,
      metadata: "metadata" in b ? b.metadata : undefined,
    })
  }
  return items
}
