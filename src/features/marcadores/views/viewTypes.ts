/** Serializable filter AST (combined with toolbar text search separately). */

export type ViewAtom =
  | { type: "favorite" }
  | { type: "archived"; archived: boolean }
  | { type: "noTags" }
  | { type: "domain"; host: string }
  | { type: "tagContains"; substring: string }
  | { type: "hasTag"; tag: string }
  | { type: "inFolder"; folderId: string | null }
  | { type: "neverOpened" }
  | { type: "lastOpenedOlderThanMonths"; months: number }
  | { type: "lastOpenedOlderThanDays"; days: number }

export type ViewAst = ViewAtom | { op: "and" | "or"; clauses: ViewAst[] }

export const EMPTY_VIEW_AST: ViewAst = { op: "and", clauses: [] }
