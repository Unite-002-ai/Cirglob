import {
  APPLICATION_MEMBER_ROLES,
  type ApplicationMemberRole,
} from "@/lib/constants";
import {
  canEditApplication as canEditApplicationPermission,
  canEditFounderProfile as canEditFounderProfilePermission,
  canInviteMember as canInviteMemberPermission,
  canRemoveMember as canRemoveMemberPermission,
  canSubmitApplication as canSubmitApplicationPermission,
} from "@/lib/application-permissions";
import {
  isLocked as isApplicationLocked,
  parseApplicationStatus,
  type ApplicationStatusInput,
} from "@/lib/application-status";

export type WorkspaceRuntimeSource = "secure" | "anonymous";

export type WorkspaceMembershipInput = {
  applicationId?: string | null;
  role?: unknown;
} | null;

type WorkspaceMembershipSnapshot = {
  applicationId: string | null;
  role: ApplicationMemberRole | null;
};

export type WorkspaceRuntimeInput = {
  userId: string | null;
  email?: string | null;
  applicationId?: string | null;
  applicationRecordId?: string | null;
  founderProfileId?: string | null;
  applicationStatus?: unknown;
  membership?: WorkspaceMembershipInput;
  /**
   * Legacy compatibility only. This field is ignored for authorization.
   */
  memberRole?: unknown;
};

export type WorkspaceRuntimeSnapshot = {
  userId: string | null;
  email: string | null;

  activeApplicationId: string | null;
  activeApplicationStatus: ApplicationStatusInput | null;
  currentMemberRole: ApplicationMemberRole | null;

  activeFounderProfileId: string | null;
  hasFounderProfileWorkspace: boolean;
  ownsFounderProfile: boolean;

  hydrated: boolean;
  source: WorkspaceRuntimeSource;
  resolvedAt: number;

  isAuthenticated: boolean;
  hasMembership: boolean;
  hasWorkspaceAccess: boolean;
  isOwner: boolean;
  isLocked: boolean;

  canEditApplication: boolean;
  canInviteMember: boolean;
  canRemoveMember: boolean;
  canSubmitApplication: boolean;
  canEditFounderProfile: boolean;
};

export type WorkspaceRuntimeSummary = {
  activeApplicationId: string | null;
  activeFounderProfileId: string | null;
  currentMemberRole: ApplicationMemberRole | null;
  hasFounderProfileWorkspace: boolean;
  isLocked: boolean;
  canEditApplication: boolean;
  canSubmitApplication: boolean;
  canEditFounderProfile: boolean;
  ownsFounderProfile: boolean;
};

export type WorkspaceAccessLevel = "anonymous" | "member" | "owner";

export type WorkspaceRuntimeErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_WORKSPACE_STATE"
  | "WORKSPACE_ACCESS_DENIED"
  | "WORKSPACE_LOCKED"
  | "WORKSPACE_LOAD_FAILED";

export class WorkspaceRuntimeError extends Error {
  readonly code: WorkspaceRuntimeErrorCode;

  constructor(code: WorkspaceRuntimeErrorCode, message: string) {
    super(message);
    this.name = "WorkspaceRuntimeError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const APPLICATION_MEMBER_ROLE_SET: ReadonlySet<ApplicationMemberRole> =
  new Set<ApplicationMemberRole>(
    Object.values(APPLICATION_MEMBER_ROLES) as ApplicationMemberRole[],
  );

export const DEFAULT_WORKSPACE_RUNTIME_SNAPSHOT: WorkspaceRuntimeSnapshot = {
  userId: null,
  email: null,
  activeApplicationId: null,
  activeApplicationStatus: null,
  currentMemberRole: null,
  activeFounderProfileId: null,
  hasFounderProfileWorkspace: false,
  ownsFounderProfile: false,
  hydrated: false,
  source: "anonymous",
  resolvedAt: 0,
  isAuthenticated: false,
  hasMembership: false,
  hasWorkspaceAccess: false,
  isOwner: false,
  isLocked: false,
  canEditApplication: false,
  canInviteMember: false,
  canRemoveMember: false,
  canSubmitApplication: false,
  canEditFounderProfile: false,
};

export function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeWorkspaceStatus(
  value: unknown,
): ApplicationStatusInput | null {
  if (typeof value !== "string") return null;
  return parseApplicationStatus(value);
}

export function normalizeWorkspaceRole(
  value: unknown,
): ApplicationMemberRole | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  return APPLICATION_MEMBER_ROLE_SET.has(normalized as ApplicationMemberRole)
    ? (normalized as ApplicationMemberRole)
    : null;
}

function normalizeWorkspaceMembership(
  input: WorkspaceMembershipInput,
): WorkspaceMembershipSnapshot | null {
  if (!input || typeof input !== "object") return null;

  const applicationId = safeString(input.applicationId ?? null);
  const role = normalizeWorkspaceRole(input.role ?? null);

  if (!applicationId && !role) return null;

  return {
    applicationId,
    role,
  };
}

export function createWorkspaceError(
  code: WorkspaceRuntimeErrorCode,
  message: string,
): WorkspaceRuntimeError {
  return new WorkspaceRuntimeError(code, message);
}

export function hasFounderProfileOwnership(
  userId: string | null,
  profileId: string | null,
): boolean {
  const resolvedUserId = safeString(userId);
  const resolvedProfileId = safeString(profileId);

  if (!resolvedUserId || !resolvedProfileId) return false;
  return resolvedUserId === resolvedProfileId;
}

function derivePermissions(
  input: WorkspaceRuntimeInput,
  ownsFounderProfile: boolean,
) {
  const userId = safeString(input.userId);
  const email = safeString(input.email);

  const activeApplicationId = safeString(input.applicationId);
  const activeApplicationRecordId =
    safeString(input.applicationRecordId) ?? activeApplicationId;

  const activeFounderProfileId = safeString(input.founderProfileId);

  const activeApplicationStatus = normalizeWorkspaceStatus(
    input.applicationStatus,
  );

  const normalizedMembership = normalizeWorkspaceMembership(
    input.membership ?? null,
  );

  const currentMemberRole = normalizedMembership?.role ?? null;
  const membershipApplicationId = normalizedMembership?.applicationId ?? null;

  const isAuthenticated = Boolean(userId);
  const hasMembership = Boolean(normalizedMembership) && currentMemberRole !== null;

  const hasWorkspaceAccess =
    isAuthenticated &&
    hasMembership &&
    Boolean(activeApplicationRecordId) &&
    membershipApplicationId === activeApplicationRecordId;

  const hasFounderProfileWorkspace = Boolean(activeFounderProfileId);

  const isOwner = currentMemberRole === APPLICATION_MEMBER_ROLES.OWNER;
  const isLocked = isApplicationLocked(activeApplicationStatus);

  const canEditApplication =
    hasWorkspaceAccess &&
    canEditApplicationPermission({
      status: activeApplicationStatus,
      memberRole: currentMemberRole,
    });

  const canInviteMember =
    hasWorkspaceAccess &&
    canInviteMemberPermission({
      status: activeApplicationStatus,
      memberRole: currentMemberRole,
    });

  const canRemoveMember =
    hasWorkspaceAccess &&
    canRemoveMemberPermission({
      status: activeApplicationStatus,
      memberRole: currentMemberRole,
    });

  const canSubmitApplication =
    hasWorkspaceAccess &&
    canSubmitApplicationPermission({
      status: activeApplicationStatus,
      memberRole: currentMemberRole,
    });

  const canEditFounderProfile =
    hasFounderProfileWorkspace &&
    ownsFounderProfile &&
    canEditFounderProfilePermission({
      ownsFounderProfile,
    });

  return {
    userId,
    email,
    activeApplicationId,
    activeApplicationStatus,
    currentMemberRole,
    activeFounderProfileId,
    hasFounderProfileWorkspace,
    ownsFounderProfile,
    isAuthenticated,
    hasMembership,
    hasWorkspaceAccess,
    isOwner,
    isLocked,
    canEditApplication,
    canInviteMember,
    canRemoveMember,
    canSubmitApplication,
    canEditFounderProfile,
  };
}

export function buildWorkspaceRuntimeSnapshot(
  input: WorkspaceRuntimeInput,
  ownsFounderProfile: boolean,
): WorkspaceRuntimeSnapshot {
  const source: WorkspaceRuntimeSource = safeString(input.userId)
    ? "secure"
    : "anonymous";

  const derived = derivePermissions(input, ownsFounderProfile);

  return {
    userId: derived.userId,
    email: derived.email,
    activeApplicationId: derived.activeApplicationId,
    activeApplicationStatus: derived.activeApplicationStatus,
    currentMemberRole: derived.currentMemberRole,
    activeFounderProfileId: derived.activeFounderProfileId,
    hasFounderProfileWorkspace: derived.hasFounderProfileWorkspace,
    ownsFounderProfile: derived.ownsFounderProfile,
    hydrated: true,
    source,
    resolvedAt: Date.now(),
    isAuthenticated: derived.isAuthenticated,
    hasMembership: derived.hasMembership,
    hasWorkspaceAccess: derived.hasWorkspaceAccess,
    isOwner: derived.isOwner,
    isLocked: derived.isLocked,
    canEditApplication: derived.canEditApplication,
    canInviteMember: derived.canInviteMember,
    canRemoveMember: derived.canRemoveMember,
    canSubmitApplication: derived.canSubmitApplication,
    canEditFounderProfile: derived.canEditFounderProfile,
  };
}

function getWorkspacePermissionFailureReason(
  snapshot: WorkspaceRuntimeSnapshot,
): WorkspaceRuntimeErrorCode {
  if (!snapshot.isAuthenticated) return "UNAUTHORIZED";
  if (!snapshot.hasMembership || !snapshot.activeApplicationId) {
    return "WORKSPACE_ACCESS_DENIED";
  }
  if (snapshot.activeApplicationStatus === null) {
    return "INVALID_WORKSPACE_STATE";
  }
  return "WORKSPACE_ACCESS_DENIED";
}

function assertWorkspaceMutable(snapshot: WorkspaceRuntimeSnapshot): void {
  assertWorkspaceAccess(snapshot);

  if (snapshot.isLocked) {
    throw createWorkspaceError(
      "WORKSPACE_LOCKED",
      "Workspace is locked and cannot be mutated.",
    );
  }
}

function assertFounderProfileAccess(snapshot: WorkspaceRuntimeSnapshot): void {
  if (!snapshot.hydrated) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Workspace snapshot has not been hydrated.",
    );
  }

  if (!snapshot.activeFounderProfileId || !snapshot.hasFounderProfileWorkspace) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Founder profile workspace is missing.",
    );
  }

  if (!snapshot.isAuthenticated) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "Authentication is required to access this workspace.",
    );
  }

  if (!snapshot.ownsFounderProfile) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Founder profile ownership is required to access this workspace.",
    );
  }
}

export function assertWorkspaceAccess(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  if (!snapshot.hydrated) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Workspace snapshot has not been hydrated.",
    );
  }

  if (!snapshot.isAuthenticated) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "Authentication is required to access this workspace.",
    );
  }

  if (!snapshot.hasMembership || !snapshot.activeApplicationId) {
    throw createWorkspaceError(
      getWorkspacePermissionFailureReason(snapshot),
      "Workspace membership or application access is missing.",
    );
  }

  if (snapshot.activeApplicationStatus === null) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Workspace application status is invalid or missing.",
    );
  }

  if (!snapshot.hasWorkspaceAccess) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Workspace access is not allowed.",
    );
  }
}

export function assertCanEditApplication(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  assertWorkspaceMutable(snapshot);

  if (!snapshot.canEditApplication) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Editing the application is not allowed.",
    );
  }
}

export function assertCanInviteMember(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  assertWorkspaceMutable(snapshot);

  if (!snapshot.canInviteMember) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Inviting members is not allowed.",
    );
  }
}

export function assertCanRemoveMember(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  assertWorkspaceMutable(snapshot);

  if (!snapshot.canRemoveMember) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Removing members is not allowed.",
    );
  }
}

export function assertCanSubmitApplication(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  assertWorkspaceMutable(snapshot);

  if (!snapshot.canSubmitApplication) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Submitting the application is not allowed.",
    );
  }
}

export function assertCanEditFounderProfile(
  snapshot: WorkspaceRuntimeSnapshot,
): void {
  assertFounderProfileAccess(snapshot);

  if (!snapshot.canEditFounderProfile) {
    throw createWorkspaceError(
      "WORKSPACE_ACCESS_DENIED",
      "Editing the founder profile is not allowed.",
    );
  }
}

export function isWorkspaceHydrated(
  snapshot: WorkspaceRuntimeSnapshot,
): boolean {
  return snapshot.hydrated;
}

export function isWorkspaceEditable(
  snapshot: WorkspaceRuntimeSnapshot,
): boolean {
  return snapshot.canEditApplication || snapshot.canEditFounderProfile;
}

export function getWorkspaceAccessLevel(
  snapshot: WorkspaceRuntimeSnapshot,
): WorkspaceAccessLevel {
  if (!snapshot.isAuthenticated || !snapshot.hasWorkspaceAccess) {
    return "anonymous";
  }

  return snapshot.isOwner ? "owner" : "member";
}

export function getWorkspaceSummary(
  snapshot: WorkspaceRuntimeSnapshot,
): WorkspaceRuntimeSummary {
  return {
    activeApplicationId: snapshot.activeApplicationId,
    activeFounderProfileId: snapshot.activeFounderProfileId,
    currentMemberRole: snapshot.currentMemberRole,
    hasFounderProfileWorkspace: snapshot.hasFounderProfileWorkspace,
    isLocked: snapshot.isLocked,
    canEditApplication: snapshot.canEditApplication,
    canSubmitApplication: snapshot.canSubmitApplication,
    canEditFounderProfile: snapshot.canEditFounderProfile,
    ownsFounderProfile: snapshot.ownsFounderProfile,
  };
}

export function isWorkspaceSecure(snapshot: WorkspaceRuntimeSnapshot): boolean {
  return snapshot.source === "secure" && snapshot.hydrated;
}

export type { ApplicationStatusInput };