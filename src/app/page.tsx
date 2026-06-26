import { Suspense } from "react"
import { cookies } from "next/headers"

import { LoginPage } from "@/features/login/LoginPage"
import { generateHomeMetadata } from "@/lib/generatePageMetadata"
import { cookieHeaderFromRequestCookies, isDemoMode } from "@/lib/demo-data"

export const generateMetadata = generateHomeMetadata

export default async function Page() {
  const cookieStore = await cookies()
  const demo = isDemoMode(cookieHeaderFromRequestCookies(cookieStore))

  return (
    <Suspense fallback={null}>
      <LoginPage demo={demo} />
    </Suspense>
  )
}
