import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";

import FounderProfileWorkspace from "@/components/founder-profile/FounderProfileWorkspace";
import { ROUTES } from "@/lib/constants";
import { buildSigninHref } from "@/lib/navigation/auth-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidPublicId } from "@/lib/cirglob-runtime/id";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { getFounderProfileSections } from "@/lib/cirglob-runtime/founder-profile-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FounderProfilePageProps = {
  params?: Promise<{
    profileId?: string;
  }>;
};

function buildFounderProfileHref(profileId: string): string {
  return ROUTES.APPLY_PROFILE_BY_ID(profileId);
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export default async function FounderProfilePage({
  params,
}: FounderProfilePageProps) {
  noStore();

  const resolvedParams = params ? await params : undefined;
  const profileId =
    typeof resolvedParams?.profileId === "string"
      ? resolvedParams.profileId.trim()
      : "";

  if (
    !profileId ||
    (!isUuidLike(profileId) && !isValidPublicId(profileId, "founder-profile"))
  ) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect(buildSigninHref(buildFounderProfileHref(profileId)));
  }

  let workspaceSnapshot;
  try {
    workspaceSnapshot = await loadWorkspaceRuntime(user.id, null, profileId);
  } catch (loadError) {
    if (
      loadError instanceof WorkspaceRuntimeError &&
      loadError.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(buildFounderProfileHref(profileId)));
    }

    console.error(
      "[apply/profile/[profileId]] workspace load failed:",
      loadError,
    );
    notFound();
  }

  const canonicalFounderProfileId =
    workspaceSnapshot.activeFounderProfileId?.trim() ?? profileId;

  if (canonicalFounderProfileId !== profileId) {
    redirect(buildFounderProfileHref(canonicalFounderProfileId));
  }

  const initialSections = await getFounderProfileSections(supabase, user.id);

  return (
    <FounderProfileWorkspace
      workspaceSnapshot={workspaceSnapshot}
      founderProfileId={canonicalFounderProfileId}
      initialSections={initialSections}
    />
  );
}