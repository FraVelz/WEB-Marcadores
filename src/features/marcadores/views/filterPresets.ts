import type { ViewAst } from "./viewTypes"

export type FilterPreset = {
  id: string
  label: string
  hint?: string
  ast: ViewAst | null
}

/** Presets combinables dentro del modo «Filtro global». */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "favorites",
    label: "Favoritos",
    hint: "Destacados",
    ast: { type: "favorite" },
  },
  {
    id: "no-tags",
    label: "Sin tags",
    ast: { type: "noTags" },
  },
  {
    id: "never-open",
    label: "Nunca abierto",
    ast: { type: "neverOpened" },
  },
  {
    id: "stale-months",
    label: ">6 meses",
    hint: "Abiertos hace tiempo",
    ast: { type: "lastOpenedOlderThanMonths", months: 6 },
  },
  {
    id: "youtube",
    label: "YouTube",
    ast: { type: "domain", host: "youtube.com" },
  },
]
