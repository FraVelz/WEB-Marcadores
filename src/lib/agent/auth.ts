import { createHash, randomBytes } from "node:crypto"

import type { AgentScope } from "./constants"
import { AGENT_SCOPES, DEFAULT_PAT_SCOPES } from "./constants"
import { createAdminClient, isAgentBackendConfigured } from "@/lib/supabase/admin"

export type AgentAuthContext = {
  userId: string
  scopes: AgentScope[]
  tokenId: string | null
  authKind: "pat" | "jwt"
}

export class AgentAuthError extends Error {
  status: number
  code: string
  constructor(message: string, status = 401, code = "unauthorized") {
    super(message)
    this.status = status
    this.code = code
  }
}

export function hashPatSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex")
}

export function generatePatSecret(): { token: string; prefix: string; hash: string } {
  const raw = randomBytes(32).toString("base64url")
  const token = `wm_${raw}`
  const prefix = token.slice(0, 11)
  return { token, prefix, hash: hashPatSecret(token) }
}

export function parseScopes(raw: unknown): AgentScope[] {
  if (!Array.isArray(raw)) return [...DEFAULT_PAT_SCOPES]
  const allowed = new Set<string>(AGENT_SCOPES)
  const out = raw.map(String).filter((s): s is AgentScope => allowed.has(s))
  return out.length > 0 ? out : [...DEFAULT_PAT_SCOPES]
}

function bearerFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim())
  return m?.[1]?.trim() || null
}

async function authWithPat(token: string): Promise<AgentAuthContext> {
  const hash = hashPatSecret(token)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("mcp_tokens")
    .select("id, user_id, scopes, expires_at, revoked_at")
    .eq("token_hash", hash)
    .maybeSingle()

  if (error || !data) throw new AgentAuthError("Invalid token", 401, "invalid_token")
  if (data.revoked_at) throw new AgentAuthError("Token revoked", 401, "token_revoked")
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    throw new AgentAuthError("Token expired", 401, "token_expired")
  }

  void admin.from("mcp_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)

  return {
    userId: data.user_id as string,
    scopes: parseScopes(data.scopes),
    tokenId: data.id as string,
    authKind: "pat",
  }
}

async function authWithJwt(jwt: string): Promise<AgentAuthContext> {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.getUser(jwt)
  if (error || !data.user) throw new AgentAuthError("Invalid session token", 401, "invalid_jwt")
  return {
    userId: data.user.id,
    scopes: [...AGENT_SCOPES],
    tokenId: null,
    authKind: "jwt",
  }
}

/** Authenticate Agent/MCP request from Authorization Bearer (PAT wm_… or Supabase JWT). */
export async function authenticateAgentRequest(req: Request): Promise<AgentAuthContext> {
  if (!isAgentBackendConfigured()) {
    throw new AgentAuthError("Agent backend not configured", 503, "not_configured")
  }
  const token = bearerFromHeader(req.headers.get("authorization"))
  if (!token) throw new AgentAuthError("Missing Bearer token", 401, "missing_token")
  if (token.startsWith("wm_")) return authWithPat(token)
  return authWithJwt(token)
}

export function requireScope(ctx: AgentAuthContext, scope: AgentScope): void {
  if (!ctx.scopes.includes(scope)) {
    throw new AgentAuthError(`Missing scope: ${scope}`, 403, "forbidden_scope")
  }
}
