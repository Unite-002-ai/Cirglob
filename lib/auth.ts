import { createClient } from "@/lib/supabase/server";

/**
 * =========================================================
 * CIRGLOB AUTH CORE (SERVER-ONLY)
 * =========================================================
 * Central identity + access control layer
 * Used across:
 * - dashboards
 * - careers apply system
 * - admin panel
 * - investor portal
 */

/**
 * =========================================================
 * TYPES (MATCHES DATABASE SCHEMA)
 * =========================================================
 */

export type UserRole = "FOUNDER" | "INVESTOR" | "ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * =========================================================
 * GET CURRENT USER (RAW SUPABASE USER)
 * =========================================================
 */

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}

/**
 * =========================================================
 * GET USER PROFILE (CORE FUNCTION)
 * =========================================================
 */

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return data as UserProfile;
}

/**
 * =========================================================
 * REQUIRE AUTH (PROTECTED ROUTES)
 * =========================================================
 */

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}

/**
 * =========================================================
 * REQUIRE ROLE (RBAC SYSTEM)
 * =========================================================
 */

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getProfile();

  if (!profile) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error("UNAUTHORIZED");
  }

  return profile;
}

/**
 * =========================================================
 * ROLE HELPERS (CLEAN API)
 * =========================================================
 */

export async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "ADMIN";
}

export async function isInvestor() {
  const profile = await getProfile();
  return profile?.role === "INVESTOR";
}

export async function isFounder() {
  const profile = await getProfile();
  return profile?.role === "FOUNDER";
}

/**
 * =========================================================
 * SAFE USER CONTEXT (MOST USED FUNCTION)
 * =========================================================
 * Use this everywhere in UI logic
 */

export async function getUserContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      role: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile: profile as UserProfile | null,
    role: profile?.role ?? null,
  };
}

/**
 * =========================================================
 * ACCESS CONTROL SHORTCUTS
 * =========================================================
 */

export async function requireAdmin() {
  const profile = await requireRole(["ADMIN"]);
  return profile;
}

export async function requireInvestorOrAdmin() {
  const profile = await requireRole(["INVESTOR", "ADMIN"]);
  return profile;
}

export async function requireFounderOrAdmin() {
  const profile = await requireRole(["FOUNDER", "ADMIN"]);
  return profile;
}

/**
 * =========================================================
 * ERROR NORMALIZER (PRODUCTION SAFETY)
 * =========================================================
 */

export function authErrorMessage(error: unknown) {
  if (!error) return "Unknown error";

  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHENTICATED":
        return "You must be signed in.";
      case "UNAUTHORIZED":
        return "You do not have permission to access this resource.";
      default:
        return error.message;
    }
  }

  return "Unexpected authentication error";
}