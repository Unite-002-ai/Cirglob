import {
  APPLICATION_MEMBER_ROLES,
  APPLICATION_MEMBER_ROLE_VALUES,
  type ApplicationMemberRole,
  type ApplicationSection,
} from "./constants";
import {
  APPLICATION_SECTION_METADATA,
  isApplicationSection,
} from "./application-sections";
import {
  canEditApplication as canEditApplicationStatus,
  canSubmitApplication as canSubmitApplicationStatus,
  isLocked as isApplicationLocked,
  type ApplicationStatusInput,
} from "./application-status";

/**
 * =========================================================
 * CIRGLOB — APPLICATION PERMISSIONS
 * =========================================================
 *
 * Purpose:
 * Centralized runtime permission semantics for application and
 * founder-profile access.
 *
 * This file intentionally contains:
 * - role normalization
 * - permission guards
 * - workspace edit checks
 * - section edit checks
 * - invitation checks
 * - removal checks
 * - submission checks
 *
 * This file intentionally does NOT contain:
 * - Supabase access
 * - auth/session hydration
 * - UI rendering
 * - persistence orchestration
 * - route protection
 * - validation schema definitions
 *
 * Database and RLS remain the source of truth. This layer is a
 * runtime convenience and safety layer only.
 * =========================================================
 */

export type ApplicationPermissionInput = {
  status?: ApplicationStatusInput | null | undefined;
  memberRole?: ApplicationMemberRole | string | null | undefined;
  ownsFounderProfile?: boolean | null | undefined;
  section?: ApplicationSection | string | null | undefined;
};

export type ApplicationPermissionSummary = {
  status: ApplicationStatusInput | null;
  memberRole: ApplicationMemberRole | null;
  ownsFounderProfile: boolean;
  isAuthenticatedMember: boolean;
  isOwner: boolean;
  canEditApplication: boolean;
  canEditSection: boolean;
  canEditFounderProfile: boolean;
  canInviteMember: boolean;
  canRemoveMember: boolean;
  canSubmitApplication: boolean;
  isLocked: boolean;
  section: ApplicationSection | null;
};

export type ApplicationRoleGuardInput = {
  memberRole?: ApplicationMemberRole | string | null | undefined;
};

export type ApplicationStatusGuardInput = {
  status?: ApplicationStatusInput | null | undefined;
};

export type ApplicationSectionGuardInput = {
  status?: ApplicationStatusInput | null | undefined;
  memberRole?: ApplicationMemberRole | string | null | undefined;
  section?: ApplicationSection | string | null | undefined;
};

const APPLICATION_MEMBER_ROLE_SET: ReadonlySet<ApplicationMemberRole> = new Set(
  APPLICATION_MEMBER_ROLE_VALUES,
);

/**
 * =========================================================
 * ROLE NORMALIZATION
 * =========================================================
 */

export function isApplicationMemberRole(
  value: unknown,
): value is ApplicationMemberRole {
  if (typeof value !== "string") return false;
  return APPLICATION_MEMBER_ROLE_SET.has(
    value.trim().toUpperCase() as ApplicationMemberRole,
  );
}

export function normalizeApplicationMemberRole(
  role: ApplicationMemberRole | string | null | undefined,
): ApplicationMemberRole | null {
  if (typeof role !== "string") return null;

  const normalized = role.trim().toUpperCase();
  return isApplicationMemberRole(normalized) ? normalized : null;
}

export function isOwnerRole(
  role: ApplicationMemberRole | string | null | undefined,
): boolean {
  return normalizeApplicationMemberRole(role) === APPLICATION_MEMBER_ROLES.OWNER;
}

export function isCoFounderRole(
  role: ApplicationMemberRole | string | null | undefined,
): boolean {
  return (
    normalizeApplicationMemberRole(role) ===
    APPLICATION_MEMBER_ROLES.CO_FOUNDER
  );
}

export function hasApplicationMembership(
  role: ApplicationMemberRole | string | null | undefined,
): boolean {
  return normalizeApplicationMemberRole(role) !== null;
}

export function hasFounderProfileOwnership(
  ownsFounderProfile: boolean | null | undefined,
): boolean {
  return ownsFounderProfile === true;
}

/**
 * =========================================================
 * INTERNAL HELPERS
 * =========================================================
 */

function normalizeSection(
  section: ApplicationSection | string | null | undefined,
): ApplicationSection | null {
  if (typeof section !== "string") return null;
  return isApplicationSection(section) ? section : null;
}

function hasEditableMembership(
  role: ApplicationMemberRole | string | null | undefined,
): boolean {
  return hasApplicationMembership(role);
}

function isSectionEditableByPolicy(section: ApplicationSection | null): boolean {
  if (!section) return false;

  const meta = APPLICATION_SECTION_METADATA[section];
  return meta ? meta.editableWhenDraft === true : false;
}

/**
 * =========================================================
 * CORE PERMISSIONS
 * =========================================================
 */

export function canEditApplication(
  input: ApplicationPermissionInput = {},
): boolean {
  const status = input.status ?? null;
  const role = input.memberRole ?? null;

  return hasEditableMembership(role) && canEditApplicationStatus(status);
}

export function canEditSection(
  input: ApplicationSectionGuardInput = {},
): boolean {
  const status = input.status ?? null;
  const role = input.memberRole ?? null;
  const section = normalizeSection(input.section);

  if (!section) return false;
  if (!hasEditableMembership(role)) return false;
  if (!canEditApplicationStatus(status)) return false;

  return isSectionEditableByPolicy(section) && !isApplicationLocked(status);
}

export function canEditFounderProfile(
  input: ApplicationPermissionInput = {},
): boolean {
  const ownsFounderProfile = hasFounderProfileOwnership(
    input.ownsFounderProfile ?? null,
  );

  return ownsFounderProfile;
}

export function canInviteMember(
  input: ApplicationPermissionInput = {},
): boolean {
  const status = input.status ?? null;
  const role = input.memberRole ?? null;

  return isOwnerRole(role) && canEditApplicationStatus(status);
}

export function canRemoveMember(
  input: ApplicationPermissionInput = {},
): boolean {
  const status = input.status ?? null;
  const role = input.memberRole ?? null;

  return isOwnerRole(role) && canEditApplicationStatus(status);
}

export function canSubmitApplication(
  input: ApplicationPermissionInput = {},
): boolean {
  const status = input.status ?? null;
  const role = input.memberRole ?? null;

  return isOwnerRole(role) && canSubmitApplicationStatus(status);
}

export function isWorkspaceLocked(
  input: ApplicationStatusGuardInput = {},
): boolean {
  return isApplicationLocked(input.status ?? null);
}

export function canPerformApplicationAction(
  input: ApplicationPermissionInput = {},
): boolean {
  return canEditApplication(input);
}

export function canPerformSectionAction(
  input: ApplicationSectionGuardInput = {},
): boolean {
  return canEditSection(input);
}

/**
 * =========================================================
 * SUMMARY BUILDER
 * =========================================================
 */

export function getApplicationPermissions(
  input: ApplicationPermissionInput = {},
): ApplicationPermissionSummary {
  const status = input.status ?? null;
  const role = normalizeApplicationMemberRole(input.memberRole ?? null);
  const section = normalizeSection(input.section ?? null);
  const ownsFounderProfile = hasFounderProfileOwnership(
    input.ownsFounderProfile ?? null,
  );

  return {
    status,
    memberRole: role,
    ownsFounderProfile,
    isAuthenticatedMember: role !== null,
    isOwner: role === APPLICATION_MEMBER_ROLES.OWNER,
    canEditApplication: canEditApplication({ status, memberRole: role }),
    canEditSection: canEditSection({ status, memberRole: role, section }),
    canEditFounderProfile: canEditFounderProfile({
      ownsFounderProfile,
    }),
    canInviteMember: canInviteMember({ status, memberRole: role }),
    canRemoveMember: canRemoveMember({ status, memberRole: role }),
    canSubmitApplication: canSubmitApplication({ status, memberRole: role }),
    isLocked: isWorkspaceLocked({ status }),
    section,
  };
}

/**
 * =========================================================
 * ASSERTION-STYLE HELPERS
 * =========================================================
 */

export function assertCanEditApplication(
  input: ApplicationPermissionInput = {},
): void {
  if (!canEditApplication(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

export function assertCanEditSection(
  input: ApplicationSectionGuardInput = {},
): void {
  if (!canEditSection(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

export function assertCanEditFounderProfile(
  input: ApplicationPermissionInput = {},
): void {
  if (!canEditFounderProfile(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

export function assertCanInviteMember(
  input: ApplicationPermissionInput = {},
): void {
  if (!canInviteMember(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

export function assertCanRemoveMember(
  input: ApplicationPermissionInput = {},
): void {
  if (!canRemoveMember(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

export function assertCanSubmitApplication(
  input: ApplicationPermissionInput = {},
): void {
  if (!canSubmitApplication(input)) {
    throw new Error("ACCESS_DENIED");
  }
}

/**
 * =========================================================
 * CONVENIENCE EXPORTS
 * =========================================================
 */

export const applicationPermissions = {
  isApplicationMemberRole,
  normalizeApplicationMemberRole,
  isOwnerRole,
  isCoFounderRole,
  hasApplicationMembership,
  canEditApplication,
  canEditSection,
  canEditFounderProfile,
  canInviteMember,
  canRemoveMember,
  canSubmitApplication,
  isWorkspaceLocked,
  canPerformApplicationAction,
  canPerformSectionAction,
  getApplicationPermissions,
  assertCanEditApplication,
  assertCanEditSection,
  assertCanEditFounderProfile,
  assertCanInviteMember,
  assertCanRemoveMember,
  assertCanSubmitApplication,
} as const; 