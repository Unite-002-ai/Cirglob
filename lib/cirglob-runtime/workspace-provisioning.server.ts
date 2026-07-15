import "server-only";

import {
  APPLICATION_MEMBER_ROLES,
  APPLICATION_STATUS,
  DEFAULT_APPLICATION_CYCLE,
  PROFILE,
} from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import { generateApplicationId } from "./id";
import {
  createWorkspaceError,
  safeString,
} from "../workspace-runtime.shared";
import {
  ACTIVITY_TYPES,
  type ActivityType,
  recordApplicationActivity,
} from "./application-activity.server";

const APPLICATIONS_TABLE = "applications";
const APPLICATION_MEMBERS_TABLE = "application_members";
const PROFILES_TABLE = PROFILE.TABLE;
const MAX_PROVISIONING_ATTEMPTS = 5;
const PROVISION_WORKSPACE_RPC = "provision_founder_application_workspace";

const WORKSPACE_ERROR_CODES = new Set([
  "UNAUTHORIZED",
  "WORKSPACE_LOAD_FAILED",
  "INVALID_WORKSPACE_STATE",
]);

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type ProfileRow = Readonly<{
  id: string;
  email: string | null;
  updated_at: string | null;
}>;

type ProvisionWorkspaceRpcResult = {
  created_application?: boolean | null;
  created_membership?: boolean | null;
  reused_existing_workspace?: boolean | null;
};

export type WorkspaceProvisioningInput = Readonly<{
  userId: string;
}>;

export type WorkspaceProvisioningResult = Readonly<{
  activeApplicationId: string;
  createdApplication: boolean;
  createdMembership: boolean;
  reusedExistingWorkspace: boolean;
}>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown provisioning error.";
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  return code === "23505";
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  return code === "PGRST116";
}

function isWorkspaceRuntimeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  return WORKSPACE_ERROR_CODES.has(code);
}

function normalizeWorkspaceUserId(userId: string): string {
  const resolved = safeString(userId);

  if (!resolved) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "A valid authenticated user is required to provision a workspace.",
    );
  }

  return resolved;
}

async function loadAuthenticatedProfile(
  supabase: SupabaseClient,
  requestedUserId: string,
): Promise<ProfileRow> {
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

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

  const {
    data: profileById,
    error: profileByIdError,
  } = await supabase
    .from(PROFILES_TABLE)
    .select("id,email,updated_at")
    .eq("id", requestedUserId)
    .maybeSingle();

  if (profileByIdError && !isNotFoundError(profileByIdError)) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to resolve founder profile: ${getErrorMessage(profileByIdError)}`,
    );
  }

  if (profileById?.id) {
    return profileById as ProfileRow;
  }

  throw createWorkspaceError(
    "INVALID_WORKSPACE_STATE",
    "Authenticated user does not have a matching founder profile.",
  );
}

type ExistingWorkspaceApplication = Readonly<{
  id: string;
  publicId: string;
}>;

type ExistingWorkspaceMembershipRow = Readonly<{
  application_id: string | null;
  created_at: string | null;
}>;

async function findExistingWorkspaceApplication(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ExistingWorkspaceApplication | null> {
  const {
    data: membershipRows,
    error: membershipError,
  } = await supabase
    .from(APPLICATION_MEMBERS_TABLE)
    .select("application_id, created_at")
    .eq("profile_id", profileId)
    .eq("role", APPLICATION_MEMBER_ROLES.OWNER)
    .order("created_at", { ascending: false })
    .limit(2);

  if (membershipError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to inspect existing workspace membership: ${getErrorMessage(membershipError)}`,
    );
  }

  const ownerMembershipRows = (membershipRows ?? []).filter(
    (row): row is ExistingWorkspaceMembershipRow =>
      safeString((row as ExistingWorkspaceMembershipRow).application_id ?? null) !== null,
  );

  if (ownerMembershipRows.length > 1) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Multiple OWNER memberships exist for the founder profile.",
    );
  }

  const existingApplicationId = safeString(
    ownerMembershipRows[0]?.application_id ?? null,
  );

  if (!existingApplicationId) {
    return null;
  }

  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, created_by")
    .eq("id", existingApplicationId)
    .maybeSingle();

  if (applicationError && !isNotFoundError(applicationError)) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to verify existing workspace application: ${getErrorMessage(applicationError)}`,
    );
  }

  if (!applicationData?.id || !safeString(applicationData.public_id)) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "A membership row exists without a matching application row.",
    );
  }

  if (safeString(applicationData.created_by ?? null) !== profileId) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "The application ownership does not match the founder profile.",
    );
  }

  return {
    id: applicationData.id,
    publicId: applicationData.public_id,
  };
}

function normalizeRpcResult(
  payload: ProvisionWorkspaceRpcResult | ProvisionWorkspaceRpcResult[] | null,
): Pick<
  WorkspaceProvisioningResult,
  "createdApplication" | "createdMembership" | "reusedExistingWorkspace"
> | null {
  const normalizedPayload = Array.isArray(payload) ? payload[0] ?? null : payload;

  if (!normalizedPayload) return null;

  return {
    createdApplication: Boolean(normalizedPayload.created_application),
    createdMembership: Boolean(normalizedPayload.created_membership),
    reusedExistingWorkspace: Boolean(normalizedPayload.reused_existing_workspace),
  };
}

async function verifyProvisionedWorkspaceState(
  supabase: SupabaseClient,
  applicationPublicId: string,
  profileId: string,
): Promise<void> {
  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, created_by, cycle, status")
    .eq("public_id", applicationPublicId)
    .maybeSingle();

  if (applicationError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to verify provisioned workspace application: ${getErrorMessage(applicationError)}`,
    );
  }

  if (
    !applicationData ||
    safeString(applicationData.public_id) !== applicationPublicId ||
    safeString(applicationData.created_by ?? null) !== profileId
  ) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Provisioned workspace application could not be confirmed.",
    );
  }

  if (applicationData.cycle !== DEFAULT_APPLICATION_CYCLE) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Provisioned workspace application is not in the expected cycle.",
    );
  }

  if (applicationData.status !== APPLICATION_STATUS.DRAFT) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Provisioned workspace application is not in draft state.",
    );
  }

  const {
    data: membershipData,
    error: membershipError,
  } = await supabase
    .from(APPLICATION_MEMBERS_TABLE)
    .select("application_id, profile_id, role")
    .eq("application_id", applicationData.id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (membershipError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to verify provisioned workspace membership: ${getErrorMessage(membershipError)}`,
    );
  }

  if (
    !membershipData ||
    membershipData.application_id !== applicationData.id ||
    membershipData.profile_id !== profileId ||
    membershipData.role !== APPLICATION_MEMBER_ROLES.OWNER
  ) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Provisioned workspace membership could not be confirmed.",
    );
  }
}

/**
 * Best-effort activity write for provisioning events.
 *
 * Never throws. A failure to record activity must not fail
 * workspace provisioning — the user needs their workspace
 * regardless of whether the activity row was written.
 */
async function tryWriteProvisioningActivity(
  serviceSupabase: SupabaseClient,
  applicationRecordId: string,
  actorId: string,
  type: ActivityType,
): Promise<void> {
  try {
    await recordApplicationActivity(serviceSupabase, {
      applicationId: applicationRecordId,
      actorId,
      type,
      metadata: { provisionedBy: actorId },
    });
  } catch (error) {
    console.warn(
      `[workspace-provisioning] Failed to write activity (${type}):`,
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function provisionFounderApplicationWorkspace(
  input: WorkspaceProvisioningInput,
): Promise<WorkspaceProvisioningResult> {
  const requestedUserId = normalizeWorkspaceUserId(input.userId);
  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServerSupabaseServiceClient();

  const profile = await loadAuthenticatedProfile(supabase, requestedUserId);

  const existingWorkspaceApplication = await findExistingWorkspaceApplication(
    supabase,
    profile.id,
  );

  if (existingWorkspaceApplication) {
    await verifyProvisionedWorkspaceState(
      supabase,
      existingWorkspaceApplication.publicId,
      profile.id,
    );

    await tryWriteProvisioningActivity(
      serviceSupabase,
      existingWorkspaceApplication.id,
      profile.id,
      ACTIVITY_TYPES.WORKSPACE_REUSED,
    );

    return {
      activeApplicationId: existingWorkspaceApplication.publicId,
      createdApplication: false,
      createdMembership: false,
      reusedExistingWorkspace: true,
    };
  }

  for (let attempt = 1; attempt <= MAX_PROVISIONING_ATTEMPTS; attempt += 1) {
    const candidateApplicationPublicId = generateApplicationId();

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        PROVISION_WORKSPACE_RPC,
        {
          p_profile_id: profile.id,
          p_public_id: candidateApplicationPublicId,
          p_cycle: DEFAULT_APPLICATION_CYCLE,
          p_status: APPLICATION_STATUS.DRAFT,
          p_created_by: profile.id,
        },
      );

      if (rpcError) {
        if (isDuplicateKeyError(rpcError)) {
          const foundAfterRace = await findExistingWorkspaceApplication(
            supabase,
            profile.id,
          );

          if (foundAfterRace) {
            await verifyProvisionedWorkspaceState(
              supabase,
              foundAfterRace.publicId,
              profile.id,
            );

            await tryWriteProvisioningActivity(
              serviceSupabase,
              foundAfterRace.id,
              profile.id,
              ACTIVITY_TYPES.WORKSPACE_REUSED,
            );

            return {
              activeApplicationId: foundAfterRace.publicId,
              createdApplication: false,
              createdMembership: false,
              reusedExistingWorkspace: true,
            };
          }

          continue;
        }

        throw createWorkspaceError(
          "WORKSPACE_LOAD_FAILED",
          `Failed to provision founder application workspace: ${getErrorMessage(rpcError)}`,
        );
      }

      const normalized = normalizeRpcResult(
        rpcData as ProvisionWorkspaceRpcResult | ProvisionWorkspaceRpcResult[] | null,
      );

      if (!normalized) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Provisioning RPC returned an invalid response.",
        );
      }

      const provisionedWorkspaceApplication = await findExistingWorkspaceApplication(
        supabase,
        profile.id,
      );

      if (!provisionedWorkspaceApplication) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Provisioned workspace could not be resolved after creation.",
        );
      }

      await verifyProvisionedWorkspaceState(
        supabase,
        provisionedWorkspaceApplication.publicId,
        profile.id,
      );

      await tryWriteProvisioningActivity(
        serviceSupabase,
        provisionedWorkspaceApplication.id,
        profile.id,
        normalized.reusedExistingWorkspace
          ? ACTIVITY_TYPES.WORKSPACE_REUSED
          : ACTIVITY_TYPES.APPLICATION_CREATED,
      );

      return {
        activeApplicationId: provisionedWorkspaceApplication.publicId,
        createdApplication: normalized.createdApplication,
        createdMembership: normalized.createdMembership,
        reusedExistingWorkspace: normalized.reusedExistingWorkspace,
      };
    } catch (error) {
      if (isWorkspaceRuntimeError(error)) {
        throw error;
      }

      if (isDuplicateKeyError(error)) {
        const foundAfterRace = await findExistingWorkspaceApplication(
          supabase,
          profile.id,
        );

        if (foundAfterRace) {
          await verifyProvisionedWorkspaceState(
            supabase,
            foundAfterRace.publicId,
            profile.id,
          );

          return {
            activeApplicationId: foundAfterRace.publicId,
            createdApplication: false,
            createdMembership: false,
            reusedExistingWorkspace: true,
          };
        }

        continue;
      }

      throw createWorkspaceError(
        "WORKSPACE_LOAD_FAILED",
        `Failed to provision founder application workspace: ${getErrorMessage(error)}`,
      );
    }
  }

  throw createWorkspaceError(
    "WORKSPACE_LOAD_FAILED",
    "Unable to provision a founder application workspace after repeated attempts.",
  );
}