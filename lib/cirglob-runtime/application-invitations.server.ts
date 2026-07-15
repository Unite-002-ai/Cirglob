import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { INVITATION, ROUTES } from "@/lib/constants";
import {
  generateInvitationToken,
  hashInvitationToken,
  normalizeRawInvitationToken,
} from "./invitation-token.server";

/**
 * =========================================================
 * CIRGLOB — APPLICATION INVITATIONS SERVICE
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-only invitation workflow service for the cofounder
 * invitation system.
 *
 * RESPONSIBILITIES
 * ----------------
 * - Creating and rotating invitations
 * - Token lookup and validation
 * - Marking invitations as accepted
 * - Listing active invitations for the workspace UI
 * - Deriving application record IDs from public IDs
 *
 * SECURITY CONTRACT
 * -----------------
 * - Raw tokens are NEVER stored. Only SHA-256 hashes are.
 * - The raw token is returned once on creation, embedded in
 *   the email link, and never persisted anywhere.
 * - Privileged writes (insert, update) use the service client.
 * - Read operations for authenticated owners may use the
 *   session client (RLS: "Owners can read invitations").
 * - All callers MUST enforce permissions before calling helpers
 *   in this module.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Auth/session logic
 * - Route logic
 * - UI concerns
 * - Email sending (handled in lib/email/)
 * =========================================================
 */

const APPLICATION_INVITATIONS_TABLE = "application_invitations";
const APPLICATIONS_TABLE = "applications";

export type InvitationRow = {
  id: string;
  application_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ActiveInvitationSummary = Pick<
  InvitationRow,
  "id" | "email" | "role" | "expires_at" | "accepted_at" | "created_at"
>;

export type CreateInvitationInput = {
  applicationRecordId: string;
  email: string;
  invitedByUserId: string;
};

export type CreateInvitationResult = {
  invitationId: string;
  rawToken: string;
  email: string;
  expiresAt: Date;
  isNew: boolean;
};

export type FindInvitationResult = {
  invitation: InvitationRow;
  applicationPublicId: string;
  applicationRecordId: string;
};

// =========================================================
// INTERNAL HELPERS
// =========================================================

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function computeExpiresAt(): Date {
  const at = new Date();
  at.setHours(at.getHours() + INVITATION.EXPIRATION_HOURS);
  return at;
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

// =========================================================
// APPLICATION RECORD LOOKUP
// =========================================================

/**
 * Resolves the internal application UUID from its public ID.
 *
 * Used by route handlers that only have access to the public
 * ID from the workspace snapshot.
 */
export async function getApplicationRecordIdByPublicId(
  supabase: SupabaseClient,
  publicId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from(APPLICATIONS_TABLE)
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  return code === "23505";
}

/**
 * Creates a new invitation.
 *
 * Hard guarantee:
 * - one active invitation per application/email pair
 * - no token rotation
 * - raw token returned only on successful creation
 *
 * The partial unique index on
 * (application_id, lower(email)) where accepted_at is null
 * is the final authority. This function simply respects it.
 */
export async function createApplicationInvitation(
  serviceSupabase: SupabaseClient,
  input: CreateInvitationInput,
): Promise<CreateInvitationResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const expiresAt = computeExpiresAt();
  const rawToken = generateInvitationToken();
  const tokenHash = hashInvitationToken(rawToken);

  const { data, error } = await serviceSupabase
    .from(APPLICATION_INVITATIONS_TABLE)
    .insert({
      application_id: input.applicationRecordId,
      email: normalizedEmail,
      role: "CO_FOUNDER",
      token: tokenHash,
      invited_by: input.invitedByUserId,
      expires_at: expiresAt.toISOString(),
      accepted_at: null,
    })
    .select("id, email")
    .single();

  if (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("INVITATION_ALREADY_SENT");
    }

    throw new Error(
      `Failed to create invitation: ${getErrorMessage(error)}`,
    );
  }

  const invitationId = typeof data?.id === "string" ? data.id : null;
  const email = typeof data?.email === "string" ? data.email : null;

  if (!invitationId || !email) {
    throw new Error("Failed to create invitation: invalid insert response.");
  }

  return {
    invitationId,
    rawToken,
    email,
    expiresAt,
    isNew: true,
  };
}

//================================================================
//=========== Remove Application Invitation By Id ================
//================================================================
export async function removeApplicationInvitationById(
  serviceSupabase: SupabaseClient,
  input: {
    invitationId: string;
    applicationRecordId: string;
  },
): Promise<void> {
  const { data, error } = await serviceSupabase
    .from(APPLICATION_INVITATIONS_TABLE)
    .delete()
    .eq("id", input.invitationId)
    .eq("application_id", input.applicationRecordId)
    .is("accepted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to remove invitation: ${getErrorMessage(error)}`,
    );
  }

  if (!data?.id) {
    throw new Error("INVITATION_NOT_FOUND");
  }
}


// ====================================================
// INVITATION LANDING URL
// ==================================================== 
export function buildInvitationLandingUrl(
  siteUrl: string,
  applicationPublicId: string,
  rawToken: string,
): string {
  return `${siteUrl}${ROUTES.APPLY_APPLICATION}/${encodeURIComponent(
    applicationPublicId,
  )}?invite=${encodeURIComponent(rawToken)}`;
}
// =========================================================
// INVITATION LOOKUP
// =========================================================

/**
 * Finds an invitation by its raw token.
 *
 * Hashes the token before querying so the raw value is never
 * compared to stored data. Returns null if no matching row exists.
 *
 * MUST be called with the service-role client because the
 * caller may not yet be an application member.
 */
export async function findInvitationByRawToken(
  serviceSupabase: SupabaseClient,
  rawToken: string,
): Promise<FindInvitationResult | null> {
  const tokenHash = hashInvitationToken(normalizeRawInvitationToken(rawToken));

  const { data: invitation, error: inviteError } = await serviceSupabase
    .from(APPLICATION_INVITATIONS_TABLE)
    .select(
      "id, application_id, email, role, token, invited_by, expires_at, accepted_at, created_at, updated_at",
    )
    .eq("token", tokenHash)
    .maybeSingle();

  if (inviteError || !invitation) return null;

  const { data: application, error: appError } = await serviceSupabase
    .from(APPLICATIONS_TABLE)
    .select("id, public_id")
    .eq("id", invitation.application_id)
    .maybeSingle();

  if (appError || !application?.public_id) return null;

  return {
    invitation: invitation as InvitationRow,
    applicationPublicId: application.public_id as string,
    applicationRecordId: application.id as string,
  };
}

// =========================================================
// INVITATION STATE GUARDS
// =========================================================

export function isInvitationExpired(invitation: InvitationRow): boolean {
  return new Date(invitation.expires_at) <= new Date();
}

export function isInvitationAccepted(invitation: InvitationRow): boolean {
  return invitation.accepted_at !== null;
}

export function isInvitationValid(invitation: InvitationRow): boolean {
  return !isInvitationExpired(invitation) && !isInvitationAccepted(invitation);
}

// =========================================================
// INVITATION ACCEPTANCE
// =========================================================

export type AcceptInvitationResult = {
  memberId: string;
  isNew: boolean;
  alreadyAccepted: boolean;
  applicationPublicId: string;
};

export class AcceptInvitationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AcceptInvitationError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Accepts an invitation in a single encapsulated flow.
 *
 * Order: token lookup → expiry check → email match → membership
 * creation (idempotent) → mark accepted → activity writes.
 *
 * Designed for maximum recoverability on partial failure:
 * - Membership creation is idempotent (safe to retry without side effects).
 * - markInvitationAccepted is an UPDATE so a retry after a prior
 *   success applies to zero rows and is silent.
 * - Activity writes are best-effort and never block the result.
 *
 * Throws `AcceptInvitationError` for all expected failure cases.
 * Callers map `error.code` to HTTP status codes.
 *
 * MUST be called with the service-role client.
 */
export async function acceptApplicationInvitation(
  serviceSupabase: SupabaseClient,
  input: {
    rawToken: string;
    profileId: string;
    userEmail: string;
  },
): Promise<AcceptInvitationResult> {
  const { data, error } = await serviceSupabase.rpc(
    "accept_application_invitation",
    {
      p_raw_token: input.rawToken,
      p_profile_id: input.profileId,
      p_user_email: input.userEmail,
    },
  );

  if (error) {
    const message = getErrorMessage(error);

    if (message.includes("NOT_FOUND")) {
      throw new AcceptInvitationError("NOT_FOUND", "Invitation not found.");
    }

    if (message.includes("EXPIRED")) {
      throw new AcceptInvitationError("EXPIRED", "Invitation has expired.");
    }

    if (message.includes("EMAIL_MISMATCH")) {
      throw new AcceptInvitationError(
        "EMAIL_MISMATCH",
        "Authenticated email does not match the invitation.",
      );
    }

    throw new AcceptInvitationError("ACCEPTANCE_FAILED", message);
  }

  const payload = Array.isArray(data) ? data[0] ?? null : data;

  const memberId = typeof payload?.memberId === "string" ? payload.memberId : null;
  const isNew = typeof payload?.isNew === "boolean" ? payload.isNew : null;
  const alreadyAccepted =
    typeof payload?.alreadyAccepted === "boolean"
      ? payload.alreadyAccepted
      : null;
  const applicationPublicId =
    typeof payload?.applicationPublicId === "string"
      ? payload.applicationPublicId
      : null;

  if (
    !memberId ||
    isNew === null ||
    alreadyAccepted === null ||
    !applicationPublicId
  ) {
    throw new Error("Failed to accept invitation: invalid RPC response.");
  }

  return {
    memberId,
    isNew,
    alreadyAccepted,
    applicationPublicId,
  };
}
/**
 * Marks an invitation as accepted and updates the timestamp.
 *
 * This is idempotent: if the row is already accepted the UPDATE
 * silently applies to zero rows without error.
 *
 * Called internally by acceptApplicationInvitation. Kept exported
 * for future use by other server helpers that need granular control
 * over the acceptance lifecycle.
 *
 * MUST be called with the service-role client.
 */
export async function markInvitationAccepted(
  serviceSupabase: SupabaseClient,
  invitationId: string,
): Promise<void> {
  const { error } = await serviceSupabase
    .from(APPLICATION_INVITATIONS_TABLE)
    .update({
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitationId);

  if (error) {
    throw new Error(
      `Failed to mark invitation as accepted: ${getErrorMessage(error)}`,
    );
  }
}

// =========================================================
// INVITATION LIST
// =========================================================

/**
 * Returns active (non-expired, non-accepted) invitations for an
 * application.
 *
 * Safe to call with the session client because owners can read
 * their own invitations via RLS.
 */
export async function listActiveInvitations(
  supabase: SupabaseClient,
  applicationRecordId: string,
): Promise<ActiveInvitationSummary[]> {
  const { data, error } = await supabase
    .from(APPLICATION_INVITATIONS_TABLE)
    .select("id, email, role, expires_at, accepted_at, created_at")
    .eq("application_id", applicationRecordId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to list active invitations: ${getErrorMessage(error)}`,
    );
  }

  return (data ?? []) as ActiveInvitationSummary[];
}
