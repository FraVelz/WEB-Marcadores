import { authenticateAgentRequest, requireScope, type AgentAuthContext } from "@/lib/agent/auth"
import { writeAudit } from "@/lib/agent/audit"
import { jsonError, jsonOk } from "@/lib/agent/http"
import { rateLimitOrThrow } from "@/lib/agent/rate-limit"

export async function withAgent(
  req: Request,
  scope: Parameters<typeof requireScope>[1] | null,
  handler: (ctx: AgentAuthContext) => Promise<Response>
): Promise<Response> {
  try {
    const ctx = await authenticateAgentRequest(req)
    rateLimitOrThrow(ctx.tokenId ?? ctx.userId)
    if (scope) requireScope(ctx, scope)
    return await handler(ctx)
  } catch (error) {
    return jsonError(error)
  }
}

export { jsonOk, jsonError, writeAudit }
