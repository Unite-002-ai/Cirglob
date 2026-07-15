import "server-only";

import { 
  APPLICATION_MEMBER_ROLES, 
  PROFILE 
} from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  createWorkspaceError,
  safeString,
} from "../workspace-runtime.shared";
import { generateFounderProfileId } from "./id";

const PROFILES_TABLE = PROFILE.TABLE;
const APPLICATION_MEMBERS_TABLE = "application_members";
const APPLICATIONS_TABLE = "applications";
const FOUNDER_PROFILES_TABLE = "founder_profiles";
const MAX_PROVISIONING_ATTEMPTS = 5;

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type ProfileRow = Readonly<{
  id: string;
  email: string | null;
  updated_at: string | null;
}>;

export type FounderProfileProvisioningInput = Readonly<{
  userId: string;
}>;

export type FounderProfileProvisioningResult = Readonly<{
  activeFounderProfileId: string;
  createdProfile: boolean;
  reusedExistingProfile: boolean;
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

function normalizeWorkspaceUserId(userId: string): string {
  const resolved = safeString(userId);

  if (!resolved) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "A valid authenticated user is required to provision a founder profile.",
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
      "Unable to resolve authenticated founder-profile access.",
    );
  }

  const authenticatedUser = authData.user ?? null;

  if (!authenticatedUser || authenticatedUser.id !== requestedUserId) {
    throw createWorkspaceError(
      "UNAUTHORIZED",
      "Authenticated user does not match the requested founder-profile identity.",
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

  if (authenticatedUser.email) {
    const {
      data: profileByEmail,
      error: profileByEmailError,
    } = await supabase
      .from(PROFILES_TABLE)
      .select("id,email,updated_at")
      .eq("email", authenticatedUser.email)
      .maybeSingle();

    if (profileByEmailError && !isNotFoundError(profileByEmailError)) {
      throw createWorkspaceError(
        "WORKSPACE_LOAD_FAILED",
        `Failed to resolve founder profile by email: ${getErrorMessage(profileByEmailError)}`,
      );
    }

    if (profileByEmail?.id) {
      return profileByEmail as ProfileRow;
    }
  }

  throw createWorkspaceError(
    "INVALID_WORKSPACE_STATE",
    "Authenticated user does not have a matching founder profile.",
  );
}

async function findCanonicalApplicationIdForProfile(
  supabase: SupabaseClient,
  profileId: string,
): Promise<string> {
  const { data: workspace } = await supabase
    .from(APPLICATION_MEMBERS_TABLE)
    .select("application_id, role, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(10);

  const memberships = (workspace ?? []).filter((row) =>
    safeString((row as { application_id?: unknown }).application_id ?? null),
  ) as Array<{
    application_id: string;
    role: string;
    created_at: string | null;
  }>;

  const ownedMembership = memberships.find(
    (row) => row.role === APPLICATION_MEMBER_ROLES.OWNER,
  );

  const selectedMembership = ownedMembership ?? memberships[0] ?? null;

  if (!selectedMembership?.application_id) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "The founder profile requires an accessible application workspace.",
    );
  }

  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from(APPLICATIONS_TABLE)
    .select("id, public_id, created_by, status")
    .eq("id", selectedMembership.application_id)
    .maybeSingle();

  if (applicationError && !isNotFoundError(applicationError)) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to resolve application workspace: ${getErrorMessage(applicationError)}`,
    );
  }

  if (!applicationData?.id) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "The selected application workspace could not be resolved.",
    );
  }

  return applicationData.id;
}

async function findExistingFounderProfile(
  supabase: SupabaseClient,
  applicationId: string,
  profileId: string,
): Promise<{ id: string; publicId: string | null } | null> {
  const {
    data: founderProfileData,
    error: founderProfileError,
  } = await supabase
    .from(FOUNDER_PROFILES_TABLE)
    .select("id, public_id, application_id, profile_id, updated_at")
    .eq("application_id", applicationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (founderProfileError && !isNotFoundError(founderProfileError)) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to inspect existing founder profile: ${getErrorMessage(founderProfileError)}`,
    );
  }

  if (!founderProfileData?.id) {
    return null;
  }

  return {
    id: founderProfileData.id,
    publicId: safeString((founderProfileData as { public_id?: unknown }).public_id ?? null),
  };
}


async function verifyProvisionedFounderProfileState(
  supabase: SupabaseClient,
  applicationId: string,
  profileId: string,
): Promise<void> {
  const {
    data: founderProfileData,
    error: founderProfileError,
  } = await supabase
    .from(FOUNDER_PROFILES_TABLE)
    .select("application_id, profile_id")
    .eq("application_id", applicationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (founderProfileError) {
    throw createWorkspaceError(
      "WORKSPACE_LOAD_FAILED",
      `Failed to verify provisioned founder profile: ${getErrorMessage(founderProfileError)}`,
    );
  }

  if (
    !founderProfileData ||
    founderProfileData.application_id !== applicationId ||
    founderProfileData.profile_id !== profileId
  ) {
    throw createWorkspaceError(
      "INVALID_WORKSPACE_STATE",
      "Provisioned founder profile could not be confirmed.",
    );
  }
}

export async function provisionFounderProfileWorkspace(
  input: FounderProfileProvisioningInput,
): Promise<FounderProfileProvisioningResult> {
  const requestedUserId = normalizeWorkspaceUserId(input.userId);
  const supabase = await createServerSupabaseClient();
  const serviceSupabase = createServerSupabaseServiceClient();

  const profile = await loadAuthenticatedProfile(supabase, requestedUserId);
  const canonicalApplicationId = await findCanonicalApplicationIdForProfile(
    supabase,
    profile.id,
  );

  const existingFounderProfile = await findExistingFounderProfile(
    supabase,
    canonicalApplicationId,
    profile.id,
  );

  if (existingFounderProfile) {
    return {
      activeFounderProfileId:
        existingFounderProfile.publicId ?? existingFounderProfile.id,
      createdProfile: false,
      reusedExistingProfile: true,
    };
  }

  for (let attempt = 1; attempt <= MAX_PROVISIONING_ATTEMPTS; attempt += 1) {
    const publicId = generateFounderProfileId();

    try {
      const { data: insertedFounderProfile, error: insertError } =
        await serviceSupabase
          .from(FOUNDER_PROFILES_TABLE)
          .insert({
            public_id: publicId,
            application_id: canonicalApplicationId,
            profile_id: profile.id,
            data: {},
          })
          .select("id, public_id")
          .maybeSingle();

      if (insertError) {
        if (isDuplicateKeyError(insertError)) {
          const foundAfterRace = await findExistingFounderProfile(
            supabase,
            canonicalApplicationId,
            profile.id,
          );

          if (foundAfterRace) {
            return {
              activeFounderProfileId:
                foundAfterRace.publicId ?? foundAfterRace.id,
              createdProfile: false,
              reusedExistingProfile: true,
            };
          }

          continue;
        }

        throw createWorkspaceError(
          "WORKSPACE_LOAD_FAILED",
          `Failed to provision founder profile workspace: ${getErrorMessage(insertError)}`,
        );
      }

      const provisionedFounderProfile =
        insertedFounderProfile?.id
          ? {
              id: insertedFounderProfile.id as string,
              publicId: safeString(
                (insertedFounderProfile as { public_id?: unknown }).public_id ?? null,
              ),
            }
          : await findExistingFounderProfile(
              supabase,
              canonicalApplicationId,
              profile.id,
            );

      if (!provisionedFounderProfile) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Provisioned founder profile could not be resolved after creation.",
        );
      }

      await verifyProvisionedFounderProfileState(
        supabase,
        canonicalApplicationId,
        profile.id,
      );

      const resolvedActiveFounderProfileId =
        provisionedFounderProfile.publicId ?? provisionedFounderProfile.id;

      if (!resolvedActiveFounderProfileId) {
        throw createWorkspaceError(
          "INVALID_WORKSPACE_STATE",
          "Provisioned founder profile could not be resolved after creation.",
        );
      }

      return {
        activeFounderProfileId: resolvedActiveFounderProfileId,
        createdProfile: true,
        reusedExistingProfile: false,
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const foundAfterRace = await findExistingFounderProfile(
          supabase,
          canonicalApplicationId,
          profile.id,
        );

        if (foundAfterRace) {
          return {
            activeFounderProfileId:
              foundAfterRace.publicId ?? foundAfterRace.id,
            createdProfile: false,
            reusedExistingProfile: true,
          };
        }

        continue;
      }

      throw createWorkspaceError(
        "WORKSPACE_LOAD_FAILED",
        `Failed to provision founder profile workspace: ${getErrorMessage(error)}`,
      );
    }
  }

  throw createWorkspaceError(
    "WORKSPACE_LOAD_FAILED",
    "Unable to provision a founder profile workspace after repeated attempts.",
  );
}