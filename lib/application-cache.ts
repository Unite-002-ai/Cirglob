"use client";

import { AUTOSAVE, LOCAL_STORAGE_KEYS, PERSISTENCE } from "./constants";

/**
 * =========================================================
 * CIRGLOB — APPLICATION CACHE LAYER
 * =========================================================
 *
 * Purpose:
 * Local persistence runtime for draft hydration, recovery, and
 * cache cleanup.
 *
 * Responsibilities:
 * - draft cache persistence
 * - last-saved tracking
 * - recovery cache persistence
 * - stale cache cleanup
 * - deterministic local storage naming
 *
 * Non-responsibilities:
 * - auth/session logic
 * - validation orchestration
 * - UI rendering
 * - direct Supabase access
 * - remote persistence orchestration
 *
 * Progress is stored inside the draft/recovery envelopes and
 * read from those envelopes only.
 *
 * This module is browser-safe and intended for client runtime use.
 */

export const STORAGE_KEYS = {
  draft: "cirglob-application-draft",
  recovery: "cirglob-application-recovery",
  draftLastSaved: "cirglob-application-draft-last-saved",
  recoveryLastSaved: "cirglob-application-recovery-last-saved",
  draftMetadata: "cirglob-application-draft-metadata",
  recoveryMetadata: "cirglob-application-recovery-metadata",
} as const;

export const APPLICATION_CACHE_EVENTS = {
  UPDATED: "cirglob:application-cache-updated",
  CLEARED: "cirglob:application-cache-cleared",
  CLEANED: "cirglob:application-cache-cleaned",
} as const;

export type ApplicationCacheEnvelope<T = unknown> = {
  schemaVersion: 1;
  applicationId: string | null;
  savedAt: number;
  updatedAt: number;
  progress: number | null;
  value: T;
};

export type ApplicationCacheSummary = {
  applicationId: string | null;
  hasDraft: boolean;
  hasRecovery: boolean;
  progress: number;
  lastSavedAt: number | null;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeNumber(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown cache error.";
  }
}

function getByteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }

  return new Blob([value]).size;
}

function now(): number {
  return Date.now();
}

function normalizeApplicationId(applicationId?: string | null): string | null {
  return safeString(applicationId);
}

function getActiveApplicationId(): string | null {
  if (!isBrowser()) return null;

  try {
    return safeString(
      window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION),
    );
  } catch {
    return null;
  }
}

function setActiveApplicationId(applicationId: string | null): void {
  if (!isBrowser()) return;

  try {
    if (applicationId) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION,
        applicationId,
      );
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION);
    }
  } catch {
    // Non-fatal by design.
  }
}

function buildDraftKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_DRAFT_PREFIX}${applicationId}`
    : STORAGE_KEYS.draft;
}

function buildRecoveryKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_RECOVERY_PREFIX}${applicationId}`
    : STORAGE_KEYS.recovery;
}

function buildDraftLastSavedKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_DRAFT_PREFIX}${applicationId}:last-saved`
    : STORAGE_KEYS.draftLastSaved;
}

function buildRecoveryLastSavedKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_RECOVERY_PREFIX}${applicationId}:last-saved`
    : STORAGE_KEYS.recoveryLastSaved;
}

function buildDraftMetadataKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_DRAFT_PREFIX}${applicationId}:metadata`
    : STORAGE_KEYS.draftMetadata;
}

function buildRecoveryMetadataKey(applicationId: string | null): string {
  return applicationId
    ? `${LOCAL_STORAGE_KEYS.APPLICATION_RECOVERY_PREFIX}${applicationId}:metadata`
    : STORAGE_KEYS.recoveryMetadata;
}

function serializeJson(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): boolean {
  if (!isBrowser()) return false;

  try {
    const size = getByteLength(value);
    if (size > PERSISTENCE.MAX_LOCAL_DRAFT_BYTES) {
      console.warn(
        `[Cirglob Cache] Refusing to write oversized payload for ${key}.`,
      );
      return false;
    }

    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(
      "[Cirglob Cache] Failed to write local storage:",
      getErrorMessage(error),
    );
    return false;
  }
}

function writeJson(key: string, value: unknown): boolean {
  const serialized = serializeJson(value);

  if (serialized === null) {
    console.error(`[Cirglob Cache] Failed to serialize payload for ${key}.`);
    return false;
  }

  return writeRaw(key, serialized);
}

function removeKey(key: string): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Non-fatal by design.
  }
}

function dispatchCacheEvent(name: string): void {
  if (!isBrowser()) return;

  try {
    window.dispatchEvent(new Event(name));
  } catch {
    // Non-fatal by design.
  }
}

function extractProgress(state: unknown): number | null {
  if (!state || typeof state !== "object") return null;

  const candidate = (state as { progress?: unknown }).progress;
  const progress = safeNumber(candidate);

  if (progress === null) return null;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

function extractApplicationIdFromState(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;

  const candidate = (state as { applicationId?: unknown }).applicationId;
  return normalizeApplicationId(candidate as string | null | undefined);
}

function createEnvelope<T>(
  applicationId: string | null,
  value: T,
  progress: number | null,
): ApplicationCacheEnvelope<T> {
  const timestamp = now();

  return {
    schemaVersion: 1,
    applicationId,
    savedAt: timestamp,
    updatedAt: timestamp,
    progress,
    value,
  };
}

function isEnvelope<T = unknown>(
  value: unknown,
): value is ApplicationCacheEnvelope<T> {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ApplicationCacheEnvelope<T>>;

  return (
    candidate.schemaVersion === 1 &&
    "value" in candidate &&
    "savedAt" in candidate &&
    "updatedAt" in candidate
  );
}

function readEnvelope<T = unknown>(
  key: string,
): ApplicationCacheEnvelope<T> | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = parseJson<unknown>(raw);

    if (parsed === null) return null;
    if (isEnvelope<T>(parsed)) return parsed;

    return null;
  } catch {
    return null;
  }
}

function readMaybeDraft<T = unknown>(key: string): T | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    return parseJson<T>(raw);
  } catch {
    return null;
  }
}

function isStale(timestamp: number | null, ttlMs: number): boolean {
  if (timestamp === null) return false;
  return now() - timestamp > ttlMs;
}

function readLastSavedAt(
  applicationId: string | null,
  scope: "draft" | "recovery",
): number | null {
  const scopedKey =
    scope === "draft"
      ? buildDraftLastSavedKey(applicationId)
      : buildRecoveryLastSavedKey(applicationId);

  return safeNumber(isBrowser() ? window.localStorage.getItem(scopedKey) : null);
}

function collectScopedKeys(applicationId: string | null): string[] {
  return [
    buildDraftKey(applicationId),
    buildRecoveryKey(applicationId),
    buildDraftLastSavedKey(applicationId),
    buildRecoveryLastSavedKey(applicationId),
    buildDraftMetadataKey(applicationId),
    buildRecoveryMetadataKey(applicationId),
  ];
}

/**
 * =========================================================
 * LEGACY / COMPATIBILITY HELPERS
 * =========================================================
 */

export function saveApplyState(
  state: unknown,
  applicationId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ??
    extractApplicationIdFromState(state) ??
    getActiveApplicationId();

  const progress = extractProgress(state);
  const envelope = createEnvelope(resolvedApplicationId, state, progress);

  const wroteScopedDraft = writeJson(
    buildDraftKey(resolvedApplicationId),
    envelope,
  );
  const wroteDraftLastSaved = writeRaw(
    buildDraftLastSavedKey(resolvedApplicationId),
    String(envelope.savedAt),
  );
  const wroteDraftMetadata = writeJson(
    buildDraftMetadataKey(resolvedApplicationId),
    {
      applicationId: resolvedApplicationId,
      savedAt: envelope.savedAt,
      updatedAt: envelope.updatedAt,
      progress: envelope.progress,
    },
  );

  if (wroteScopedDraft || wroteDraftLastSaved || wroteDraftMetadata) {
    try {
      if (resolvedApplicationId) {
        setActiveApplicationId(resolvedApplicationId);
      }

      dispatchCacheEvent(APPLICATION_CACHE_EVENTS.UPDATED);
    } catch (error) {
      console.error(
        "[Cirglob Cache] Failed to update draft timestamps:",
        getErrorMessage(error),
      );
    }
  }
}

export function loadApplyState<T = unknown>(
  applicationId?: string | null,
): T | null {
  if (!isBrowser()) return null;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const scopedEnvelope = readEnvelope<T>(buildDraftKey(resolvedApplicationId));

  if (scopedEnvelope) return scopedEnvelope.value;

  return null;
}

export function updateCachedProgressEnvelope(
  progress: number,
  applicationId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const normalized = Math.max(0, Math.min(100, Math.round(progress)));
  const timestamp = now();

  const draftEnvelope = readEnvelope(
    buildDraftKey(resolvedApplicationId),
  );
  const recoveryEnvelope = draftEnvelope
    ? null
    : readEnvelope(buildRecoveryKey(resolvedApplicationId));
  const targetEnvelope = draftEnvelope ?? recoveryEnvelope;

  if (!targetEnvelope) return;

  const isDraft = Boolean(draftEnvelope);
  const targetKey = isDraft
    ? buildDraftKey(resolvedApplicationId)
    : buildRecoveryKey(resolvedApplicationId);
  const lastSavedKey = isDraft
    ? buildDraftLastSavedKey(resolvedApplicationId)
    : buildRecoveryLastSavedKey(resolvedApplicationId);
  const metadataKey = isDraft
    ? buildDraftMetadataKey(resolvedApplicationId)
    : buildRecoveryMetadataKey(resolvedApplicationId);

  const updatedEnvelope = {
    ...targetEnvelope,
    savedAt: timestamp,
    updatedAt: timestamp,
    progress: normalized,
  };

  const wroteEnvelope = writeJson(targetKey, updatedEnvelope);
  const wroteLastSaved = writeRaw(lastSavedKey, String(timestamp));
  const wroteMetadata = writeJson(metadataKey, {
    applicationId: resolvedApplicationId,
    savedAt: timestamp,
    updatedAt: timestamp,
    progress: normalized,
  });

  if (wroteEnvelope || wroteLastSaved || wroteMetadata) {
    if (resolvedApplicationId) {
      setActiveApplicationId(resolvedApplicationId);
    }

    dispatchCacheEvent(APPLICATION_CACHE_EVENTS.UPDATED);
  }
}

export function loadProgress(applicationId?: string | null): number {
  if (!isBrowser()) return 0;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const draftEnvelope = readEnvelope<unknown>(
    buildDraftKey(resolvedApplicationId),
  );
  const draftProgress = draftEnvelope?.progress;
  if (typeof draftProgress === "number") {
    return Math.max(0, Math.min(100, Math.round(draftProgress)));
  }

  const recoveryEnvelope = readEnvelope<unknown>(
    buildRecoveryKey(resolvedApplicationId),
  );
  const recoveryProgress = recoveryEnvelope?.progress;
  if (typeof recoveryProgress === "number") {
    return Math.max(0, Math.min(100, Math.round(recoveryProgress)));
  }

  return 0;
}

export function saveApplyRecovery(
  state: unknown,
  applicationId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ??
    extractApplicationIdFromState(state) ??
    getActiveApplicationId();

  const progress = extractProgress(state);
  const envelope = createEnvelope(resolvedApplicationId, state, progress);

  const wroteRecovery = writeJson(
    buildRecoveryKey(resolvedApplicationId),
    envelope,
  );
  const wroteRecoveryLastSaved = writeRaw(
    buildRecoveryLastSavedKey(resolvedApplicationId),
    String(envelope.savedAt),
  );
  const wroteRecoveryMetadata = writeJson(
    buildRecoveryMetadataKey(resolvedApplicationId),
    {
      applicationId: resolvedApplicationId,
      savedAt: envelope.savedAt,
      updatedAt: envelope.updatedAt,
      progress: envelope.progress,
    },
  );

  if (wroteRecovery || wroteRecoveryLastSaved || wroteRecoveryMetadata) {
    if (resolvedApplicationId) {
      setActiveApplicationId(resolvedApplicationId);
    }

    dispatchCacheEvent(APPLICATION_CACHE_EVENTS.UPDATED);
  }
}

export function loadApplyRecovery<T = unknown>(
  applicationId?: string | null,
): T | null {
  if (!isBrowser()) return null;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const envelope = readEnvelope<T>(buildRecoveryKey(resolvedApplicationId));

  if (envelope) return envelope.value;

  return null;
}

export function clearApplyRecovery(applicationId?: string | null): void {
  if (!isBrowser()) return;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  removeKey(buildRecoveryKey(resolvedApplicationId));
  removeKey(buildRecoveryLastSavedKey(resolvedApplicationId));
  removeKey(buildRecoveryMetadataKey(resolvedApplicationId));
  dispatchCacheEvent(APPLICATION_CACHE_EVENTS.CLEARED);
}

export function clearApplyState(applicationId?: string | null): void {
  if (!isBrowser()) return;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const keys = Array.from(
    new Set([
      STORAGE_KEYS.draft,
      STORAGE_KEYS.recovery,
      STORAGE_KEYS.draftLastSaved,
      STORAGE_KEYS.recoveryLastSaved,
      STORAGE_KEYS.draftMetadata,
      STORAGE_KEYS.recoveryMetadata,
      buildDraftKey(null),
      buildRecoveryKey(null),
      buildDraftLastSavedKey(null),
      buildRecoveryLastSavedKey(null),
      buildDraftMetadataKey(null),
      buildRecoveryMetadataKey(null),
      buildDraftKey(resolvedApplicationId),
      buildRecoveryKey(resolvedApplicationId),
      buildDraftLastSavedKey(resolvedApplicationId),
      buildRecoveryLastSavedKey(resolvedApplicationId),
      buildDraftMetadataKey(resolvedApplicationId),
      buildRecoveryMetadataKey(resolvedApplicationId),
      LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION,
    ]),
  );

  for (const key of keys) {
    removeKey(key);
  }

  dispatchCacheEvent(APPLICATION_CACHE_EVENTS.CLEARED);
}

/**
 * =========================================================
 * HIGHER-LEVEL CACHE OPERATIONS
 * =========================================================
 */

export function getCachedApplySummary(
  applicationId?: string | null,
): ApplicationCacheSummary {
  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  const scopedEnvelope = isBrowser()
    ? readEnvelope<unknown>(buildDraftKey(resolvedApplicationId))
    : null;

  const recoveryEnvelope = isBrowser()
    ? readEnvelope<unknown>(buildRecoveryKey(resolvedApplicationId))
    : null;

  const progress = loadProgress(resolvedApplicationId);

  const lastSavedAt =
    readLastSavedAt(resolvedApplicationId, "draft") ??
    scopedEnvelope?.savedAt ??
    readLastSavedAt(resolvedApplicationId, "recovery") ??
    recoveryEnvelope?.savedAt ??
    null;

  return {
    applicationId: resolvedApplicationId,
    hasDraft: scopedEnvelope !== null,
    hasRecovery: recoveryEnvelope !== null,
    progress,
    lastSavedAt,
  };
}

export function hasApplyCache(applicationId?: string | null): boolean {
  const summary = getCachedApplySummary(applicationId);
  return summary.hasDraft || summary.hasRecovery;
}

export function getLastSavedAt(applicationId?: string | null): number | null {
  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  return (
    readLastSavedAt(resolvedApplicationId, "draft") ??
    readEnvelope<unknown>(buildDraftKey(resolvedApplicationId))?.savedAt ??
    readLastSavedAt(resolvedApplicationId, "recovery") ??
    readEnvelope<unknown>(buildRecoveryKey(resolvedApplicationId))?.savedAt ??
    null
  );
}

export function setLastActiveApplication(applicationId: string | null): void {
  setActiveApplicationId(normalizeApplicationId(applicationId));
}

export function getLastActiveApplication(): string | null {
  return getActiveApplicationId();
}

export function cleanupStaleApplyCache(
  applicationId?: string | null,
  ttlMs: number = AUTOSAVE.RECOVERY_TTL_MS,
): number {
  if (!isBrowser()) return 0;

  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  let removed = 0;
  let removeActivePointer = false;

  try {
    const draftEnvelope = readEnvelope<unknown>(
      buildDraftKey(resolvedApplicationId),
    );
    const draftSavedAt =
      readLastSavedAt(resolvedApplicationId, "draft") ??
      draftEnvelope?.savedAt ??
      null;

    if (isStale(draftSavedAt, ttlMs)) {
      removeKey(buildDraftKey(resolvedApplicationId));
      removeKey(buildDraftLastSavedKey(resolvedApplicationId));
      removeKey(buildDraftMetadataKey(resolvedApplicationId));
      removed += 3;
      removeActivePointer = true;
    }

    const recoveryEnvelope = readEnvelope<unknown>(
      buildRecoveryKey(resolvedApplicationId),
    );
    const recoverySavedAt =
      readLastSavedAt(resolvedApplicationId, "recovery") ??
      recoveryEnvelope?.savedAt ??
      null;

    if (isStale(recoverySavedAt, ttlMs)) {
      removeKey(buildRecoveryKey(resolvedApplicationId));
      removeKey(buildRecoveryLastSavedKey(resolvedApplicationId));
      removeKey(buildRecoveryMetadataKey(resolvedApplicationId));
      removed += 3;
    }

    if (removeActivePointer) {
      removeKey(LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION);
    }
  } catch (error) {
    console.error(
      "[Cirglob Cache] Failed to clean stale cache:",
      getErrorMessage(error),
    );
  }

  if (removed > 0) {
    dispatchCacheEvent(APPLICATION_CACHE_EVENTS.CLEANED);
  }

  return removed;
}
export function listApplyCacheKeys(
  applicationId?: string | null,
): readonly string[] {
  const resolvedApplicationId =
    normalizeApplicationId(applicationId) ?? getActiveApplicationId();

  return Array.from(
    new Set([
      STORAGE_KEYS.draft,
      STORAGE_KEYS.recovery,
      STORAGE_KEYS.draftLastSaved,
      STORAGE_KEYS.recoveryLastSaved,
      STORAGE_KEYS.draftMetadata,
      STORAGE_KEYS.recoveryMetadata,
      LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION,
      ...collectScopedKeys(resolvedApplicationId),
    ]),
  ) as readonly string[];
}

export function onApplyCacheChange(handler: () => void): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const listener = () => handler();

  window.addEventListener("storage", listener);
  window.addEventListener(APPLICATION_CACHE_EVENTS.UPDATED, listener);
  window.addEventListener(APPLICATION_CACHE_EVENTS.CLEARED, listener);
  window.addEventListener(APPLICATION_CACHE_EVENTS.CLEANED, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(APPLICATION_CACHE_EVENTS.UPDATED, listener);
    window.removeEventListener(APPLICATION_CACHE_EVENTS.CLEARED, listener);
    window.removeEventListener(APPLICATION_CACHE_EVENTS.CLEANED, listener);
  };
}