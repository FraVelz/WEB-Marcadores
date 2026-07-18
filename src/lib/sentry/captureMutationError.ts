import * as Sentry from "@sentry/nextjs"

const SENSITIVE_QUERY = /([?&](?:token|access_token|refresh_token|key|api_key|apikey|auth|password|secret)=)[^&]*/gi
const SENSITIVE_KEY_EXACT = new Set(["authorization"])

function isSensitiveKey(key: string): boolean {
  if (SENSITIVE_KEY_EXACT.has(key)) return true
  return key.includes("token") || key.includes("password") || key.includes("secret")
}

/** Redacta query params sensibles en URLs antes de enviar a Sentry. */
export function scrubUrlForSentry(value: string): string {
  return value.replace(SENSITIVE_QUERY, "$1[redacted]")
}

function scrubUnknown(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.includes("://") || value.includes("?")) return scrubUrlForSentry(value)
    return value
  }
  if (Array.isArray(value)) return value.map(scrubUnknown)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const key = k.toLowerCase()
      if (isSensitiveKey(key)) {
        out[k] = "[redacted]"
      } else {
        out[k] = scrubUnknown(v)
      }
    }
    return out
  }
  return value
}

/**
 * Captura errores de mutaciones de marcadores.
 * Sin DSN configurado, @sentry/nextjs no-op de forma segura.
 */
export function captureMutationError(
  error: unknown,
  context: { mutation: string; extra?: Record<string, unknown> }
): void {
  Sentry.withScope((scope) => {
    scope.setTag("area", "marcadores")
    scope.setTag("mutation", context.mutation)
    scope.setLevel("error")
    if (context.extra) {
      scope.setExtras(scrubUnknown(context.extra) as Record<string, unknown>)
    }
    Sentry.captureException(error)
  })
}
