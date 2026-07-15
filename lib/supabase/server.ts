import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { PROFILE } from  "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — SUPABASE SERVER CLIENT
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-side Supabase client for:
 *
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * - SSR session validation
 *
 * RESPONSIBILITIES
 * ----------------
 * - Cookie synchronization
 * - Session persistence
 * - Secure SSR auth hydration
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Redirect logic
 * - Route protection
 * - Business auth logic
 * - Profile fetching
 *
 * Those belong in:
 *
 * - /lib/auth.ts
 * - /lib/account-user.ts
 * - /lib/middleware.ts
 *
 * =========================================================
 */

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Cirglob Supabase] Missing required environment variable: ${name}`,
    );
  }

  return value;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

const supabaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

const supabaseAnonKey = requireEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

/**
 * =========================================================
 * SHARED SERVER CLIENT CONFIG
 * =========================================================
 *
 * Keep this object narrow and stable so future runtime files
 * can stay aligned with the same server auth behavior.
 */
const SUPABASE_SERVER_CLIENT_OPTIONS = {
  auth: {
    flowType: "pkce" as const,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
} as const;

/**
 * =========================================================
 * CREATE SERVER CLIENT
 * =========================================================
 *
 * Next.js 15 treats cookies() as async. We resolve the cookie
 * store once and hand a stable adapter to Supabase.
 *
 * In read-only Server Component contexts, cookie writes can
 * fail by design. That is expected and safe to ignore here.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    ...SUPABASE_SERVER_CLIENT_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              path: options.path ?? "/",
            });
          });
        } catch {
          /**
           * Server Components cannot always write cookies.
           *
           * This is expected behavior in read-only contexts.
           *
           * Middleware should handle session refresh persistence.
           */
        }
      },
    },
  });
}

/**
 * =========================================================
 * SHARED SERVER INSTANCE HELPER
 * =========================================================
 */

export async function getServerSupabase(): Promise<SupabaseClient> {
  return createServerSupabaseClient();
}

/**
 * =========================================================
 * CONNECTION HEALTH CHECK
 * =========================================================
 *
 * Uses the shared profiles table constant so the schema name
 * stays centralized across the platform.
 */
export async function verifyServerSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from(PROFILE.TABLE)
      .select("id")
      .limit(1);

    if (error) {
      console.error(
        "[Cirglob Supabase] Server connection failed:",
        error.message,
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[Cirglob Supabase] Unexpected server connection failure:",
      getErrorMessage(error),
    );

    return false;
  }
}