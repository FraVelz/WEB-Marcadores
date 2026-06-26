import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { isMetadataAssetPath, isMetadataCrawler } from "@/lib/metadata"

const dashboardPaths = ["/marcadores", "/atajos", "/perfil", "/estadisticas"]

function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !url || !key || url === "" || key === ""
}

const DEMO_COOKIE = "demo_session"

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
    res.cookies.set(DEMO_COOKIE, "true", { path: "/", maxAge: 60 * 60 * 24 })
    return res
  }

  if (isDemoMode()) {
    return NextResponse.next({ request })
  }

  // Si hay cookie demo_session, permitir acceso al dashboard sin auth
  if (request.cookies.get(DEMO_COOKIE)?.value === "true") {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

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

    const isDashboard = dashboardPaths.some((p) => request.nextUrl.pathname.startsWith(p))

    if (user && !user.email_confirmed_at && isDashboard) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/?verify=pending", request.url))
    }

    if (user && user.email_confirmed_at && request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/marcadores", request.url))
    }

    if (!user && isDashboard) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } catch {
    // NetworkError o fallo de conexión: permitir acceso (modo demo implícito)
    // Evita que el proxy bloquee la app si Supabase no responde
  }

  return response
}

export const config = {
  matcher: ["/", "/demo", "/marcadores", "/marcadores/:path*", "/atajos", "/perfil", "/estadisticas"],
}
