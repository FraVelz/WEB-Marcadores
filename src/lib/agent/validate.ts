import { METADATA_MAX_BYTES } from "./constants"

export function assertConfirm(confirm: unknown, action: string): void {
  if (confirm !== true) {
    const err = new Error(`Destructive action "${action}" requires confirm: true`) as Error & {
      status: number
      code: string
    }
    err.status = 400
    err.code = "confirm_required"
    throw err
  }
}

export function sanitizeMetadata(raw: unknown): Record<string, unknown> {
  if (raw == null) return {}
  if (typeof raw !== "object" || Array.isArray(raw)) {
    const err = new Error("metadata must be a JSON object") as Error & { status: number; code: string }
    err.status = 400
    err.code = "invalid_metadata"
    throw err
  }
  const obj = raw as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      const err = new Error("metadata contains forbidden keys") as Error & { status: number; code: string }
      err.status = 400
      err.code = "invalid_metadata"
      throw err
    }
  }
  const json = JSON.stringify(obj)
  if (json.length > METADATA_MAX_BYTES) {
    const err = new Error(`metadata exceeds ${METADATA_MAX_BYTES} bytes`) as Error & {
      status: number
      code: string
    }
    err.status = 400
    err.code = "metadata_too_large"
    throw err
  }
  return JSON.parse(json) as Record<string, unknown>
}

export function mergeMetadata(
  current: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown>,
  mode: "merge" | "replace" = "merge"
): Record<string, unknown> {
  if (mode === "replace") return sanitizeMetadata(patch)
  return sanitizeMetadata({ ...(current ?? {}), ...patch })
}

export function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}
