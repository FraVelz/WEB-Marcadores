const BLOCKED_SCHEME = /^(javascript|data|vbscript|file):/i

export const BOOKMARK_URL_ERROR = "La URL debe usar http:// o https:// (no javascript:, data: ni otros esquemas)."

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (BLOCKED_SCHEME.test(trimmed)) return false

  try {
    const url = new URL(trimmed)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
