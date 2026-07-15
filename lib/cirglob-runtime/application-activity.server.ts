import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * =========================================================
 * CIRGLOB — APPLICATION ACTIVITY LOGGER
 * =========================================================
 *
 * PURPOSE
 * -------
 * Centralized server-only helper for writing to the
 * application_activity table.
 *
 * RESPONSIBILITIES
 * ----------------
 * - Writing activity records for all meaningful workspace events
 * - Enforcing the canonical set of activity type strings that
 *   match the database CHECK constraint
 *
 * SECURITY CONTRACT
 * -----------------
 * Callers MUST pass a service-role Supabase client because the
 * application_activity table has no INSERT RLS policy for
 * regular authenticated users.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Auth/session logic
 * - Permission checks
 * - Route logic
 * - UI concerns
 * =========================================================
 */

const APPLICATION_ACTIVITY_TABLE = "application_activity";

/**
 * Canonical activity type strings.
 *
 * These MUST match the CHECK constraint on application_activity.type.
 */
export const ACTIVITY_TYPES = {
  APPLICATION_CREATED: "APPLICATION_CREATED",
  SECTION_UPDATED: "SECTION_UPDATED",
  INVITATION_SENT: "INVITATION_SENT",
  INVITATION_ACCEPTED: "INVITATION_ACCEPTED",
  MEMBER_JOINED: "MEMBER_JOINED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  APPLICATION_WITHDRAWN: "APPLICATION_WITHDRAWN",
  APPLICATION_ARCHIVED: "APPLICATION_ARCHIVED",
  WORKSPACE_REUSED: "WORKSPACE_REUSED",
} as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

export type RecordActivityInput = {
  applicationId: string;
  actorId: string | null;
  type: ActivityType;
  metadata?: Record<string, unknown>;
};

/**
 * Writes a single activity record.
 *
 * Throws on failure. Callers that need best-effort activity
 * logging (e.g. provisioning) must wrap this in try/catch.
 * Callers inside RPC-backed flows do not call this directly —
 * activity is written inside the security-definer RPC as part
 * of the same transaction.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export async function recordApplicationActivity(
  serviceSupabase: SupabaseClient,
  input: RecordActivityInput,
): Promise<void> {
  const { error } = await serviceSupabase
    .from(APPLICATION_ACTIVITY_TABLE)
    .insert({
      application_id: input.applicationId,
      actor_id: input.actorId ?? null,
      type: input.type,
      metadata: input.metadata ?? {},
    });

  if (error) {
    throw new Error(
      `[Cirglob Activity] Failed to write activity record (type=${input.type}): ${getErrorMessage(error)}`,
    );
  }
}