import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  AUTH_ERROR_REDIRECT,
  AUTH_ERROR_ROUTE,
  AUTH_SIGNIN_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
} from "@/lib/constants";

/**
 * AUTH CALLBACK LAYER (CRITICAL SYSTEM BOUNDARY)
 *
 * Responsibilities:
 * 1. Exchange OAuth / email code for session
 * 2. Establish Supabase Auth session (source of truth)
 * 3. Validate user existence
 * 4. Ensure identity layer is ready (profiles via DB triggers)
 * 5. Redirect into authenticated application boundary
 *
 * IMPORTANT ARCHITECTURE RULE:
 * - DO NOT create profiles here
 * - DO NOT create settings here
 * - DO NOT store session in frontend
 * - ONLY establish Supabase session + redirect
 */

function getSafeRedirectPath(next: string | null): string {
  if (!next) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  if (!next.startsWith("/")) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  if (
    next.startsWith("/auth/signin") ||
    next.startsWith("/auth/signup") ||
    next.startsWith("/auth/callback") ||
    next.startsWith("/auth/error")
  ) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }

  return next;
}

function redirectWithError(requestUrl: URL, errorCode: string): NextResponse {
  const url = new URL(AUTH_SIGNIN_ROUTE, requestUrl.origin);
  url.searchParams.set("error", errorCode);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  try {
    const supabase = await createServerSupabaseClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(
          "[AUTH_CALLBACK_EXCHANGE_ERROR]",
          error.message,
        );

        return redirectWithError(requestUrl, "auth_exchange_failed");
      }
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "[AUTH_CALLBACK_USER_ERROR]",
        userError?.message || "Missing authenticated user",
      );

      return redirectWithError(requestUrl, "missing_authenticated_user");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "[AUTH_CALLBACK_PROFILE_ERROR]",
        profileError?.message || "Profile missing",
      );

      return NextResponse.redirect(
        new URL(`${AUTH_ERROR_ROUTE}?reason=profile_missing`, requestUrl.origin),
      );
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error("[AUTH_CALLBACK_FATAL_ERROR]", error);

    return redirectWithError(requestUrl, AUTH_ERROR_REDIRECT);
  }
}