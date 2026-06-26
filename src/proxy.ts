import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { DEMO_SESSION_COOKIE } from "@/lib/demo-data"
import { isMetadataAssetPath, isMetadataCrawler } from "@/lib/metadata"

const dashboardPaths = ["/marcadores", "/atajos", "/perfil", "/estadisticas"]

function isEnvDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !url || !key || url === "" || key === ""
}

function clearDemoSessionCookie(response: NextResponse): void {
  response.cookies.set(DEMO_SESSION_COOKIE, "", { path: "/", maxAge: 0 })
}

function hasDemoSessionCookie(request: NextRequest): boolean {
  return request.cookies.get(DEMO_SESSION_COOKIE)?.value === "true"
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get("user-agent")

  // Previews sociales y rutas de imagen OG: no redirigir al login
  if (isMetadataAssetPath(pathname) || isMetadataCrawler(userAgent)) {
    return NextResponse.next({ request })
  }

  // Siempre permitir /demo: redirigir a marcadores con cookie para modo demo
  if (pathname === "/demo") {
    const res = NextResponse.redirect(new URL("/marcadores", request.url))
    res.cookies.set(DEMO_SESSION_COOKIE, "true", { path: "/", maxAge: 60 * 60 * 24 })
    return res
  }

  if (isEnvDemoMode()) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })
  const isDashboard = dashboardPaths.some((p) => pathname.startsWith(p))

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value))
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email_confirmed_at) {
      if (hasDemoSessionCookie(request)) {
        clearDemoSessionCookie(response)
      }

      if (pathname === "/") {
        return NextResponse.redirect(new URL("/marcadores", request.url))
      }

      return response
    }

    if (user && !user.email_confirmed_at && isDashboard) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/?verify=pending", request.url))
    }

    if (hasDemoSessionCookie(request)) {
      return NextResponse.next({ request })
    }

    if (!user && isDashboard) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } catch {
    if (hasDemoSessionCookie(request)) {
      return NextResponse.next({ request })
    }
  }

  return response
}

export const config = {
  matcher: ["/", "/demo", "/marcadores", "/marcadores/:path*", "/atajos", "/perfil", "/estadisticas"],
}
