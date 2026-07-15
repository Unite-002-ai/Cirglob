import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import FounderProfileWorkspace from "@/components/founder-profile/FounderProfileWorkspace";
import { ROUTES } from "@/lib/constants";
import { buildSigninHref } from "@/lib/navigation/auth-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { provisionFounderApplicationWorkspace } from "@/lib/cirglob-runtime/workspace-provisioning.server";
import { provisionFounderProfileWorkspace } from "@/lib/cirglob-runtime/founder-profile-provisioning.server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { getFounderProfileSections } from "@/lib/cirglob-runtime/founder-profile-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FounderProfilePage() {
  noStore();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect(buildSigninHref(ROUTES.APPLY_PROFILE));
  }

  let workspaceSnapshot;
  try {
    workspaceSnapshot = await loadWorkspaceRuntime(user.id);
  } catch (loadError) {
    if (
      loadError instanceof WorkspaceRuntimeError &&
      loadError.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(ROUTES.APPLY_PROFILE));
    }

    throw loadError;
  }

  if (workspaceSnapshot.activeFounderProfileId?.trim()) {
    const initialSections = await getFounderProfileSections(supabase, user.id);

    return (
      <FounderProfileWorkspace
        workspaceSnapshot={workspaceSnapshot}
        founderProfileId={workspaceSnapshot.activeFounderProfileId}
        initialSections={initialSections}
      />
    );
  }

  if (!workspaceSnapshot.activeApplicationId) {
    const provisionedApplication = await provisionFounderApplicationWorkspace({
      userId: user.id,
    });

    workspaceSnapshot = await loadWorkspaceRuntime(
      user.id,
      provisionedApplication.activeApplicationId,
    );
  }

  const provisionedFounderProfile = await provisionFounderProfileWorkspace({
    userId: user.id,
  });

  const redirectedWorkspaceSnapshot = await loadWorkspaceRuntime(
    user.id,
    null,
    provisionedFounderProfile.activeFounderProfileId,
  );

  const initialSections = await getFounderProfileSections(supabase, user.id);

  return (
    <FounderProfileWorkspace
      workspaceSnapshot={redirectedWorkspaceSnapshot}
      founderProfileId={provisionedFounderProfile.activeFounderProfileId}
      initialSections={initialSections}
    />
  );
}