"use client";

import type {
  ApplicationSyncSnapshot,
  ApplicationSyncTransport,
} from "@/lib/application-sync";
import type { FounderProfileSection } from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — HTTP FOUNDER-PROFILE SYNC TRANSPORT
 * =========================================================
 *
 * The generic ApplicationSyncCoordinator's section-by-section
 * path (persistSection / syncSections) is built around
 * ApplicationSection and snapshot.sections — the founder
 * profile runtime never populates those fields (it always
 * sends sections: {} and dirtySections: [] in the base
 * snapshot, carrying its real payload in the extra
 * founderProfileSections / dirtyFounderProfileSections fields
 * instead). So this transport implements persistSnapshot,
 * which receives the whole object exactly as built by
 * CirglobFounderProfileStateManager.buildSyncSnapshot() and
 * reads those extra fields directly.
 * =========================================================
 */

type FounderProfileSyncSnapshot = ApplicationSyncSnapshot & {
  founderProfileSections: Partial<Record<FounderProfileSection, unknown>>;
  dirtyFounderProfileSections: readonly FounderProfileSection[];
};

const FOUNDER_PROFILE_SECTIONS_ENDPOINT =
  "/api/application/founder-profile-sections";

function pickDirtyOrAllFounderProfileSections(
  snapshot: FounderProfileSyncSnapshot,
): Partial<Record<FounderProfileSection, unknown>> {
  const dirty = snapshot.dirtyFounderProfileSections ?? [];
  const keys: readonly FounderProfileSection[] =
    dirty.length > 0
      ? dirty
      : (Object.keys(snapshot.founderProfileSections) as FounderProfileSection[]);

  const payload: Partial<Record<FounderProfileSection, unknown>> = {};

  for (const section of keys) {
    if (section in snapshot.founderProfileSections) {
      payload[section] = snapshot.founderProfileSections[section];
    }
  }

  return payload;
}

async function persistFounderProfileSnapshotOverHttp(
  snapshot: ApplicationSyncSnapshot,
): Promise<void> {
  const founderSnapshot = snapshot as FounderProfileSyncSnapshot;
  const sections = pickDirtyOrAllFounderProfileSections(founderSnapshot);

  if (Object.keys(sections).length === 0) return;

  const response = await fetch(FOUNDER_PROFILE_SECTIONS_ENDPOINT, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Carries the founder profile id here (see buildSyncSnapshot()),
      // sent for server-side logging/cross-checking only — the
      // server resolves authorization independently via auth.uid().
      founderProfileId: founderSnapshot.applicationId,
      sections,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errorCode =
      body && typeof body === "object" && "error" in body
        ? String((body as { error?: unknown }).error ?? "")
        : "";

    throw new Error(
      errorCode
        ? `Founder profile section sync failed: ${errorCode}`
        : `Founder profile section sync failed with status ${response.status}`,
    );
  }
}

/**
 * Creates the default HTTP-backed sync transport used by the
 * founder profile workspace whenever no custom transport is
 * supplied via props. Safe to instantiate once per manager
 * instance and reuse for its lifetime.
 */
export function createFounderProfileSyncTransport(): ApplicationSyncTransport {
  return {
    persistSnapshot: persistFounderProfileSnapshotOverHttp,
  };
}