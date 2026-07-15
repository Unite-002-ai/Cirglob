import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * =========================================================
 * CIRGLOB — SUPABASE SERVICE ROLE SERVER CLIENT
 * =========================================================
 *
 * PURPOSE
 * -------
 * Privileged Supabase client for server-only operations that
 * bypass Row Level Security.
 *
 * RESPONSIBILITIES
 * ----------------
 * - Invitation acceptance writes (actor not yet a member)
 * - Member removal (no RLS DELETE policy exists)
 * - Activity log writes (no RLS INSERT policy for non-members)
 * - Token lookups that cross ownership boundaries
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Session management
 * - Auth hydration
 * - Client-facing reads
 * - Anything that can be done with the anon/session client
 *
 * SECURITY CONTRACT
 * -----------------
 * This file MUST remain server-only.
 * SUPABASE_SERVICE_ROLE_KEY MUST NOT be used in browser code.
 * All callers MUST enforce their own authorization before
 * calling helpers that use this client.
 * =========================================================
 */

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Cirglob Supabase Service] Missing required environment variable: ${name}`,
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

const supabaseServiceRoleKey = requireEnv(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  "SUPABASE_SERVICE_ROLE_KEY",
);

const SUPABASE_SERVICE_CLIENT_OPTIONS = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
} as const;

/**
 * Creates a new service-role Supabase client.
 *
 * Do NOT cache or share this instance across requests.
 * Each privileged operation should create its own instance
 * so there is no cross-request state leakage.
 */
export function createServerSupabaseServiceClient(): SupabaseClient {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    SUPABASE_SERVICE_CLIENT_OPTIONS,
  );
}

/**
 * Lightweight connectivity check for the service-role client.
 * Useful in health checks and deployment smoke tests.
 */
export async function verifyServiceClientConnection(): Promise<boolean> {
  try {
    const supabase = createServerSupabaseServiceClient();

    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error(
        "[Cirglob Supabase Service] Connection verification failed:",
        error.message,
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[Cirglob Supabase Service] Unexpected connection failure:",
      getErrorMessage(error),
    );

    return false;
  }
}