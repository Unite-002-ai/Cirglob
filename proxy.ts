import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import { AUTH } from "@/lib/constants";
import {
  AUTH_ROUTES,
  APP_ROUTES,
  isAuthRoute,
  isProtectedRoute,
  resolveSafeRedirect,
} from "@/lib/auth";

/**
 * =========================================================
 * CIRGLOB ROOT PROXY
 * =========================================================
 *
 * Production-grade authentication proxy.
 *
 * Responsibilities:
 * - Session synchronization
 * - Protected route gating
 * - Auth redirect flow
 * - SSR-safe auth propagation
 * - Prevent redirect loops
 *
 * IMPORTANT:
 * - No business logic
 * - No role logic
 * - No onboarding logic
 * - No founder logic
 *
 * This proxy ONLY handles:
 * authentication infrastructure
 * route access control
 * session continuity
 * =========================================================
 */

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Cirglob Proxy] Missing required environment variable: ${name}`,
    );
  }

  return value;
}

const supabaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

const supabaseAnonKey = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

function buildSigninRedirect(request: NextRequest): URL {
  const redirectUrl = new URL(AUTH_ROUTES.signin, request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;

  redirectUrl.searchParams.set(
    AUTH.NEXT_QUERY_PARAM,
    resolveSafeRedirect(next, APP_ROUTES.dashboard),
  );

  return redirectUrl;
}

function buildAuthenticatedRedirect(request: NextRequest): URL {
  const next = resolveSafeRedirect(
    request.nextUrl.searchParams.get(AUTH.NEXT_QUERY_PARAM),
    APP_ROUTES.dashboard,
  );

  return new URL(next, request.url);
}

function copyResponseCookies(
  source: NextResponse,
  destination: NextResponse,
): void {
  try {
    source.cookies.getAll().forEach((cookie) => {
      destination.cookies.set(cookie);
    });
  } catch {
    // Non-fatal.
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({
            name,
            value,
            ...(options as CookieOptions),
          });
        });
      },
    },
  });

  /**
   * Critical:
   * Always call getUser() so Supabase can refresh and validate
   * the session properly.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const redirectResponse = NextResponse.redirect(buildSigninRedirect(request));
    copyResponseCookies(response, redirectResponse);
    redirectResponse.headers.set("x-cirglob-auth-proxy", "redirected");
    return redirectResponse;
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    const redirectResponse = NextResponse.redirect(
      buildAuthenticatedRedirect(request),
    );
    copyResponseCookies(response, redirectResponse);
    redirectResponse.headers.set("x-cirglob-auth-proxy", "redirected");
    return redirectResponse;
  }

  response.headers.set("x-cirglob-auth-proxy", "active");
  return response;
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/apply/dashboard/:path*",
    "/apply/application/:path*",
    "/apply/profile/:path*",
    "/account/:path*",
  ],
};