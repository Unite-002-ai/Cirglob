//app/api/application/application-members/[memberId]/remove/route.ts
import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { handleMemberRemovalRequest } from "@/lib/cirglob-runtime/member-removal-route-handler.server";

/**
 * =========================================================
 * POST /api/application-members/[memberId]/remove
 * =========================================================
 * POST alias for member removal.
 *
 * Delegates entirely to the shared removal handler, which is
 * the canonical implementation also used by:
 *   DELETE /api/application-members/[memberId]
 *
 * This route exists for clients that cannot send DELETE
 * requests (e.g. HTML forms, certain older environments).
 * Do not add logic here. All guards and mutations live in
 * handleMemberRemovalRequest.
 * =========================================================
 */

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { memberId } = await context.params;
  return handleMemberRemovalRequest(memberId);
}