import type { AgentAuthContext } from "./auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function writeAudit(input: {
  ctx: AgentAuthContext
  action: string
  resourceType?: string
  resourceId?: string
  req?: Request
  payload?: Record<string, unknown>
}): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from("mcp_audit_log").insert({
      user_id: input.ctx.userId,
      token_id: input.ctx.tokenId,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      ip: input.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: input.req?.headers.get("user-agent") ?? null,
      payload: input.payload ?? {},
    })
  } catch {
    // Audit must not break agent flows
  }
}
