"use client"

import MarcadoresZoneBoard from "@/features/marcadores/components/MarcadoresZoneBoard"
import type { Bookmark, CutItem } from "@/features/marcadores/utils/types"
import type { WorkspaceZoneColumn } from "@/features/marcadores/workspaces/workspaceLayout"

export function MarcadoresZonesPageSlot(props: {
  pool: Bookmark[]
  columns: WorkspaceZoneColumn[]
  selectMode: boolean
  selectedIds: Set<string>
  cutItem: CutItem | null
  onToggleSelect: (id: string) => void
  openBookmarkTab: (b: Bookmark) => void
  onZonesReorder: (cols: WorkspaceZoneColumn[]) => void
}) {
  return (
    <MarcadoresZoneBoard
      pool={props.pool}
      columns={props.columns}
      selectMode={props.selectMode}
      selectedIds={props.selectedIds}
      cutItem={props.cutItem}
      onToggleSelect={props.onToggleSelect}
      onOpenBookmark={props.openBookmarkTab}
      onColumnsReorder={props.onZonesReorder}
    />
  )
}
