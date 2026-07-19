import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import { authenticateAgentRequest } from "@/lib/agent/auth"
import { createMarcadoresMcpServer } from "@/lib/agent/mcp-server"
import { rateLimitOrThrow } from "@/lib/agent/rate-limit"
import { jsonError } from "@/lib/agent/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function handleMcp(req: Request): Promise<Response> {
  try {
    const ctx = await authenticateAgentRequest(req)
    rateLimitOrThrow(ctx.tokenId ?? ctx.userId)
    const server = createMarcadoresMcpServer(ctx, req)
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    await server.connect(transport)
    return await transport.handleRequest(req)
  } catch (error) {
    return jsonError(error)
  }
}

export async function GET(req: Request) {
  return handleMcp(req)
}

export async function POST(req: Request) {
  return handleMcp(req)
}

export async function DELETE(req: Request) {
  return handleMcp(req)
}
