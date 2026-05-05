import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);

  // Supabase sends these in auth redirects
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/founder/dashboard";

  try {
    const supabase = await createServerSupabaseClient();

    /**
     * STEP 1: Exchange auth code for session
     * This is REQUIRED for Supabase email/OAuth flows
     */
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error.message);
        return NextResponse.redirect(
          new URL("/auth/signin?error=callback_failed", requestUrl.origin)
        );
      }
    }

    /**
     * STEP 2: Verify user exists after session exchange
     */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=no_session", requestUrl.origin)
      );
    }

    /**
     * STEP 3: Redirect to intended destination
     * Default: founder dashboard (your system core)
     */
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (err) {
    console.error("Callback route fatal error:", err);

    return NextResponse.redirect(
      new URL("/auth/signin?error=unexpected", requestUrl.origin)
    );
  }
}