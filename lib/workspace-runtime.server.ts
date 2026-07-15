import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  APPLICATION_MEMBER_ROLES,
  PROFILE,
} from "@/lib/constants";
import {
  buildWorkspaceRuntimeSnapshot,
  createWorkspaceError,
  hasFounderProfileOwnership,
  normalizeWorkspaceRole,
  normalizeWorkspaceStatus,
  safeString,
} from "./workspace-runtime.shared";

const APPLICATION_MEMBERS_TABLE = "application_members";
const APPLICATIONS_TABLE = "applications";
const FOUNDER_PROFILES_TABLE = "founder_profiles";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type ServiceClient = ReturnType<typeof createServerSupabaseServiceClient>;

type ApplicationRow = {
  id: string;
  public_id: string;
  status: string;
  created_by: string;
};

type MembershipRow = {
  application_id: string;
  role: string;
  profile_id: string;
  created_at: string | null;
};

type FounderProfileRow = {
  id: string;
  public_id: string | null;
  application_id: string;
  profile_id: string;
};

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown workspace load error.";
  }
}

async function verifyAuthenticatedUser(
  supabase: SupabaseClient,
  requestedUserId: string,
): Promise<{ id: string; email: string | null }> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "Unable to resolve authenticated workspace access.",
    );
  }

  const authenticatedUser = authData.user ?? null;

  if (!authenticatedUser || authenticatedUser.id !== requestedUserId) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "Authenticated user does not match the requested workspace identity.",
    );
  }

  return {
    id: authenticatedUser.id,
    email: authenticatedUser.email ?? null,
  };
}
 
async function loadMembershipCandidates(
  service: ServiceClient,
  profileId: string,
): Promise<MembershipRow[]> {
  const { data, error } = await service
    .from(APPLICATION_MEMBERS_TABLE)
    .select("application_id, role, profile_id, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load workspace memberships: ${error.message}`,
    );
  }

  return (data ?? []) as MembershipRow[];
}

async function pickMembership(
  service: ServiceClient,
  profileId: string,
): Promise<MembershipRow | null> {
  const memberships = await loadMembershipCandidates(service, profileId);

  const ownerMemberships = memberships.filter(
    (row) =>
      normalizeWorkspaceRole(row.role) === APPLICATION_MEMBER_ROLES.OWNER,
  );

  if (ownerMemberships.length > 1) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Multiple owner memberships were found for the same user.",
    );
  }

  return memberships[0] ?? null;
}

async function loadApplicationByMembership(
  service: ServiceClient,
  membership: MembershipRow,
): Promise<ApplicationRow> {
  const { data, error } = await service
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, status, created_by")
    .eq("id", membership.application_id)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load application row: ${error.message}`,
    );
  }

  if (!data?.id || !data.public_id) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Workspace application is missing or inconsistent.",
    );
  }

  return data as ApplicationRow;
}

async function loadApplicationById(
  service: ServiceClient,
  applicationId: string,
): Promise<ApplicationRow | null> {
  const { data, error } = await service
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, status, created_by")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load application row: ${getErrorMessage(error)}`,
    );
  }

  if (!data?.id || !data.public_id) {
    return null;
  }

  return data as ApplicationRow;
}

async function loadApplicationByPublicId(
  service: ServiceClient,
  publicId: string,
): Promise<ApplicationRow | null> {
  const { data, error } = await service
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, status, created_by")
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load application row: ${getErrorMessage(error)}`,
    );
  }

  if (!data?.id || !data.public_id) {
    return null;
  }

  return data as ApplicationRow;
}

async function loadMembershipForApplication(
  service: ServiceClient,
  profileId: string,
  applicationId: string,
): Promise<MembershipRow | null> {
  const { data, error } = await service
    .from(APPLICATION_MEMBERS_TABLE)
    .select("application_id, role, profile_id, created_at")
    .eq("profile_id", profileId)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load workspace membership for the requested application: ${getErrorMessage(error)}`,
    );
  }

  return (data ?? null) as MembershipRow | null;
}

async function loadFounderProfileForProfile(
  service: ServiceClient,
  profileId: string,
): Promise<FounderProfileRow | null> {
  const { data, error } = await service
    .from(FOUNDER_PROFILES_TABLE)
    .select("id, public_id, application_id, profile_id")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load founder profile by profile owner: ${getErrorMessage(error)}`,
    );
  }

  if (!data?.id || !data.application_id || !data.profile_id) {
    return null;
  }

  return data as FounderProfileRow;
}

async function loadFounderProfileById(
  service: ServiceClient,
  founderProfileId: string,
  profileId: string,
  applicationId?: string | null,
): Promise<FounderProfileRow | null> {
  const resolvedFounderProfileId = safeString(founderProfileId);

  if (!resolvedFounderProfileId) {
    return null;
  }

  let publicIdQuery = service
    .from(FOUNDER_PROFILES_TABLE)
    .select("id, public_id, application_id, profile_id")
    .eq("profile_id", profileId);

  if (applicationId && isUuidLike(applicationId)) {
    publicIdQuery = publicIdQuery.eq("application_id", applicationId);
  }

  const { data: publicIdData, error: publicIdError } = await publicIdQuery
    .eq("public_id", resolvedFounderProfileId)
    .maybeSingle();

  if (publicIdError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load founder profile workspace: ${getErrorMessage(publicIdError)}`,
    );
  }

  if (
    publicIdData?.id &&
    publicIdData.application_id &&
    publicIdData.profile_id
  ) {
    return publicIdData as FounderProfileRow;
  }

  if (!isUuidLike(resolvedFounderProfileId)) {
    return null;
  }

  let idQuery = service
    .from(FOUNDER_PROFILES_TABLE)
    .select("id, public_id, application_id, profile_id")
    .eq("profile_id", profileId);

  if (applicationId && isUuidLike(applicationId)) {
    idQuery = idQuery.eq("application_id", applicationId);
  }

  const { data: idData, error: idError } = await idQuery
    .eq("id", resolvedFounderProfileId)
    .maybeSingle();

  if (idError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load founder profile workspace: ${getErrorMessage(idError)}`,
    );
  }

  if (!idData?.id || !idData.application_id || !idData.profile_id) {
    return null;
  }

  return idData as FounderProfileRow;
}

async function loadFounderProfileForApplication(
  service: ServiceClient,
  profileId: string,
  applicationId: string,
): Promise<FounderProfileRow | null> {
  const { data, error } = await service
    .from(FOUNDER_PROFILES_TABLE)
    .select("id, public_id, application_id, profile_id")
    .eq("profile_id", profileId)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (error) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to load founder profile ownership: ${getErrorMessage(error)}`,
    );
  }

  if (!data?.id || !data.application_id || !data.profile_id) {
    return null;
  }

  return data as FounderProfileRow;
}

export async function loadWorkspaceRuntime(
  userId: string,
  requestedApplicationPublicId?: string | null,
  requestedFounderProfileId?: string | null,
) {
  const requestedUserId = safeString(userId);

  if (!requestedUserId) {
    return buildWorkspaceRuntimeSnapshot(
      {
        userId: null,
        email: null,
        applicationId: null,
        applicationRecordId: null,
        founderProfileId: null,
        applicationStatus: null,
        membership: null,
      },
      false,
    );
  }

  const sessionClient = await createServerSupabaseClient();
  const authenticatedUser = await verifyAuthenticatedUser(
    sessionClient,
    requestedUserId,
  );

  const service = createServerSupabaseServiceClient();

  const resolvedRequestedApplicationId = safeString(
    requestedApplicationPublicId ?? null,
  );
  const resolvedRequestedFounderProfileId = safeString(
    requestedFounderProfileId ?? null,
  );

    let application: ApplicationRow | null = null;
  let membership: MembershipRow | null = null;
  let founderProfile: FounderProfileRow | null = null;

  if (resolvedRequestedFounderProfileId) {
    founderProfile = await loadFounderProfileById(
      service,
      resolvedRequestedFounderProfileId,
      requestedUserId,
    );

    if (founderProfile) {
      application = await loadApplicationById(
        service,
        founderProfile.application_id,
      );

      if (!application) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Founder profile belongs to a missing application.",
        );
      }

      if (
        resolvedRequestedApplicationId &&
        application.public_id !== resolvedRequestedApplicationId
      ) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Founder profile does not belong to the requested application.",
        );
      }

      membership = await loadMembershipForApplication(
        service,
        requestedUserId,
        application.id,
      );
    }
  } else if (resolvedRequestedApplicationId) {
    application = await loadApplicationByPublicId(
      service,
      resolvedRequestedApplicationId,
    );

    if (!application) {
      return buildWorkspaceRuntimeSnapshot(
        {
          userId: requestedUserId,
          email: authenticatedUser.email,
          applicationId: resolvedRequestedApplicationId,
          applicationRecordId: null,
          founderProfileId: null,
          applicationStatus: null,
          membership: null,
        },
        false,
      );
    }

    membership = await loadMembershipForApplication(
      service,
      requestedUserId,
      application.id,
    );

    founderProfile = await loadFounderProfileForApplication(
      service,
      requestedUserId,
      application.id,
    );
  } else {
    founderProfile = await loadFounderProfileForProfile(service, requestedUserId);

    if (founderProfile) {
      application = await loadApplicationById(
        service,
        founderProfile.application_id,
      );

      if (!application) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Founder profile belongs to a missing application.",
        );
      }

      membership = await loadMembershipForApplication(
        service,
        requestedUserId,
        application.id,
      );
    } else {
      membership = await pickMembership(service, requestedUserId);

      if (membership) {
        application = await loadApplicationByMembership(service, membership);

        const activeApplicationStatus = normalizeWorkspaceStatus(
          application.status,
        );

        if (activeApplicationStatus === null) {
          throw createWorkspaceError(
            "INVALID_WORKSPACE_STATE",
            "Workspace application status is invalid or missing.",
          );
        }

        if (safeString(application.created_by ?? null) !== requestedUserId) {
          const membershipRole = normalizeWorkspaceRole(membership.role);

          if (membershipRole === APPLICATION_MEMBER_ROLES.OWNER) {
            throw createWorkspaceError(
              "INVALID_WORKSPACE_STATE",
              "Owner membership exists but application ownership does not match the authenticated user.",
            );
          }
        }

        founderProfile = await loadFounderProfileForApplication(
          service,
          requestedUserId,
          application.id,
        );
      }
    }
  }

  const activeApplicationStatus = application
    ? normalizeWorkspaceStatus(application.status)
    : null;

  if (application && activeApplicationStatus === null) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Workspace application status is invalid or missing.",
    );
  }

  const ownsFounderProfile = hasFounderProfileOwnership(
    requestedUserId,
    founderProfile?.profile_id ?? null,
  );

  return buildWorkspaceRuntimeSnapshot(
    {
      userId: requestedUserId,
      email: authenticatedUser.email,
      applicationId:
        application?.public_id ?? resolvedRequestedApplicationId ?? null,
      applicationRecordId: application?.id ?? null,
      founderProfileId:
        founderProfile?.public_id ?? founderProfile?.id ?? null,
      applicationStatus: activeApplicationStatus,
      membership: membership
        ? {
            applicationId: membership.application_id,
            role: membership.role,
          }
        : null,
    },
    ownsFounderProfile,
    );
  }
 
  export type {
    WorkspaceRuntimeInput,
    WorkspaceRuntimeSnapshot,
    WorkspaceRuntimeErrorCode,
  } from "./workspace-runtime.shared";
  export { WorkspaceRuntimeError } from "./workspace-runtime.shared";