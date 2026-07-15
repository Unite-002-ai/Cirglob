import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import ApplicationWorkspace from "@/components/application/ApplicationWorkspace";
import { ROUTES, type ApplicationSection } from "@/lib/constants";
import { buildSigninHref } from "@/lib/navigation/auth-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import { isValidPublicId } from "@/lib/cirglob-runtime/id";
import {
  acceptApplicationInvitation,
  findInvitationByRawToken,
  getApplicationRecordIdByPublicId,
  isInvitationAccepted,
  isInvitationExpired,
} from "@/lib/cirglob-runtime/application-invitations.server";
import {
  isValidRawInvitationToken,
  normalizeRawInvitationToken,
} from "@/lib/cirglob-runtime/invitation-token.server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import {
  listApplicationSections,
  toSectionValueMap,
} from "@/lib/cirglob-runtime/application-sections.server";

function buildApplicationHref(applicationId: string): string {
  return `${ROUTES.APPLY_APPLICATION}/${applicationId}`;
}

function buildInviteApplicationHref(
  applicationId: string,
  inviteToken: string,
): string {
  return `${buildApplicationHref(applicationId)}?invite=${encodeURIComponent(
    inviteToken,
  )}`;
}

type ApplicationPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
  searchParams?: Promise<{
    invite?: string;
  }>;
};

export default async function ApplicationPage({
  params,
  searchParams,
}: ApplicationPageProps) {
  noStore();

  const { applicationId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const inviteToken = resolvedSearchParams?.invite?.trim() ?? "";

  if (!isValidPublicId(applicationId, "app")) {
    redirect(ROUTES.APPLY_DASHBOARD);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (inviteToken) {
    if (!isValidRawInvitationToken(inviteToken)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=INVALID_TOKEN`);
    }

    const normalizedToken = normalizeRawInvitationToken(inviteToken);
    const serviceSupabase = createServerSupabaseServiceClient();

    const found = await findInvitationByRawToken(serviceSupabase, normalizedToken);

    if (!found) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=NOT_FOUND`);
    }

    if (found.applicationPublicId !== applicationId) {
      redirect(buildInviteApplicationHref(found.applicationPublicId, normalizedToken));
    }

    if (isInvitationAccepted(found.invitation)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=ALREADY_ACCEPTED`);
    }

    if (isInvitationExpired(found.invitation)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=EXPIRED`);
    }

    if (!user) {
      redirect(
        buildSigninHref(buildInviteApplicationHref(applicationId, inviteToken)),
      );
    }

    const userEmail = user.email?.trim().toLowerCase() ?? "";
    const inviteEmail = found.invitation.email.trim().toLowerCase();

    if (userEmail !== inviteEmail) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=EMAIL_MISMATCH`);
    }

    await acceptApplicationInvitation(serviceSupabase, {
      rawToken: normalizedToken,
      profileId: user.id,
      userEmail: user.email ?? "",
    });

    redirect(buildApplicationHref(applicationId));
  }

  if (!user) {
    redirect(buildSigninHref(buildApplicationHref(applicationId)));
  }

    let workspace;

  try {
    workspace = await loadWorkspaceRuntime(user.id, applicationId);
  } catch (error) {
    console.error(
      "[apply/application/[applicationId]] workspace load failed:",
      error,
    );

    if (
      error instanceof WorkspaceRuntimeError &&
      error.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(buildApplicationHref(applicationId)));
    }

    redirect(ROUTES.APPLY_DASHBOARD);
  }

  if (!workspace.hasWorkspaceAccess || !workspace.activeApplicationId) {
    redirect(ROUTES.APPLY_DASHBOARD);
  }

  if (workspace.activeApplicationId !== applicationId) {
    redirect(buildApplicationHref(workspace.activeApplicationId));
  }

  let initialSections: Partial<Record<ApplicationSection, unknown>> = {};

  try {
    const applicationRecordId = await getApplicationRecordIdByPublicId(
      supabase,
      applicationId,
    );

    if (applicationRecordId) {
      const sectionRows = await listApplicationSections(
        supabase,
        applicationRecordId,
      );
      initialSections = toSectionValueMap(sectionRows);
    }
  } catch (error) {
    console.error(
      "[apply/application/[applicationId]] section load failed:",
      error,
    );
  }

  return (
    <ApplicationWorkspace
      workspaceSnapshot={workspace}
      applicationId={applicationId}
      applicationStatus={workspace.activeApplicationStatus}
      initialSections={initialSections}
    />
  );
}