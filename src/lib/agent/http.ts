import { AgentAuthError } from "./auth"

export function jsonOk(data: unknown, init?: number | ResponseInit) {
  if (typeof init === "number") {
    return Response.json(data, { status: init })
  }
  return Response.json(data, { status: 200, ...init })
}

export function jsonError(error: unknown) {
  if (error instanceof AgentAuthError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  const e = error as Error & { status?: number; code?: string }
  const status = typeof e.status === "number" ? e.status : 500
  return Response.json(
    { error: { code: e.code ?? "internal_error", message: e.message || "Internal error" } },
    { status }
  )
}
