import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { assertCanEditFounderProfile } from "@/lib/workspace-runtime.shared";
import {
  getFounderProfileApplicationId,
  getFounderProfileSections,
  mergeFounderProfileSections,
} from "@/lib/cirglob-runtime/founder-profile-sections.server";
import {
  FOUNDER_PROFILE_SECTION_ORDER,
  PERSISTENCE,
  type FounderProfileSection,
} from "@/lib/constants";

/**
 * =========================================================
 * GET/PUT /api/application/founder-profile-sections
 * =========================================================
 *
 * GET returns every persisted section for the current user's
 * own founder profile, keyed by section id. This is the
 * server-side source of truth used to hydrate the founder
 * profile workspace on load, so edits survive refresh, tab
 * switches, and sign-out/in regardless of device.
 *
 * PUT accepts { sections: Partial<Record<FounderProfileSection, unknown>> }
 * and atomically merges each provided section into the
 * founder profile's JSONB data column via a security-definer
 * RPC. This is the ONLY endpoint that durably writes founder
 * profile content — the client's autosave transport calls it.
 *
 * Validation here is intentionally limited to shape and size,
 * matching the client's own autosave gate. It deliberately does
 * NOT run the founder profile Zod schemas — those are tuned for
 * "is this section complete enough to submit," and routine
 * in-progress typing must still autosave. Full schema
 * enforcement belongs to the submission flow, not here.
 * =========================================================
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function extractRequestedSections(
  body: unknown,
): Partial<Record<FounderProfileSection, unknown>> {
  if (!isPlainObject(body)) return {};

  const rawSections = isPlainObject(body.sections) ? body.sections : body;
  const result: Partial<Record<FounderProfileSection, unknown>> = {};

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (section in rawSections) {
      result[section] = (rawSections as Record<string, unknown>)[section];
    }
  }

  return result;
}

function getByteLength(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

type SectionValidationFailure = {
  section: FounderProfileSection;
  reason: string;
};

function validateIncomingSections(
  sections: Partial<Record<FounderProfileSection, unknown>>,
): {
  valid: Partial<Record<FounderProfileSection, unknown>>;
  failures: SectionValidationFailure[];
} {
  const valid: Partial<Record<FounderProfileSection, unknown>> = {};
  const failures: SectionValidationFailure[] = [];

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (!(section in sections)) continue;

    const rawValue = sections[section];

    if (!isPlainObject(rawValue)) {
      failures.push({ section, reason: "SECTION_MUST_BE_OBJECT" });
      continue;
    }

    if (getByteLength(rawValue) > PERSISTENCE.MAX_SECTION_PAYLOAD_BYTES) {
      failures.push({ section, reason: "SECTION_TOO_LARGE" });
      continue;
    }

    valid[section] = rawValue;
  }

  return { valid, failures };
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
    if (error instanceof WorkspaceRuntimeError && error.code === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    console.error(
      "[api/founder-profile-sections GET] workspace load failed:",
      error,
    );
    return NextResponse.json({ error: "WORKSPACE_LOAD_FAILED" }, { status: 500 });
  }

  if (!workspace.hasFounderProfileWorkspace || !workspace.ownsFounderProfile) {
    return NextResponse.json({ sections: {} }, { status: 200 });
  }

  try {
    const sections = await getFounderProfileSections(supabase, user.id);
    return NextResponse.json({ sections }, { status: 200 });
  } catch (error) {
    console.error("[api/founder-profile-sections GET] load failed:", error);
    return NextResponse.json({ error: "SECTIONS_LOAD_FAILED" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    if (error instanceof WorkspaceRuntimeError && error.code === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    console.error(
      "[api/founder-profile-sections PUT] workspace load failed:",
      error,
    );
    return NextResponse.json({ error: "WORKSPACE_LOAD_FAILED" }, { status: 500 });
  }

  try {
    assertCanEditFounderProfile(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  const applicationRecordId = await getFounderProfileApplicationId(
    supabase,
    user.id,
  );

  if (!applicationRecordId) {
    return NextResponse.json(
      { error: "FOUNDER_PROFILE_NOT_FOUND" },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const requested = extractRequestedSections(body);

  if (Object.keys(requested).length === 0) {
    return NextResponse.json({ success: true, saved: [] }, { status: 200 });
  }

  const { valid, failures } = validateIncomingSections(requested);

  if (failures.length > 0) {
    return NextResponse.json(
      { error: "SECTIONS_INVALID", failures },
      { status: 400 },
    );
  }

  try {
    await mergeFounderProfileSections(supabase, {
      applicationId: applicationRecordId,
      profileId: user.id,
      sections: valid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "FOUNDER_PROFILE_LOCKED") {
      return NextResponse.json({ error: "APPLICATION_LOCKED" }, { status: 409 });
    }

    if (message === "FOUNDER_PROFILE_NOT_FOUND") {
      return NextResponse.json(
        { error: "FOUNDER_PROFILE_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
    }

    console.error("[api/founder-profile-sections PUT] merge failed:", error);
    return NextResponse.json({ error: "SECTIONS_SAVE_FAILED" }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, saved: Object.keys(valid) },
    { status: 200 },
  );
}