//website/cirglob-site/app/apply/dashboard/page.tsx

import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import DashboardLanding, {
  type ApplicationItem,
} from "@/components/dashboard/DashboardLanding";
import {
  APPLICATION_CYCLE_LABELS,
  DEFAULT_APPLICATION_CYCLE,
  ROUTES,
} from "@/lib/constants";
import { buildSigninHref } from "@/lib/navigation/auth-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  acceptApplicationInvitation,
  findInvitationByRawToken,
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
  type WorkspaceRuntimeSnapshot,
} from "@/lib/workspace-runtime.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FounderProfileAwareWorkspaceSnapshot = WorkspaceRuntimeSnapshot & {
  activeFounderProfileId?: string | null;
};

function buildApplicationHref(applicationId: string): string {
  return `${ROUTES.APPLY_APPLICATION}/${applicationId}`;
}

function buildFounderProfileHref(founderProfileId?: string | null): string {
  const resolvedFounderProfileId =
    typeof founderProfileId === "string" ? founderProfileId.trim() : "";

  if (!resolvedFounderProfileId) {
    return ROUTES.APPLY_PROFILE;
  }

  return ROUTES.APPLY_PROFILE_BY_ID(resolvedFounderProfileId);
}

function buildInviteRedirectHref(inviteToken: string): string {
  return `${ROUTES.APPLY_DASHBOARD}?invite=${encodeURIComponent(inviteToken)}`;
}

function buildUnavailableTile(
  title: string,
  href: string,
  secondaryLabel: string,
  actionLabel = "No access",
): ApplicationItem {
  return {
    title,
    status: "Unavailable",
    statusTone: "neutral",
    actionLabel,
    href,
    secondaryLabel,
    actionDisabled: true,
  };
}

function buildFounderProfileTile(
  snapshot: FounderProfileAwareWorkspaceSnapshot | null,
): ApplicationItem {
  const founderProfileId = snapshot?.activeFounderProfileId?.trim() ?? "";
  const founderProfileHref = founderProfileId
    ? buildFounderProfileHref(founderProfileId)
    : ROUTES.APPLY_PROFILE;

  return {
    title: "Founder Profile",
    status: "Open",
    statusTone: "brand",
    actionLabel: "Open founder profile",
    href: founderProfileHref,
    secondaryLabel: founderProfileId
      ? "Founder identity and background."
      : "The founder profile is created the moment you open it and then reused for the workspace.",
    actionDisabled: false,
  };
}

function buildApplicationTile(
  snapshot: WorkspaceRuntimeSnapshot | null,
): ApplicationItem {
  if (!snapshot) {
    return {
      title: "Founder Application",
      status: "Not set up",
      statusTone: "neutral",
      actionLabel: "Open application",
      href: ROUTES.APPLY_APPLICATION,
      secondaryLabel:
        "Open the application workspace to create or reuse your canonical application.",
    };
  }

  if (!snapshot.activeApplicationId) {
    return {
      title: "Founder Application",
      status: "Not set up",
      statusTone: "neutral",
      actionLabel: "Open application",
      href: ROUTES.APPLY_APPLICATION,
      secondaryLabel:
        "Open the application workspace to create or reuse your canonical application.",
    };
  }

  const applicationHref = buildApplicationHref(snapshot.activeApplicationId);

  if (snapshot.canSubmitApplication) {
    return {
      title: "Founder Application",
      status: "Ready to submit",
      statusTone: "brand",
      actionLabel: "Open application",
      href: applicationHref,
      secondaryLabel: "Submission-ready workspace.",
    };
  }

  if (snapshot.canEditApplication) {
    return {
      title: "Founder Application",
      status: "Editable",
      statusTone: "brand",
      actionLabel: "Open application",
      href: applicationHref,
      secondaryLabel:
        "Application draft and review state are controlled by the runtime layer.",
    };
  }

  return {
    title: "Founder Application",
    status: snapshot.isLocked ? "Locked" : "Unavailable",
    statusTone: snapshot.isLocked ? "warning" : "neutral",
    actionLabel: snapshot.isLocked ? "Locked" : "Open application",
    href: applicationHref,
    secondaryLabel: snapshot.isLocked
      ? "Application access is currently locked."
      : "Application entry is not available in this workspace.",
    actionDisabled: snapshot.isLocked,
  };
}

type ApplyDashboardPageProps = {
  searchParams?: Promise<{
    invite?: string;
    inviteError?: string;
  }>;
};

export default async function ApplyDashboardPage({
  searchParams,
}: ApplyDashboardPageProps) {
  noStore();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const inviteToken =
    typeof resolvedSearchParams?.invite === "string"
      ? resolvedSearchParams.invite.trim()
      : "";

  if (inviteToken) {
    if (!isValidRawInvitationToken(inviteToken)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=INVALID_TOKEN`);
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(buildSigninHref(buildInviteRedirectHref(inviteToken)));
    }

    const serviceSupabase = createServerSupabaseServiceClient();
    const normalizedToken = normalizeRawInvitationToken(inviteToken);
    const found = await findInvitationByRawToken(
      serviceSupabase,
      normalizedToken,
    );

    if (!found) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=NOT_FOUND`);
    }

    if (isInvitationAccepted(found.invitation)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=ALREADY_ACCEPTED`);
    }

    if (isInvitationExpired(found.invitation)) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=EXPIRED`);
    }

    const userEmail = user.email?.trim().toLowerCase() ?? "";
    const inviteEmail = found.invitation.email.trim().toLowerCase();

    if (userEmail !== inviteEmail) {
      redirect(`${ROUTES.APPLY_DASHBOARD}?inviteError=EMAIL_MISMATCH`);
    }

    const result = await acceptApplicationInvitation(serviceSupabase, {
      rawToken: normalizedToken,
      profileId: user.id,
      userEmail: user.email ?? "",
    });

    redirect(buildApplicationHref(result.applicationPublicId));
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildSigninHref(ROUTES.APPLY_DASHBOARD));
  }

  const initialUser = {
    id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || "",
    email: user.email || "",
    image:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.avatar ||
      user.user_metadata?.image ||
      null,
  };

  let workspace: FounderProfileAwareWorkspaceSnapshot | null = null;
  let workspaceLoadFailed = false;

  try {
    workspace = await loadWorkspaceRuntime(user.id);
  } catch (error) {
    console.error("[apply/dashboard] workspace load failed:", error);

    if (
      error instanceof WorkspaceRuntimeError &&
      error.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(ROUTES.APPLY_DASHBOARD));
    }

    workspaceLoadFailed = true;
  }

  const founderProfileTile = buildFounderProfileTile(workspace);
  const applicationTile = buildApplicationTile(workspace);
  const cycleLabel = APPLICATION_CYCLE_LABELS[DEFAULT_APPLICATION_CYCLE];

  return (
    <DashboardLanding
      initialUser={initialUser}
      founderProfileTile={founderProfileTile}
      applicationTile={applicationTile}
      cycleLabel={cycleLabel}
      workspaceLoadFailed={workspaceLoadFailed}
    />
  );
}