export const dynamic = "force-dynamic"

import { cookies } from "next/headers"

import { DashboardShell } from "@/layouts"
import { DashboardProvider } from "@/contexts/DashboardContext"

import { cookieHeaderFromRequestCookies, isDemoMode } from "@/lib/demo-data"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoMode = isDemoMode(cookieHeaderFromRequestCookies(cookieStore))

  return (
    <DashboardProvider demoMode={demoMode}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
