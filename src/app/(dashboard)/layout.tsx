export const dynamic = "force-dynamic"

import { cookies } from "next/headers"

import { DashboardShell } from "@/layouts"
import { DashboardProvider } from "@/contexts/DashboardContext"

import { resolveDashboardDemoMode } from "@/lib/resolve-dashboard-demo-mode"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoMode = await resolveDashboardDemoMode(cookieStore)

  return (
    <DashboardProvider demoMode={demoMode}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
