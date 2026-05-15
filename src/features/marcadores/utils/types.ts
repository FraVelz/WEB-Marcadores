export type Bookmark = {
  id: string
  title: string
  url: string
  description?: string
  folder_id?: string | null
  tags?: string[]
  created_at?: string
  updated_at?: string | null
  is_favorite?: boolean
  archived_at?: string | null
  opened_at?: string | null
  open_count?: number
}

export type FlatFolder = {
  id: string
  parent_id: string | null
  name: string
  sort_order: number
}

export type GridItem =
  | { type: "folder"; id: string; folderId: string; label: string }
  | { type: "link"; bookmark: Bookmark }

export type CutItem =
  | { type: "folder"; id: string; name: string; sourceParentId: string | null }
  | { type: "link"; bookmark: Bookmark; sourceFolderId: string | null }

export type BreadcrumbPart = { id: string | null; label: string }
