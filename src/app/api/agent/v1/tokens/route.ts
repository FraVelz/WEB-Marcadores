import { generatePatSecret, parseScopes } from "@/lib/agent/auth"
import { AGENT_SCOPES } from "@/lib/agent/constants"
import { jsonError, jsonOk } from "@/lib/agent/http"
import { createAdminClient, isAgentBackendConfigured } from "@/lib/supabase/admin"
import { requireSessionUserId } from "@/lib/supabase/server"

export async function GET() {
  try {
    if (!isAgentBackendConfigured()) {
      return jsonError(
        Object.assign(new Error("Agent backend not configured"), { status: 503, code: "not_configured" })
      )
    }
    const userId = await requireSessionUserId()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("mcp_tokens")
      .select("id, name, prefix, scopes, expires_at, created_at, last_used_at, revoked_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return jsonOk({ tokens: data ?? [], scopes: AGENT_SCOPES })
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(req: Request) {
  try {
    if (!isAgentBackendConfigured()) {
      return jsonError(
        Object.assign(new Error("Agent backend not configured"), { status: 503, code: "not_configured" })
      )
    }
    const userId = await requireSessionUserId()
    const body = (await req.json()) as {
      name?: string
      scopes?: string[]
      expires_at?: string | null
    }
    const name = String(body.name ?? "").trim()
    if (!name) {
      return jsonError(Object.assign(new Error("name required"), { status: 400, code: "invalid_name" }))
    }
    const { token, prefix, hash } = generatePatSecret()
    const scopes = parseScopes(body.scopes)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("mcp_tokens")
      .insert({
        user_id: userId,
        name,
        token_hash: hash,
        prefix,
        scopes,
        expires_at: body.expires_at ?? null,
      })
      .select("id, name, prefix, scopes, expires_at, created_at")
      .single()
    if (error) throw error
    return jsonOk({ token: data, secret: token }, 201)
  } catch (error) {
    return jsonError(error)
  }
}
