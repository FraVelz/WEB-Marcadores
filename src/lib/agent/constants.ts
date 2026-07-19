/** Days soft-deleted bookmarks/folders stay in trash before hard purge. */
export const TRASH_RETENTION_DAYS = 30

export const AGENT_SCOPES = [
  "bookmarks:read",
  "bookmarks:write",
  "library:export",
  "library:import",
  "trash:read",
  "trash:write",
] as const

export type AgentScope = (typeof AGENT_SCOPES)[number]

export const DEFAULT_PAT_SCOPES: AgentScope[] = ["bookmarks:read", "trash:read"]

export const METADATA_MAX_BYTES = 16 * 1024

export function trashPurgeAt(deletedAt: string | Date): Date {
  const d = typeof deletedAt === "string" ? new Date(deletedAt) : deletedAt
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + TRASH_RETENTION_DAYS)
  return out
}

export function daysLeftInTrash(deletedAt: string | Date, now = new Date()): number {
  const purge = trashPurgeAt(deletedAt)
  const ms = purge.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}
