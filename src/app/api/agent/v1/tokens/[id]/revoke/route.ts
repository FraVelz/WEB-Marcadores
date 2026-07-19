import { jsonError, jsonOk } from "@/lib/agent/http"
import { createAdminClient, isAgentBackendConfigured } from "@/lib/supabase/admin"
import { requireSessionUserId } from "@/lib/supabase/server"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: Request, context: Ctx) {
  try {
    if (!isAgentBackendConfigured()) {
      return jsonError(
        Object.assign(new Error("Agent backend not configured"), { status: 503, code: "not_configured" })
      )
    }
    const userId = await requireSessionUserId()
    const { id } = await context.params
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("mcp_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", id)
      .is("revoked_at", null)
      .select("id")
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return jsonError(Object.assign(new Error("Token not found"), { status: 404, code: "not_found" }))
    }
    return jsonOk({ ok: true })
  } catch (error) {
    return jsonError(error)
  }
}
