/** Hueco entre ventanas al usar «Dos columnas». */
export const TILE_COLUMN_GAP = 8
export const MIN_CANVAS = 64
export const CASCADE = 26

export function desktopWmStorageKeyBase(workspaceId: string | null) {
  return `marcadores_wm_${workspaceId ?? "default"}`
}
