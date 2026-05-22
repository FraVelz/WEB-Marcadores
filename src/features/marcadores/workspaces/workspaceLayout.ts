export type WorkspaceLayoutPayload = { template: "single"; revision?: number }

export const SINGLE_LAYOUT_PAYLOAD: WorkspaceLayoutPayload = { template: "single" }

/** Convierte layouts antiguos (p. ej. «zones») al único template soportado. */
export function normalizeWorkspaceLayout(payload: unknown): WorkspaceLayoutPayload {
  if (
    payload &&
    typeof payload === "object" &&
    "template" in payload &&
    (payload as WorkspaceLayoutPayload).template === "single"
  ) {
    return payload as WorkspaceLayoutPayload
  }
  return SINGLE_LAYOUT_PAYLOAD
}
