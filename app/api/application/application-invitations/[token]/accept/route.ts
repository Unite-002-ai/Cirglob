//app/api/application/application-invitations/[token]/accept/route.ts
import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import { AUTH, ROUTES } from "@/lib/constants";
import {
  acceptApplicationInvitation,
  AcceptInvitationError,
  type AcceptInvitationResult,
  findInvitationByRawToken,
  isInvitationAccepted,
  isInvitationExpired,
} from "@/lib/cirglob-runtime/application-invitations.server";
import {
  isValidRawInvitationToken,
  normalizeRawInvitationToken,
} from "@/lib/cirglob-runtime/invitation-token.server";

/**
 * =========================================================
 * GET /api/application-invitations/[token]/accept
 * =========================================================
 * Validates an invitation token and returns its state.
 *
 * Used by the invite landing page (/apply/invite/[token]) to
 * check token validity before showing the confirmation UI.
 *
 * If the requester is not authenticated, returns 401 with a
 * sign-in URL the page can use for the redirect.
 *
 * Response on valid token + authenticated user:
 * {
 *   valid: true,
 *   email: string,
 *   expiresAt: string,
 *   applicationPublicId: string
 * }
 *
 * Response on invalid/expired/accepted:
 * { valid: false, reason: string }
 * =========================================================
 *
 * =========================================================
 * POST /api/application-invitations/[token]/accept
 * =========================================================
 * Redeems an invitation and creates a CO_FOUNDER membership.
 *
 * Access: authenticated user whose email matches the invitation.
 *
 * Flow:
 * 1. Validate token (not expired, not already accepted).
 * 2. Require authenticated user.
 * 3. Require user email to match invitation email.
 * 4. Create CO_FOUNDER membership (idempotent).
 * 5. Mark invitation accepted.
 * 6. Write INVITATION_ACCEPTED + MEMBER_JOINED activity.
 * 7. Return the application public ID for client-side redirect.
 *
 * This operation is idempotent: if the membership already
 * exists the token will still be marked accepted and the
 * application URL is returned without error.
 * =========================================================
 */

type RouteContext = {
  params: Promise<{ token: string }>;
};

function buildSignInUrl(returnPath: string): string {
  const signinBase = ROUTES.AUTH.SIGNIN;
  return `${signinBase}?${AUTH.NEXT_QUERY_PARAM}=${encodeURIComponent(returnPath)}`;
}

function buildApplicationHref(applicationPublicId: string): string {
  return `${ROUTES.APPLY_APPLICATION}/${applicationPublicId}`;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { token } = await context.params;

  if (!token || !isValidRawInvitationToken(token)) {
    return NextResponse.redirect(
      new URL(`${ROUTES.APPLY_DASHBOARD}?inviteError=INVALID_TOKEN`, request.url),
    );
  }

  const normalizedToken = normalizeRawInvitationToken(token);
  const serviceSupabase = createServerSupabaseServiceClient();

  const found = await findInvitationByRawToken(serviceSupabase, normalizedToken);

  if (!found) {
    return NextResponse.redirect(
      new URL(`${ROUTES.APPLY_DASHBOARD}?inviteError=NOT_FOUND`, request.url),
    );
  }

  if (isInvitationAccepted(found.invitation)) {
    return NextResponse.redirect(
      new URL(
        `${ROUTES.APPLY_DASHBOARD}?inviteError=ALREADY_ACCEPTED`,
        request.url,
      ),
    );
  }

  if (isInvitationExpired(found.invitation)) {
    return NextResponse.redirect(
      new URL(`${ROUTES.APPLY_DASHBOARD}?inviteError=EXPIRED`, request.url),
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(buildSignInUrl(request.nextUrl.pathname), request.url),
    );
  }

  const userEmail = user.email?.trim().toLowerCase() ?? "";
  const inviteEmail = found.invitation.email.trim().toLowerCase();

  if (userEmail !== inviteEmail) {
    return NextResponse.redirect(
      new URL(
        `${ROUTES.APPLY_DASHBOARD}?inviteError=EMAIL_MISMATCH`,
        request.url,
      ),
    );
  }

  try {
    const result = await acceptApplicationInvitation(serviceSupabase, {
      rawToken: normalizedToken,
      profileId: user.id,
      userEmail: user.email ?? "",
    });

    return NextResponse.redirect(
      new URL(buildApplicationHref(result.applicationPublicId), request.url),
    );
  } catch (error) {
    if (error instanceof AcceptInvitationError) {
      const errorCode =
        error.code === "EMAIL_MISMATCH"
          ? "EMAIL_MISMATCH"
          : error.code === "EXPIRED"
            ? "EXPIRED"
            : error.code === "NOT_FOUND"
              ? "NOT_FOUND"
              : "ACCEPTANCE_FAILED";

      return NextResponse.redirect(
        new URL(
          `${ROUTES.APPLY_DASHBOARD}?inviteError=${errorCode}`,
          request.url,
        ),
      );
    }

    console.error(
      "[api/application-invitations/[token]/accept GET] Acceptance failed:",
      error,
    );

    return NextResponse.redirect(
      new URL(`${ROUTES.APPLY_DASHBOARD}?inviteError=ACCEPTANCE_FAILED`, request.url),
    );
  }
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { token } = await context.params;

  if (!token || !isValidRawInvitationToken(token)) {
    return NextResponse.json(
      { error: "INVALID_TOKEN" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const normalizedToken = normalizeRawInvitationToken(token);
  const serviceSupabase = createServerSupabaseServiceClient();

  let result: AcceptInvitationResult;
  try {
    result = await acceptApplicationInvitation(serviceSupabase, {
      rawToken: normalizedToken,
      profileId: user.id,
      userEmail: user.email ?? "",
    });
  } catch (error) {
    if (error instanceof AcceptInvitationError) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        EXPIRED: 410,
        EMAIL_MISMATCH: 403,
      };

      return NextResponse.json(
        { error: error.code },
        { status: statusMap[error.code] ?? 400 },
      );
    }

    console.error(
      "[api/application-invitations/[token]/accept POST] Acceptance failed:",
      error,
    );

    return NextResponse.json(
      { error: "ACCEPTANCE_FAILED" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      alreadyAccepted: result.alreadyAccepted,
      applicationUrl: buildApplicationHref(result.applicationPublicId),
    },
    { status: 200 },
  );
}