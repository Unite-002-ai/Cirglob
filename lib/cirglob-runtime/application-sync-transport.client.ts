"use client";

import type {
  ApplicationSyncSnapshot,
  ApplicationSyncTransport,
} from "@/lib/application-sync";
import type { ApplicationSection } from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — HTTP APPLICATION SYNC TRANSPORT
 * =========================================================
 *
 * PURPOSE
 * -------
 * Default browser transport that wires the application
 * runtime's autosave pipeline to the server-backed
 * /api/application/application-sections endpoint.
 *
 * Without this, CirglobApplicationStateManager has no
 * transport configured by default. Autosave then always
 * reports failure, section content only ever reaches each
 * browser's local storage, and is never written to the
 * database or visible to any other founder on the
 * application. This module exists specifically to close
 * that gap.
 * =========================================================
 */

const APPLICATION_SECTIONS_ENDPOINT = "/api/application/application-sections";

function pickDirtyOrAllSections(
  snapshot: ApplicationSyncSnapshot,
): Partial<Record<ApplicationSection, unknown>> {
  const dirty = snapshot.dirtySections ?? [];
  const keys: readonly ApplicationSection[] =
    dirty.length > 0
      ? dirty
      : (Object.keys(snapshot.sections) as ApplicationSection[]);

  const payload: Partial<Record<ApplicationSection, unknown>> = {};

  for (const section of keys) {
    if (section in snapshot.sections) {
      payload[section] = snapshot.sections[section];
    }
  }

  return payload;
}

async function persistSnapshotOverHttp(
  snapshot: ApplicationSyncSnapshot,
): Promise<void> {
  const sections = pickDirtyOrAllSections(snapshot);

  if (Object.keys(sections).length === 0) return;

  // Fail loud rather than silently letting the server guess which
  // application to write to. Every save must be explicitly scoped
  // to the application this workspace instance is open for.
  if (!snapshot.applicationId) {
    throw new Error(
      "Section sync failed: no application is active in this workspace.",
    );
  }

  const response = await fetch(APPLICATION_SECTIONS_ENDPOINT, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId: snapshot.applicationId,
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
        ? `Section sync failed: ${errorCode}`
        : `Section sync failed with status ${response.status}`,
    );
  }
}

/**
 * Creates the default HTTP-backed sync transport used by the
 * application workspace whenever no custom transport is
 * supplied via props. Safe to instantiate once per manager
 * instance and reuse for its lifetime.
 */
export function createHttpApplicationSyncTransport(): ApplicationSyncTransport {
  return {
    persistSnapshot: persistSnapshotOverHttp,
  };
}