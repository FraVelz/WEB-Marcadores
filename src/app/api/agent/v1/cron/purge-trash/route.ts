import { purgeExpiredTrash } from "@/lib/agent/trash"
import { isAgentBackendConfigured } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json({ error: { code: "not_configured", message: "CRON_SECRET not set" } }, { status: 503 })
  }
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: { code: "unauthorized", message: "Invalid cron secret" } }, { status: 401 })
  }
  if (!isAgentBackendConfigured()) {
    return Response.json(
      { error: { code: "not_configured", message: "Agent backend not configured" } },
      { status: 503 }
    )
  }
  const result = await purgeExpiredTrash()
  return Response.json({ ok: true, ...result })
}

export async function GET(req: Request) {
  return POST(req)
}
