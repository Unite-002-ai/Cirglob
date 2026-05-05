import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          req.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request: req,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isFounderRoute = pathname.startsWith("/founder");
  const isApplyRoute = pathname.startsWith("/apply");

  if (!user && (isFounderRoute || isApplyRoute)) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/founder/dashboard", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/founder/:path*", "/apply/:path*", "/auth/:path*"],
};