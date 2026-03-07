import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const dashboardPaths = ["/marcadores", "/atajos", "/perfil"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
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
  return response;
}

export const config = {
  matcher: ["/", "/marcadores", "/marcadores/:path*", "/atajos", "/perfil"],
};
