//app/api/application/application-invitations/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  ACTIVITY_TYPES,
  recordApplicationActivity,
} from "@/lib/cirglob-runtime/application-activity.server";
import {
  APPLICATION_CYCLE_LABELS,
  type ApplicationCycle,
} from "@/lib/constants";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { assertCanInviteMember } from "@/lib/workspace-runtime.shared";
import { emailSchema } from "@/lib/validators";
import {
  buildInvitationLandingUrl,
  createApplicationInvitation,
  listActiveInvitations,
  removeApplicationInvitationById,
} from "@/lib/cirglob-runtime/application-invitations.server";
import {
  sendApplicationInvitationEmail,
} from "@/lib/email/application-invitation-email";

/**
 * =========================================================
 * POST /api/application/application-invitations
 * =========================================================
 * Creates a cofounder invitation.
 *
 * Access: workspace owner only.
 *
 * Body: { email: string }
 *
 * On success: { invitationId, email, expiresAt, isNew }
 *
 * Behavior:
 * - Validates the requester is an owner via workspace runtime.
 * - Normalizes the invite email.
 * - Creates a new invitation or rotates the token on an
 *   existing active invite for the same address.
 * - Sends the invite email with the accept link.
 * - Writes INVITATION_SENT activity via the service client.
 * =========================================================
 *
 * =========================================================
 * GET /api/application/application-invitations
 * =========================================================
 * Lists active invitations for the current workspace.
 *
 * Access: workspace owner only.
 *
 * On success: { invitations: [...] }
 * =========================================================
 */

function getRequestOrigin(request: NextRequest): string {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envSiteUrl) return envSiteUrl;

  const requestOrigin = request.nextUrl.origin?.trim().replace(/\/$/, "");
  if (requestOrigin && requestOrigin !== "null") return requestOrigin;

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? "";

  return `${forwardedProto}://${host}`.replace(/\/$/, "");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const emailParse = emailSchema.safeParse(
    body && typeof body === "object" && "email" in body
      ? (body as Record<string, unknown>).email
      : undefined,
  );

  if (!emailParse.success) {
    return NextResponse.json(
      { error: "INVALID_EMAIL", details: emailParse.error.issues },
      { status: 400 },
    );
  }

  const normalizedEmail = emailParse.data;

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
    assertCanInviteMember(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json(
      { error: "NO_ACTIVE_APPLICATION" },
      { status: 400 },
    );
  }

  if (normalizedEmail === user.email?.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "CANNOT_INVITE_SELF" },
      { status: 400 },
    );
  }

  const siteUrl = getRequestOrigin(request);
  const serviceSupabase = createServerSupabaseServiceClient();

  const { data: applicationData } = await supabase
    .from("applications")
    .select("id, cycle")
    .eq("public_id", workspace.activeApplicationId)
    .maybeSingle();

  if (!applicationData?.id) {
    return NextResponse.json(
      { error: "APPLICATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  const applicationRecordId = applicationData.id as string;
  const applicationName =
    APPLICATION_CYCLE_LABELS[applicationData.cycle as ApplicationCycle] ?? null;

  let inviterName: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      const firstName = profile.first_name?.trim();
      const lastName = profile.last_name?.trim();
      const fullName = profile.full_name?.trim();
      inviterName =
        [firstName, lastName].filter(Boolean).join(" ") || fullName || null;
    }
  } catch {
    // Non-fatal: inviter name is optional in the email.
  }

    let invitationResult;
  try {
    invitationResult = await createApplicationInvitation(serviceSupabase, {
      applicationRecordId,
      email: normalizedEmail,
      invitedByUserId: user.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "INVITATION_ALREADY_SENT") {
      return NextResponse.json(
        { error: "INVITATION_ALREADY_SENT" },
        { status: 409 },
      );
    }

    if (message === "CANNOT_INVITE_SELF") {
      return NextResponse.json(
        { error: "CANNOT_INVITE_SELF" },
        { status: 400 },
      );
    }

    console.error(
      "[api/application-invitations] Invitation creation failed:",
      error,
    );

    return NextResponse.json(
      { error: "INVITATION_CREATION_FAILED" },
      { status: 500 },
    );
  }

  let emailDelivery: "sent" | "degraded" = "sent";

  try {
    await recordApplicationActivity(serviceSupabase, {
      applicationId: applicationRecordId,
      actorId: user.id,
      type: ACTIVITY_TYPES.INVITATION_SENT,
      metadata: {
        invitationId: invitationResult.invitationId,
        applicationPublicId: workspace.activeApplicationId,
        email: invitationResult.email,
        expiresAt: invitationResult.expiresAt.toISOString(),
        isNew: invitationResult.isNew,
      },
    });
  } catch (activityError) {
    console.warn(
      "[api/application-invitations] Failed to write invitation activity:",
      activityError,
    );
  }

    const acceptUrl = buildInvitationLandingUrl(
    siteUrl,
    workspace.activeApplicationId,
    invitationResult.rawToken,
  );

  try {
    await sendApplicationInvitationEmail({
      recipientEmail: invitationResult.email,
      inviterName,
      applicationName,
      acceptUrl,
      expiresAt: invitationResult.expiresAt,
    });
  } catch (emailError) {
    emailDelivery = "degraded";
    console.error(
      "[api/application-invitations] Invitation email could not be sent:",
      emailError,
    );
  }

  return NextResponse.json(
    {
      invitationId: invitationResult.invitationId,
      email: invitationResult.email,
      expiresAt: invitationResult.expiresAt.toISOString(),
      isNew: invitationResult.isNew,
      applicationPublicId: workspace.activeApplicationId,
      emailDelivery,
      acceptUrl,
    },
    { status: 201 },
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    assertCanInviteMember(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json({ invitations: [] }, { status: 200 });
  }

  const { data: applicationRecord } = await supabase
    .from("applications")
    .select("id")
    .eq("public_id", workspace.activeApplicationId)
    .maybeSingle();

  if (!applicationRecord?.id) {
    return NextResponse.json({ invitations: [] }, { status: 200 });
  }

  const applicationRecordId = applicationRecord.id as string;

  let invitations;
  try {
    invitations = await listActiveInvitations(supabase, applicationRecordId);
  } catch (error) {
    console.error("[api/application-invitations GET] List failed:", error);

    return NextResponse.json(
      { error: "INVITATIONS_LOAD_FAILED" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      invitations: invitations.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expires_at,
        acceptedAt: invite.accepted_at,
        createdAt: invite.created_at,
      })),
    },
    { status: 200 },
  );
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const invitationId =
    body && typeof body === "object" && "invitationId" in body
      ? String((body as Record<string, unknown>).invitationId ?? "").trim()
      : "";

  if (!invitationId) {
    return NextResponse.json({ error: "INVALID_INVITATION_ID" }, { status: 400 });
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
    assertCanInviteMember(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json(
      { error: "NO_ACTIVE_APPLICATION" },
      { status: 400 },
    );
  }

  const { data: applicationRecord } = await supabase
    .from("applications")
    .select("id")
    .eq("public_id", workspace.activeApplicationId)
    .maybeSingle();

  if (!applicationRecord?.id) {
    return NextResponse.json(
      { error: "APPLICATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  const serviceSupabase = createServerSupabaseServiceClient();

  try {
    await removeApplicationInvitationById(serviceSupabase, {
      invitationId,
      applicationRecordId: applicationRecord.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "INVITATION_NOT_FOUND") {
      return NextResponse.json({ error: "INVITATION_NOT_FOUND" }, { status: 404 });
    }

    console.error("[api/application-invitations DELETE] Removal failed:", error);
    return NextResponse.json(
      { error: "INVITATION_REMOVE_FAILED" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}