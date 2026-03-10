import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const dashboardPaths = ["/marcadores", "/atajos", "/perfil"];

function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url === "" || key === "";
}

export async function middleware(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.next({ request });
  }
  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              response.cookies.set(name, value)
            );
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    const isDashboard = dashboardPaths.some((p) => request.nextUrl.pathname.startsWith(p));

    if (user && request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/marcadores", request.url));
    }
    if (!user && isDashboard) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    // NetworkError o fallo de conexión: permitir acceso (modo demo implícito)
    // Evita que el middleware bloquee la app si Supabase no responde
  }
  return response;
}

export const config = {
  matcher: ["/", "/demo", "/marcadores", "/marcadores/:path*", "/atajos", "/perfil"],
};
