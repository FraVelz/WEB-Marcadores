import { cookies } from "next/headers"

import { LoginPage } from "@/features/login/LoginPage"
import { cookieHeaderFromRequestCookies, isDemoMode } from "@/lib/demo-data"

export default async function Page() {
  const cookieStore = await cookies()
  const demo = isDemoMode(cookieHeaderFromRequestCookies(cookieStore))

  return <LoginPage demo={demo} />
}
