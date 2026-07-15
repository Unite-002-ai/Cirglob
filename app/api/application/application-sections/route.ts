import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { assertCanEditApplication } from "@/lib/workspace-runtime.shared";
import { getApplicationRecordIdByPublicId } from "@/lib/cirglob-runtime/application-invitations.server";
import {
  listApplicationSections,
  toSectionValueMap,
  upsertApplicationSections,
} from "@/lib/cirglob-runtime/application-sections.server";
import {
  APPLICATION_SECTION_ORDER,
  PERSISTENCE,
  type ApplicationSection,
} from "@/lib/constants";

/**
 * =========================================================
 * GET/PUT /api/application/application-sections
 * =========================================================
 *
 * GET returns every persisted section for the current user's
 * active application, keyed by section id. This is the
 * server-side source of truth used to hydrate the workspace on
 * load, so every member sees the same shared state regardless
 * of which device or browser they are using.
 *
 * PUT accepts { sections: Partial<Record<ApplicationSection, unknown>> }
 * and upserts each section for the current user's active
 * application. This is the ONLY endpoint that durably writes
 * section content — the client's autosave transport calls it,
 * so every founder's edits become visible to every other
 * founder on next load.
 *
 * Validation here is intentionally limited to shape and size
 * (matches the client's own autosave gate in
 * CirglobApplicationStateManager.setSection). It deliberately
 * does NOT run the Zod section schemas from
 * application-validation.ts — those are tuned for "is this
 * section complete enough to submit," and routine in-progress
 * typing (an unfinished URL, an empty required field) is
 * expected and must still autosave. Full schema enforcement
 * belongs to the submission flow that transitions status out
 * of DRAFT, not to this endpoint.
 * =========================================================
 */

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function extractRequestedSections(
  body: unknown,
): Partial<Record<ApplicationSection, unknown>> {
  if (!isPlainObject(body)) return {};

  const rawSections = isPlainObject(body.sections) ? body.sections : body;
  const result: Partial<Record<ApplicationSection, unknown>> = {};

  for (const section of APPLICATION_SECTION_ORDER) {
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
  section: ApplicationSection;
  reason: string;
};

function validateIncomingSections(
  sections: Partial<Record<ApplicationSection, unknown>>,
): {
  valid: Partial<Record<ApplicationSection, unknown>>;
  failures: SectionValidationFailure[];
} {
  const valid: Partial<Record<ApplicationSection, unknown>> = {};
  const failures: SectionValidationFailure[] = [];

  for (const section of APPLICATION_SECTION_ORDER) {
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

    console.error("[api/application-sections GET] workspace load failed:", error);
    return NextResponse.json({ error: "WORKSPACE_LOAD_FAILED" }, { status: 500 });
  }

  if (!workspace.hasWorkspaceAccess) {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json({ sections: {} }, { status: 200 });
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId) {
    return NextResponse.json({ sections: {} }, { status: 200 });
  }

  try {
    const rows = await listApplicationSections(supabase, applicationRecordId);
    return NextResponse.json(
      { sections: toSectionValueMap(rows) },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/application-sections GET] list failed:", error);
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

    console.error("[api/application-sections PUT] workspace load failed:", error);
    return NextResponse.json({ error: "WORKSPACE_LOAD_FAILED" }, { status: 500 });
  }

  try {
    assertCanEditApplication(workspace);
  } catch {
    return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403 });
  }

  if (!workspace.activeApplicationId) {
    return NextResponse.json({ error: "NO_ACTIVE_APPLICATION" }, { status: 400 });
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId) {
    return NextResponse.json({ error: "APPLICATION_NOT_FOUND" }, { status: 404 });
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
    await upsertApplicationSections(supabase, applicationRecordId, valid, user.id);
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "SECTION_LOCKED") {
      return NextResponse.json({ error: "APPLICATION_LOCKED" }, { status: 409 });
    }

    console.error("[api/application-sections PUT] upsert failed:", error);
    return NextResponse.json({ error: "SECTIONS_SAVE_FAILED" }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, saved: Object.keys(valid) },
    { status: 200 },
  );
}