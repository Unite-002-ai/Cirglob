// lib/roles.ts

import { createClient } from "@/lib/supabase/server";

/**
 * These MUST match your Supabase enum: user_role
 * (as defined in Postgres)
 */
export type UserRole = "FOUNDER" | "INVESTOR" | "ADMIN";

/**
 * Safe role hierarchy (for permission checks)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  FOUNDER: 1,
  INVESTOR: 2,
  ADMIN: 3,
};

/**
 * Get the current authenticated user's role (SERVER SAFE)
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data?.role) return null;

  return data.role as UserRole;
}

/**
 * Get full profile (useful for dashboards)
 */
export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return data;
}

/**
 * Check if user has a minimum role level
 */
export function hasRole(
  userRole: UserRole | null,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Strict admin check
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === "ADMIN";
}

/**
 * Strict investor check
 */
export function isInvestor(role: UserRole | null): boolean {
  return role === "INVESTOR" || role === "ADMIN";
}

/**
 * Strict founder check
 */
export function isFounder(role: UserRole | null): boolean {
  return role === "FOUNDER" || isInvestor(role) || isAdmin(role);
}

/**
 * Route protection helper (SERVER COMPONENTS)
 */
export async function requireRole(required: UserRole) {
  const role = await getUserRole();

  if (!role) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!hasRole(role, required)) {
    throw new Error("FORBIDDEN");
  }

  return role;
}

/**
 * Dashboard routing helper
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "INVESTOR":
      return "/dashboard/investor";
    case "FOUNDER":
    default:
      return "/dashboard/founder";
  }
}

/**
 * Safe redirect decision logic (server-side usage)
 */
export async function getRedirectPathAfterLogin(): Promise<string> {
  const role = await getUserRole();

  if (!role) return "/auth/signin";

  return getDashboardRoute(role);
}