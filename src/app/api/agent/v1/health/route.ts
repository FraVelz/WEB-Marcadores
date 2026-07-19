import { isAgentBackendConfigured } from "@/lib/supabase/admin"

export async function GET() {
  return Response.json({
    ok: true,
    agentConfigured: isAgentBackendConfigured(),
  })
}
