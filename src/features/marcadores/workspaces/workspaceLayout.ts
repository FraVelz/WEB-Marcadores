import type { ViewAst } from "../views/viewTypes"

export type WorkspaceZoneColumn = {
  id: string
  title: string
  filter: ViewAst | null
  widthFr?: number
  collapsed?: boolean
}

export type WorkspaceLayoutPayload =
  | { template: "single"; revision?: number }
  | {
      template: "zones"
      revision?: number
      columns: WorkspaceZoneColumn[]
    }

export const SINGLE_LAYOUT_PAYLOAD: WorkspaceLayoutPayload = { template: "single" }

export const DEFAULT_ZONE_LAYOUT = (): WorkspaceLayoutPayload => ({
  template: "zones",
  columns: [
    { id: "z-favs", title: "Favoritos", filter: { type: "favorite" }, widthFr: 1 },
    { id: "z-recent", title: "Sin abrir (+90 d)", filter: { type: "lastOpenedOlderThanDays", days: 90 }, widthFr: 1 },
    { id: "z-tags", title: "Sin tags", filter: { type: "noTags" }, widthFr: 1 },
  ],
})

export function isZonesLayout(
  p: WorkspaceLayoutPayload | null | undefined
): p is Extract<WorkspaceLayoutPayload, { template: "zones" }> {
  return p?.template === "zones"
}
