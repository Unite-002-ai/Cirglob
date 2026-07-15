import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import {
  getApplicationRecordIdByPublicId,
} from "@/lib/cirglob-runtime/application-invitations.server";
import {
  listApplicationMembers,
  type MemberWithProfile,
} from "@/lib/cirglob-runtime/application-members.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

type MemberListItem = {
  id: string;
  memberId: string;
  applicationId: string;
  profileId: string;
  role: string;
  invitedBy: string | null;
  joinedAt: string | null;
  createdAt: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

function buildFullName(member: MemberWithProfile): string {
  const profile = member.profiles;
  if (!profile) return "Founder";

  const fullName = profile.full_name?.trim() ?? "";
  const firstName = profile.first_name?.trim() ?? "";
  const lastName = profile.last_name?.trim() ?? "";

  return (
    fullName ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "Founder"
  );
}

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
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

    console.error("[api/application-members GET] workspace load failed:", error);
    return NextResponse.json(
      { error: "WORKSPACE_LOAD_FAILED" },
      { status: 500 },
    );
  }

  if (!workspace.hasWorkspaceAccess) {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json({ members: [] }, { status: 200 });
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId) {
    return NextResponse.json({ members: [] }, { status: 200 });
  }

  let members: MemberWithProfile[];

  try {
    members = await listApplicationMembers(supabase, applicationRecordId);
  } catch (error) {
    console.error("[api/application-members GET] list failed:", error);
    return NextResponse.json(
      { error: "MEMBERS_LOAD_FAILED" },
      { status: 500 },
    );
  }

  const payload: MemberListItem[] = members.map((member) => {
    const profile = member.profiles;
    const fullName = buildFullName(member);
    const firstName = normalizeString(profile?.first_name);
    const lastName = normalizeString(profile?.last_name);
    const avatarUrl = normalizeString(profile?.avatar_url);
    const createdAt = member.created_at?.trim() || new Date().toISOString();

    return {
      id: member.id,
      memberId: member.id,
      applicationId: member.application_id,
      profileId: member.profile_id,
      role: member.role,
      invitedBy: member.invited_by ?? null,
      joinedAt: member.joined_at ?? null,
      createdAt,
      fullName,
      firstName,
      lastName,
      avatarUrl,
    };
  });

  return NextResponse.json({ members: payload }, { status: 200 });
}