import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  APPLICATION_SECTION_ORDER,
  type ApplicationSection,
} from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — APPLICATION SECTIONS SERVICE
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-only persistence for application section content —
 * Founders, Company, Progress, Insight, Structure & Capital,
 * Alignment, Timing & Commitment, and Founder Video metadata.
 *
 * This is the ONLY durable, cross-device, cross-member store
 * for application answers. Client-side local storage
 * (see application-cache.ts) is a same-session recovery buffer
 * only and must never be treated as a source of truth: every
 * page load re-fetches from here so every founder on an
 * application sees the same shared state.
 *
 * SECURITY CONTRACT
 * -----------------
 * Callers MUST pass the SESSION-scoped Supabase client (the one
 * bound to the requesting member's cookies), not the
 * service-role client. Row Level Security enforces:
 *   - "Members can read sections"               (SELECT)
 *   - "Members can create sections"              (INSERT, draft only)
 *   - "Members can update sections while draft"  (UPDATE, draft only)
 *   - "Members can delete draft sections"        (DELETE, draft only)
 * A database trigger (prevent_submitted_application_mutation)
 * independently blocks writes once the application is no
 * longer DRAFT, so a submitted application's answers can never
 * be altered through this module even if a caller's own
 * application-level checks are ever bypassed.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Auth/session logic
 * - Permission checks beyond what RLS enforces
 * - Schema validation (see lib/application-validation.ts —
 *   callers MUST validate untrusted input before calling the
 *   upsert helpers here; this module writes whatever it is given)
 * - Route logic
 * - UI concerns
 * =========================================================
 */

const APPLICATION_SECTIONS_TABLE = "application_sections";

export type ApplicationSectionRow = {
  id: string;
  application_id: string;
  section: ApplicationSection;
  data: Record<string, unknown>;
  version: number;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isLockedMutationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code =
    "code" in error && typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  const message =
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message.toLowerCase()
      : "";

  return (
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("locked") ||
    message.includes("draft")
  );
}

/**
 * Loads every persisted section row for an application.
 *
 * Safe to call with the session client: RLS grants read access
 * to any current member of the application.
 */
export async function listApplicationSections(
  supabase: SupabaseClient,
  applicationRecordId: string,
): Promise<ApplicationSectionRow[]> {
  const { data, error } = await supabase
    .from(APPLICATION_SECTIONS_TABLE)
    .select(
      "id, application_id, section, data, version, updated_by, updated_at, created_at",
    )
    .eq("application_id", applicationRecordId);

  if (error) {
    throw new Error(
      `Failed to load application sections: ${getErrorMessage(error)}`,
    );
  }

  return (data ?? []) as ApplicationSectionRow[];
}

/**
 * Converts persisted rows into the shape the client runtime
 * expects: a partial record keyed by section id.
 */
export function toSectionValueMap(
  rows: readonly ApplicationSectionRow[],
): Partial<Record<ApplicationSection, unknown>> {
  const result: Partial<Record<ApplicationSection, unknown>> = {};

  for (const row of rows) {
    if (!APPLICATION_SECTION_ORDER.includes(row.section)) continue;
    result[row.section] = row.data ?? {};
  }

  return result;
}

export type UpsertSectionInput = {
  applicationRecordId: string;
  section: ApplicationSection;
  data: unknown;
  updatedBy: string;
};

/**
 * Upserts a single section's content.
 *
 * Throws "SECTION_LOCKED" if the application is no longer a
 * draft (enforced by both RLS and a DB trigger — this function
 * surfaces either as the same friendly error string so callers
 * do not need to know which layer rejected the write).
 *
 * MUST be called with the session client so RLS applies.
 */
export async function upsertApplicationSection(
  supabase: SupabaseClient,
  input: UpsertSectionInput,
): Promise<void> {
  const payload =
    input.data && typeof input.data === "object" ? input.data : {};

  const { error } = await supabase.from(APPLICATION_SECTIONS_TABLE).upsert(
    {
      application_id: input.applicationRecordId,
      section: input.section,
      data: payload,
      updated_by: input.updatedBy,
    },
    { onConflict: "application_id,section" },
  );

  if (error) {
    if (isLockedMutationError(error)) {
      throw new Error("SECTION_LOCKED");
    }

    throw new Error(
      `Failed to save section "${input.section}": ${getErrorMessage(error)}`,
    );
  }
}

/**
 * Upserts several sections for one application.
 *
 * Each row upsert is independently atomic. If any one section
 * fails, this throws immediately rather than silently skipping
 * it — the caller (the sync route) treats the whole batch as
 * failed in that case so the client keeps retrying instead of
 * assuming every section was saved.
 */
export async function upsertApplicationSections(
  supabase: SupabaseClient,
  applicationRecordId: string,
  sections: Partial<Record<ApplicationSection, unknown>>,
  updatedBy: string,
): Promise<void> {
  const entries = Object.entries(sections) as [ApplicationSection, unknown][];

  for (const [section, data] of entries) {
    if (!APPLICATION_SECTION_ORDER.includes(section)) continue;

    await upsertApplicationSection(supabase, {
      applicationRecordId,
      section,
      data,
      updatedBy,
    });
  }
}