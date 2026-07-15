// website/cirglob-site/app/apply/application/page.tsx

import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { buildSigninHref } from "@/lib/navigation/auth-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  provisionFounderApplicationWorkspace,
} from "@/lib/cirglob-runtime/workspace-provisioning.server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicationPage() {
  noStore();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(buildSigninHref(ROUTES.APPLY_DASHBOARD));
  }

  try {
    const workspace = await loadWorkspaceRuntime(user.id);

    if (workspace.activeApplicationId) {
      redirect(`${ROUTES.APPLY_APPLICATION}/${workspace.activeApplicationId}`);
    }
  } catch (error) {
    if (
      error instanceof WorkspaceRuntimeError &&
      error.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(ROUTES.APPLY_DASHBOARD));
    }

    // Fall through to provisioning so the open action still
    // works even if workspace inspection is temporarily inconsistent.
  }

  try {
    const provisioned = await provisionFounderApplicationWorkspace({
      userId: user.id,
    });

    redirect(`${ROUTES.APPLY_APPLICATION}/${provisioned.activeApplicationId}`);
  } catch (error) {
    if (
      error instanceof WorkspaceRuntimeError &&
      error.code === "UNAUTHORIZED"
    ) {
      redirect(buildSigninHref(ROUTES.APPLY_DASHBOARD));
    }

    console.error(
      "[apply/application] workspace provisioning failed:",
      error,
    );

    redirect(ROUTES.APPLY_DASHBOARD);
  }
}