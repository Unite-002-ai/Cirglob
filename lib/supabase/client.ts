"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { PROFILE } from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — SUPABASE BROWSER CLIENT
 * =========================================================
 *
 * PURPOSE
 * -------
 * Browser-side Supabase client for:
 *
 * - Client Components
 * - Browser auth state
 * - Client-side session access
 * - Realtime subscriptions
 *
 * RESPONSIBILITIES
 * ----------------
 * - Browser client singleton
 * - PKCE auth configuration
 * - Session persistence
 * - Token auto-refresh
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Profile fetching
 * - Account hydration
 * - Route protection
 * - Redirect logic
 * - Business auth logic
 *
 * Those belong in:
 *
 * - /lib/auth.ts
 * - /lib/account-user.ts
 * - /providers/account-provider.tsx
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
 * SHARED BROWSER CLIENT CONFIG
 * =========================================================
 *
 * Keep this object narrow and stable so future runtime files
 * can stay aligned with the same browser auth behavior.
 */
const SUPABASE_BROWSER_CLIENT_OPTIONS = {
  auth: {
    flowType: "pkce" as const,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "x-application-name": "cirglob-web",
    },
  },
} as const;

/**
 * =========================================================
 * SINGLETON CLIENT
 * =========================================================
 */

let client: SupabaseClient | undefined;

/**
 * =========================================================
 * CREATE / GET CLIENT
 * =========================================================
 */

export function getSupabaseClient(): SupabaseClient {
  if (client) {
    return client;
  }

  client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    SUPABASE_BROWSER_CLIENT_OPTIONS,
  );

  return client;
}

/**
 * =========================================================
 * BACKWARD-COMPAT EXPORT
 * =========================================================
 */

export const createClient = getSupabaseClient;

/**
 * =========================================================
 * SESSION ACCESS
 * =========================================================
 */

export async function getBrowserSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "[Cirglob Auth] Failed to retrieve browser session:",
      error.message,
    );

    return null;
  }

  return session;
}

/**
 * =========================================================
 * AUTH STATE SUBSCRIPTION
 * =========================================================
 */

export function onBrowserAuthStateChange(
  callback: (event: string, session: Session | null) => void,
) {
  const supabase = getSupabaseClient();

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * =========================================================
 * SIGN OUT
 * =========================================================
 */

export async function browserSignOut(): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Cirglob Auth] Browser sign out failed:", error.message);
    throw error;
  }

  return true;
}

/**
 * =========================================================
 * CONNECTION HEALTH CHECK
 * =========================================================
 *
 * Uses a lightweight read against the shared profiles table to
 * confirm the browser client is usable under the current auth/RLS
 * context without pulling unnecessary data.
 */
export async function verifyBrowserSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from(PROFILE.TABLE)
      .select("id")
      .limit(1);

    if (error) {
      console.error(
        "[Cirglob Supabase] Browser connection verification failed:",
        error.message,
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[Cirglob Supabase] Unexpected browser connection failure:",
      getErrorMessage(error),
    );

    return false;
  }
}

export default getSupabaseClient;