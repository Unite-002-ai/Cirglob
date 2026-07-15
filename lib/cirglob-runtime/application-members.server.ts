import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";


/**
 * =========================================================
 * CIRGLOB — APPLICATION MEMBERS SERVICE
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-only membership workflow service for the cofounder
 * member system.
 *
 * RESPONSIBILITIES
 * ----------------
 * - Listing members for the Founders section
 * - Finding members by ID (for removal)
 * - Creating CO_FOUNDER memberships on invitation acceptance
 * - Removing members (OWNER-only action)
 * - Writing MEMBER_REMOVED and MEMBER_JOINED activity
 *
 * SECURITY CONTRACT
 * -----------------
 * - No DELETE RLS policy exists on application_members.
 *   All deletions MUST use the service-role client.
 * - No INSERT RLS policy exists for the invite acceptance flow
 *   (the new member is not yet a member when they accept).
 *   Membership creation MUST use the service-role client.
 * - Read operations for current members may use the session
 *   client (RLS: "Members can read memberships").
 * - OWNER removal is always rejected at this layer.
 * - Cross-application mutations are always rejected.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Auth/session logic
 * - Route logic
 * - Invitation token logic
 * - UI concerns
 * =========================================================
 */

const APPLICATION_MEMBERS_TABLE = "application_members";
const PROFILES_TABLE = "profiles";

export type MemberRow = {
  id: string;
  application_id: string;
  profile_id: string;
  role: string;
  invited_by: string | null;
  joined_at: string;
  created_at: string;
};

export type MemberProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type MemberWithProfile = MemberRow & {
  profiles: MemberProfile | null;
};

/**
 * Shape returned by the Supabase generic client for joined rows.
 * The client always types related tables as arrays regardless of
 * cardinality. At runtime, profiles is always an array of 0 or 1.
 * The list helper normalises this to MemberProfile | null.
 */
type RawMemberWithProfile = Omit<MemberWithProfile, "profiles"> & {
  profiles: MemberProfile[] | MemberProfile | null;
};


function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

// =========================================================
// MEMBER LIST
// =========================================================

/**
 * Returns all members for an application, with profile details.
 *
 * Safe to call with the session client because members can read
 * the member list via RLS.
 */
export async function listApplicationMembers(
  supabase: SupabaseClient,
  applicationRecordId: string,
): Promise<MemberWithProfile[]> {
  const { data: memberRows, error: membersError } = await supabase
    .from(APPLICATION_MEMBERS_TABLE)
    .select(
      "id, application_id, profile_id, role, invited_by, joined_at, created_at",
    )
    .eq("application_id", applicationRecordId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new Error(
      `Failed to list application members: ${getErrorMessage(membersError)}`,
    );
  }

  const rows = (memberRows ?? []) as MemberRow[];

  const profileIds = Array.from(
    new Set(
      rows
        .map((row) => row.profile_id)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    ),
  );

  const profilesById = new Map<string, MemberProfile>();

  if (profileIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from(PROFILES_TABLE)
      .select("id, email, first_name, last_name, full_name, avatar_url")
      .in("id", profileIds);

    if (profilesError) {
      throw new Error(
        `Failed to load member profiles: ${getErrorMessage(profilesError)}`,
      );
    }

    for (const profile of (profileRows ?? []) as MemberProfile[]) {
      profilesById.set(profile.id, profile);
    }
  }

  return rows.map((row) => {
    const profile = profilesById.get(row.profile_id) ?? null;

    return {
      ...row,
      profiles: profile,
    };
  });
}

// =========================================================
// MEMBER LOOKUP
// =========================================================

/**
 * Finds a single member row by its primary key.
 *
 * Returns null if the row does not exist.
 *
 * MUST be called with the service-role client when used in
 * removal flows to ensure consistent reads.
 */
export async function findMemberById(
  serviceSupabase: SupabaseClient,
  memberId: string,
): Promise<MemberRow | null> {
  const { data, error } = await serviceSupabase
    .from(APPLICATION_MEMBERS_TABLE)
    .select(
      "id, application_id, profile_id, role, invited_by, joined_at, created_at",
    )
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data) return null;

  return data as MemberRow;
}

// =========================================================
// MEMBER REMOVAL
// =========================================================

/**
 * Removes a cofounder membership row by its primary key.
 *
 * Enforces:
 * - The member must exist.
 * - The member must belong to the specified application.
 * - The member must NOT be an OWNER.
 *
 * After deletion, writes a MEMBER_REMOVED activity record.
 *
 * Delegated entirely to the remove_application_member_by_id
 * security-definer RPC, which holds a row-level lock on the
 * member row, enforces all guards, deletes, and writes activity
 * in a single atomic transaction.
 *
 * MUST be called with the service-role client.
 */

export async function removeApplicationMemberById(
  serviceSupabase: SupabaseClient,
  input: {
    memberId: string;
    applicationRecordId: string;
    actorId: string;
  },
): Promise<void> {
  const { error, data } = await serviceSupabase.rpc(
    "remove_application_member_by_id",
    {
      p_member_id: input.memberId,
      p_application_record_id: input.applicationRecordId,
      p_actor_id: input.actorId,
    },
  );

  if (error) {
    const message = getErrorMessage(error);

    if (message.includes("MEMBER_NOT_FOUND")) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    if (message.includes("MEMBER_APPLICATION_MISMATCH")) {
      throw new Error("MEMBER_APPLICATION_MISMATCH");
    }

    if (message.includes("CANNOT_REMOVE_OWNER")) {
      throw new Error("CANNOT_REMOVE_OWNER");
    }

    throw new Error(`Failed to remove member: ${message}`);
  }

  if (!data) {
    throw new Error("Failed to remove member: invalid RPC response.");
  }
} 