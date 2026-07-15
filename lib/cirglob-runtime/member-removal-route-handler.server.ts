import "server-only";

import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { assertCanRemoveMember } from "@/lib/workspace-runtime.shared";
import { getApplicationRecordIdByPublicId } from "@/lib/cirglob-runtime/application-invitations.server";
import { removeApplicationMemberById } from "@/lib/cirglob-runtime/application-members.server";

/**
 * =========================================================
 * CIRGLOB — MEMBER REMOVAL SHARED ROUTE HANDLER
 * =========================================================
 *
 * PURPOSE
 * -------
 * Single canonical implementation of the member removal request
 * flow. Both route files delegate to this function:
 *
 *   DELETE /api/application/application-members/[memberId]
 *   POST   /api/application/application-members/[memberId]/remove
 *
 * Having one implementation prevents the two routes from
 * drifting apart over time and ensures every guard is enforced
 * identically regardless of the HTTP method used.
 *
 * FLOW
 * ----
 * auth → workspace owner assertion → application record ID
 * resolution → service-layer removal → activity write
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Params parsing (callers extract memberId from route context)
 * - Response formatting beyond what is returned here
 * =========================================================
 */

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/**
 * Executes the full member removal request pipeline.
 *
 * Accepts the raw `memberId` string from the route params.
 * Returns a `NextResponse` ready to be returned from either
 * the DELETE or POST route handler.
 */
export async function handleMemberRemovalRequest(
  memberId: string,
): Promise<NextResponse> {
  if (!memberId || !isValidUuid(memberId)) {
    return NextResponse.json({ error: "INVALID_MEMBER_ID" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let workspace;
  try {
    workspace = await loadWorkspaceRuntime(user.id);
  } catch (error) {
    if (
      error instanceof WorkspaceRuntimeError &&
      error.code === "UNAUTHORIZED"
    ) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "WORKSPACE_LOAD_FAILED" },
      { status: 500 },
    );
  }

  try {
    assertCanRemoveMember(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json(
      { error: "NO_ACTIVE_APPLICATION" },
      { status: 400 },
    );
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId) {
    return NextResponse.json(
      { error: "APPLICATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  const serviceSupabase = createServerSupabaseServiceClient();

  try {
    await removeApplicationMemberById(serviceSupabase, {
      memberId,
      applicationRecordId,
      actorId: user.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    if (message === "MEMBER_NOT_FOUND") {
      return NextResponse.json({ error: "MEMBER_NOT_FOUND" }, { status: 404 });
    }

    if (message === "MEMBER_APPLICATION_MISMATCH") {
      return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
    }

    if (message === "CANNOT_REMOVE_OWNER") {
      return NextResponse.json(
        { error: "CANNOT_REMOVE_OWNER" },
        { status: 422 },
      );
    }

    console.error(
      "[handleMemberRemovalRequest] Removal failed:",
      error,
    );

    return NextResponse.json(
      { error: "REMOVAL_FAILED" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}