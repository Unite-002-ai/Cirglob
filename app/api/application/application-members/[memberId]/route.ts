import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { getApplicationRecordIdByPublicId } from "@/lib/cirglob-runtime/application-invitations.server";
import {
  handleMemberRemovalRequest,
  isValidUuid,
} from "@/lib/cirglob-runtime/member-removal-route-handler.server";

/**
 * =========================================================
 * GET /api/application-members/[memberId]
 * =========================================================
 * Returns a single member row for the current workspace.
 *
 * Access: any workspace member.
 * =========================================================
 *
 * =========================================================
 * DELETE /api/application/application-members/[memberId]
 * =========================================================
 * Removes a co-founder member from the current workspace.
 *
 * Access: workspace owner only.
 *
 * Enforced invariants:
 * - Requester must be workspace owner.
 * - Target member must belong to the same application.
 * - Target member must NOT be the owner.
 * - Writes MEMBER_REMOVED activity on success.
 * =========================================================
 */

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { memberId } = await context.params;

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

  if (!workspace.hasWorkspaceAccess || !workspace.activeApplicationId) {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  const { data: member, error: memberError } = await supabase
    .from("application_members")
    .select(
      "id, application_id, profile_id, role, invited_by, joined_at, created_at",
    )
    .eq("id", memberId)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json(
      { error: "MEMBER_LOAD_FAILED" },
      { status: 500 },
    );
  }

  if (!member) {
    return NextResponse.json({ error: "MEMBER_NOT_FOUND" }, { status: 404 });
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId || member.application_id !== applicationRecordId) {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  return NextResponse.json({ member }, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { memberId } = await context.params;
  return handleMemberRemovalRequest(memberId);
}