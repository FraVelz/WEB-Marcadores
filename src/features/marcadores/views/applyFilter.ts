import type { Bookmark } from "../utils/types"
import type { DerivedBookmarkFields } from "./bookmarkDerived"
import type { ViewAst, ViewAtom } from "./viewTypes"

function monthsAgoDate(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

function daysAgoDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function atomMatch(b: Bookmark, d: DerivedBookmarkFields, clause: ViewAtom): boolean {
  switch (clause.type) {
    case "favorite":
      return !!b.is_favorite
    case "archived":
      return clause.archived ? Boolean(b.archived_at) : !b.archived_at
    case "noTags":
      return !b.tags?.length
    case "domain": {
      const h = clause.host.toLowerCase().replace(/^www\./, "")
      return d.host !== null && (d.host === h || d.host.endsWith("." + h))
    }
    case "tagContains": {
      const q = clause.substring.toLowerCase()
      return [...d.tagSetLower].some((t) => t.includes(q))
    }
    case "hasTag": {
      const t = clause.tag.toLowerCase()
      return d.tagSetLower.has(t)
    }
    case "inFolder": {
      const fid = (b.folder_id ?? null) as string | null
      const want = clause.folderId
      if (want === null) return fid === null
      return fid === want
    }
    case "neverOpened":
      return (b.open_count ?? 0) === 0
    case "lastOpenedOlderThanMonths": {
      if (!b.opened_at || (b.open_count ?? 0) === 0) return true
      return new Date(b.opened_at) <= monthsAgoDate(clause.months)
    }
    case "lastOpenedOlderThanDays": {
      if (!b.opened_at || (b.open_count ?? 0) === 0) return true
      return new Date(b.opened_at) <= daysAgoDate(clause.days)
    }
    default:
      return true
  }
}

function matchAst(b: Bookmark, derived: DerivedBookmarkFields, ast: ViewAst): boolean {
  const isGroup = typeof ast === "object" && ast && "op" in ast && (ast.op === "and" || ast.op === "or")
  if (isGroup) {
    const { op, clauses } = ast as { op: "and" | "or"; clauses: ViewAst[] }
    if (!clauses?.length) return true
    if (op === "and") return clauses.every((c) => matchAst(b, derived, c))
    return clauses.some((c) => matchAst(b, derived, c))
  }
  return atomMatch(b, derived, ast as ViewAtom)
}

export type CompiledView = {
  match: (b: Bookmark, d: DerivedBookmarkFields) => boolean
}

/** Compile once; callers derive fields per bookmark or cache maps as needed. */
export function compileView(ast: ViewAst): CompiledView {
  return {
    match(b, derived) {
      return matchAst(b, derived, ast)
    },
  }
}
