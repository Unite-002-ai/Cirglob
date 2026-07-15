import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  FOUNDER_PROFILE_SECTION_ORDER,
  type FounderProfileSection,
} from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — FOUNDER PROFILE SECTIONS SERVICE
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-only persistence for founder profile section content
 * — Identity, Responsibilities & Commitment, Background, and
 * Accomplishments — stored as a single JSONB `data` column on
 * `founder_profiles`, keyed by FounderProfileSection.
 *
 * This is the ONLY durable, cross-device store for founder
 * profile answers. Client-side local storage
 * (see founder-profile-cache.ts) is a same-session recovery
 * buffer only: every page load re-fetches from here so a
 * founder sees the same profile regardless of device, browser,
 * or sign-in session.
 *
 * SECURITY CONTRACT
 * -----------------
 * Callers MUST pass the SESSION-scoped Supabase client, never
 * the service-role client:
 *   - founder_profiles RLS scopes every row by profile_id = auth.uid()
 *   - founder_profile_merge_sections() is SECURITY DEFINER but
 *     independently re-checks p_profile_id = auth.uid() inside
 *     the function body, so it MUST be called with a request
 *     that still carries the founder's own auth context.
 * A database trigger (prevent_founder_profiles_mutation)
 * independently blocks writes once the associated application
 * is no longer DRAFT, so a submitted founder profile can never
 * be altered through this module even if a caller's own checks
 * are bypassed.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Auth/session logic
 * - Permission checks beyond what RLS/the RPC enforce
 * - Schema validation (callers validate shape/size before
 *   calling the merge helper here; this module writes whatever
 *   it is given)
 * - Route logic
 * =========================================================
 */

const FOUNDER_PROFILES_TABLE = "founder_profiles";
const MERGE_SECTIONS_RPC = "founder_profile_merge_sections";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isLockedMutationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code =
    "code" in error && typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  const message =
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message.toLowerCase()
      : "";

  return (
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("locked") ||
    message.includes("draft")
  );
}

function isNotFoundMergeError(error: unknown): boolean {
  return getErrorMessage(error).toLowerCase().includes("founder_profile_not_found");
}

function isForbiddenMergeError(error: unknown): boolean {
  return getErrorMessage(error).toLowerCase().includes("forbidden");
}

/**
 * Resolves the internal application UUID that a founder's own
 * founder_profiles row is attached to.
 *
 * Founder profiles are 1:1 per profile per canonical application
 * (unique constraint on (application_id, profile_id)), so a
 * profile_id lookup alone is sufficient.
 *
 * Safe to call with the session client: RLS grants read access
 * via "Users can read own founder profile" (profile_id = auth.uid()).
 */
export async function getFounderProfileApplicationId(
  supabase: SupabaseClient,
  profileId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from(FOUNDER_PROFILES_TABLE)
    .select("application_id")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to resolve founder profile application: ${getErrorMessage(error)}`,
    );
  }

  return typeof data?.application_id === "string" ? data.application_id : null;
}

/**
 * Loads the persisted founder profile sections for a profile,
 * keyed by FounderProfileSection.
 *
 * Safe to call with the session client: RLS grants read access
 * to the profile's own founder profile row.
 */
export async function getFounderProfileSections(
  supabase: SupabaseClient,
  profileId: string,
): Promise<Partial<Record<FounderProfileSection, unknown>>> {
  const { data, error } = await supabase
    .from(FOUNDER_PROFILES_TABLE)
    .select("data")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load founder profile sections: ${getErrorMessage(error)}`,
    );
  }

  const raw = data?.data;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const result: Partial<Record<FounderProfileSection, unknown>> = {};

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (section in raw) {
      result[section] = (raw as Record<string, unknown>)[section];
    }
  }

  return result;
}

export type MergeFounderProfileSectionsInput = {
  applicationId: string;
  profileId: string;
  sections: Partial<Record<FounderProfileSection, unknown>>;
};

/**
 * Atomically merges a partial set of sections into the founder
 * profile's JSONB `data` column via the founder_profile_merge_sections
 * RPC, so a concurrent save from another tab/device can never
 * silently clobber sections it didn't touch.
 *
 * Throws:
 *   "FOUNDER_PROFILE_LOCKED" — application is no longer draft
 *   "FOUNDER_PROFILE_NOT_FOUND" — no matching row for the pair
 *   "FORBIDDEN" — profile_id did not match the authenticated user
 *
 * MUST be called with the session client so the RPC's internal
 * auth.uid() check resolves to the requesting founder, not null.
 */
export async function mergeFounderProfileSections(
  supabase: SupabaseClient,
  input: MergeFounderProfileSectionsInput,
): Promise<void> {
  const payload: Record<string, unknown> = {};

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (section in input.sections) {
      payload[section] = input.sections[section];
    }
  }

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.rpc(MERGE_SECTIONS_RPC, {
    p_application_id: input.applicationId,
    p_profile_id: input.profileId,
    p_sections: payload,
  });

  if (error) {
    if (isLockedMutationError(error)) {
      throw new Error("FOUNDER_PROFILE_LOCKED");
    }

    if (isNotFoundMergeError(error)) {
      throw new Error("FOUNDER_PROFILE_NOT_FOUND");
    }

    if (isForbiddenMergeError(error)) {
      throw new Error("FORBIDDEN");
    }

    throw new Error(
      `Failed to save founder profile sections: ${getErrorMessage(error)}`,
    );
  }
}