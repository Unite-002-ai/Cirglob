"use client";

import { AUTOSAVE, PERSISTENCE } from "../constants";

/**
 * =========================================================
 * CIRGLOB — FOUNDER PROFILE CACHE LAYER
 * =========================================================
 *
 * Purpose:
 * Local persistence runtime for founder-profile draft hydration,
 * recovery, and cache cleanup.
 *
 * Responsibilities:
 * - founder-profile draft persistence
 * - founder-profile recovery persistence
 * - last-saved tracking
 * - stale cache cleanup
 * - deterministic local storage naming
 * - cache change notifications
 *
 * Non-responsibilities:
 * - auth/session logic
 * - validation orchestration
 * - UI rendering
 * - direct Supabase access
 * - remote persistence orchestration
 * - application draft persistence
 *
 * This module is browser-safe and intended for client runtime use.
 */

export const STORAGE_KEYS = {
  draft: "cirglob-founder-profile-draft",
  recovery: "cirglob-founder-profile-recovery",
  draftLastSaved: "cirglob-founder-profile-draft-last-saved",
  recoveryLastSaved: "cirglob-founder-profile-recovery-last-saved",
  draftMetadata: "cirglob-founder-profile-draft-metadata",
  recoveryMetadata: "cirglob-founder-profile-recovery-metadata",
  activeFounderProfile: "cirglob:last-active-founder-profile",
} as const;

export const FOUNDER_PROFILE_CACHE_EVENTS = {
  UPDATED: "cirglob:founder-profile-cache-updated",
  CLEARED: "cirglob:founder-profile-cache-cleared",
  CLEANED: "cirglob:founder-profile-cache-cleaned",
} as const;

export type FounderProfileCacheEnvelope<T = unknown> = {
  schemaVersion: 1;
  founderProfileId: string | null;
  savedAt: number;
  updatedAt: number;
  progress: number | null;
  value: T;
};

export type FounderProfileCacheSummary = {
  founderProfileId: string | null;
  hasDraft: boolean;
  hasRecovery: boolean;
  progress: number;
  lastSavedAt: number | null;
};

export const PROFILE_DRAFT_STORAGE_KEY = STORAGE_KEYS.draft;

export type FounderProfileDraftStorage = {
  version: 1;
  profile: unknown;
  lastSavedAt: string;
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
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown founder-profile cache error.";
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

function normalizeFounderProfileId(
  founderProfileId?: string | null,
): string | null {
  return safeString(founderProfileId);
}

function getActiveFounderProfileId(): string | null {
  if (!isBrowser()) return null;

  try {
    return safeString(
      window.localStorage.getItem(STORAGE_KEYS.activeFounderProfile),
    );
  } catch {
    return null;
  }
}

function setActiveFounderProfileId(founderProfileId: string | null): void {
  if (!isBrowser()) return;

  try {
    if (founderProfileId) {
      window.localStorage.setItem(
        STORAGE_KEYS.activeFounderProfile,
        founderProfileId,
      );
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.activeFounderProfile);
    }
  } catch {
    // Non-fatal by design.
  }
}

function buildDraftKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.draft}:${founderProfileId}`
    : STORAGE_KEYS.draft;
}

function buildRecoveryKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.recovery}:${founderProfileId}`
    : STORAGE_KEYS.recovery;
}

function buildDraftLastSavedKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.draftLastSaved}:${founderProfileId}`
    : STORAGE_KEYS.draftLastSaved;
}

function buildRecoveryLastSavedKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.recoveryLastSaved}:${founderProfileId}`
    : STORAGE_KEYS.recoveryLastSaved;
}

function buildDraftMetadataKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.draftMetadata}:${founderProfileId}`
    : STORAGE_KEYS.draftMetadata;
}

function buildRecoveryMetadataKey(founderProfileId: string | null): string {
  return founderProfileId
    ? `${STORAGE_KEYS.recoveryMetadata}:${founderProfileId}`
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
        `[Cirglob Founder Profile Cache] Refusing to write oversized payload for ${key}.`,
      );
      return false;
    }

    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(
      "[Cirglob Founder Profile Cache] Failed to write local storage:",
      getErrorMessage(error),
    );
    return false;
  }
}

function writeJson(key: string, value: unknown): boolean {
  const serialized = serializeJson(value);

  if (serialized === null) {
    console.error(
      `[Cirglob Founder Profile Cache] Failed to serialize payload for ${key}.`,
    );
    return false;
  }

  return writeRaw(key, serialized);
}

function removeKey(key: string): boolean {
  if (!isBrowser()) return false;

  try {
    const existed = window.localStorage.getItem(key) !== null;
    window.localStorage.removeItem(key);
    return existed;
  } catch {
    return false;
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

function extractFounderProfileIdFromState(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;

  const candidate = (state as { founderProfileId?: unknown }).founderProfileId;
  return normalizeFounderProfileId(candidate as string | null | undefined);
}

function extractProgress(state: unknown): number | null {
  if (!state || typeof state !== "object") return null;

  const candidate = (state as { progress?: unknown }).progress;
  const progress = safeNumber(candidate);

  if (progress === null) return null;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

function createEnvelope<T>(
  founderProfileId: string | null,
  value: T,
  progress: number | null,
): FounderProfileCacheEnvelope<T> {
  const timestamp = now();

  return {
    schemaVersion: 1,
    founderProfileId,
    savedAt: timestamp,
    updatedAt: timestamp,
    progress,
    value,
  };
}

function isEnvelope<T = unknown>(
  value: unknown,
): value is FounderProfileCacheEnvelope<T> {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<FounderProfileCacheEnvelope<T>>;

  return (
    candidate.schemaVersion === 1 &&
    "value" in candidate &&
    "savedAt" in candidate &&
    "updatedAt" in candidate
  );
}

function readEnvelope<T = unknown>(
  key: string,
): FounderProfileCacheEnvelope<T> | null {
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

function readMaybeRaw<T = unknown>(key: string): T | null {
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

function collectScopedKeys(founderProfileId: string | null): string[] {
  return [
    buildDraftKey(founderProfileId),
    buildRecoveryKey(founderProfileId),
    buildDraftLastSavedKey(founderProfileId),
    buildRecoveryLastSavedKey(founderProfileId),
    buildDraftMetadataKey(founderProfileId),
    buildRecoveryMetadataKey(founderProfileId),
  ];
}

function readLastSavedAt(
  founderProfileId: string | null,
  scope: "draft" | "recovery",
): number | null {
  const scopedKey =
    scope === "draft"
      ? buildDraftLastSavedKey(founderProfileId)
      : buildRecoveryLastSavedKey(founderProfileId);

  return safeNumber(
    isBrowser() ? window.localStorage.getItem(scopedKey) : null,
  );
}

/**
 * =========================================================
 * LEGACY / COMPATIBILITY HELPERS
 * =========================================================
 */

export function setLastActiveFounderProfile(
  founderProfileId: string | null,
): void {
  setActiveFounderProfileId(normalizeFounderProfileId(founderProfileId));
}

export function getLastActiveFounderProfile(): string | null {
  return getActiveFounderProfileId();
}

export function saveFounderProfileState(
  state: unknown,
  founderProfileId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ??
    extractFounderProfileIdFromState(state) ??
    getActiveFounderProfileId();

  const progress = extractProgress(state);
  const envelope = createEnvelope(resolvedFounderProfileId, state, progress);

  const wroteScopedDraft = writeJson(
    buildDraftKey(resolvedFounderProfileId),
    envelope,
  );
  const wroteDraftLastSaved = writeRaw(
    buildDraftLastSavedKey(resolvedFounderProfileId),
    String(envelope.savedAt),
  );
  const wroteDraftMetadata = writeJson(
    buildDraftMetadataKey(resolvedFounderProfileId),
    {
      founderProfileId: resolvedFounderProfileId,
      savedAt: envelope.savedAt,
      updatedAt: envelope.updatedAt,
      progress: envelope.progress,
    },
  );

  if (wroteScopedDraft || wroteDraftLastSaved || wroteDraftMetadata) {
    if (resolvedFounderProfileId) {
      setActiveFounderProfileId(resolvedFounderProfileId);
    }

    dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.UPDATED);
  }
}

export function loadFounderProfileState<T = unknown>(
  founderProfileId?: string | null,
): T | null {
  if (!isBrowser()) return null;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  const scopedEnvelope = readEnvelope<T>(
    buildDraftKey(resolvedFounderProfileId),
  );

  if (scopedEnvelope) return scopedEnvelope.value;

  return null;
}

export function saveFounderProfileRecovery(
  state: unknown,
  founderProfileId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ??
    extractFounderProfileIdFromState(state) ??
    getActiveFounderProfileId();

  const progress = extractProgress(state);
  const envelope = createEnvelope(resolvedFounderProfileId, state, progress);

  const wroteRecovery = writeJson(
    buildRecoveryKey(resolvedFounderProfileId),
    envelope,
  );
  const wroteRecoveryLastSaved = writeRaw(
    buildRecoveryLastSavedKey(resolvedFounderProfileId),
    String(envelope.savedAt),
  );
  const wroteRecoveryMetadata = writeJson(
    buildRecoveryMetadataKey(resolvedFounderProfileId),
    {
      founderProfileId: resolvedFounderProfileId,
      savedAt: envelope.savedAt,
      updatedAt: envelope.updatedAt,
      progress: envelope.progress,
    },
  );

  if (wroteRecovery || wroteRecoveryLastSaved || wroteRecoveryMetadata) {
    if (resolvedFounderProfileId) {
      setActiveFounderProfileId(resolvedFounderProfileId);
    }

    dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.UPDATED);
  }
}

export function loadFounderProfileRecovery<T = unknown>(
  founderProfileId?: string | null,
): T | null {
  if (!isBrowser()) return null;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  const envelope = readEnvelope<T>(
    buildRecoveryKey(resolvedFounderProfileId),
  );

  if (envelope) return envelope.value;

  return readMaybeRaw<T>(buildRecoveryKey(resolvedFounderProfileId));
}

export function clearFounderProfileRecovery(
  founderProfileId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  removeKey(buildRecoveryKey(resolvedFounderProfileId));
  removeKey(buildRecoveryLastSavedKey(resolvedFounderProfileId));
  removeKey(buildRecoveryMetadataKey(resolvedFounderProfileId));
  dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.CLEARED);
}

export function clearFounderProfileState(
  founderProfileId?: string | null,
): void {
  if (!isBrowser()) return;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  const keys = [
    buildDraftKey(resolvedFounderProfileId),
    buildRecoveryKey(resolvedFounderProfileId),
    buildDraftLastSavedKey(resolvedFounderProfileId),
    buildRecoveryLastSavedKey(resolvedFounderProfileId),
    buildDraftMetadataKey(resolvedFounderProfileId),
    buildRecoveryMetadataKey(resolvedFounderProfileId),
  ];

  for (const key of keys) {
    removeKey(key);
  }

  const activeFounderProfileId = getActiveFounderProfileId();
  if (
    !founderProfileId ||
    activeFounderProfileId === resolvedFounderProfileId
  ) {
    removeKey(STORAGE_KEYS.activeFounderProfile);
  }

  dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.CLEARED);
}

export function getCachedFounderProfileSummary(
  founderProfileId?: string | null,
): FounderProfileCacheSummary {
  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  const scopedEnvelope = isBrowser()
    ? readEnvelope<unknown>(buildDraftKey(resolvedFounderProfileId))
    : null;

  const recoveryEnvelope = isBrowser()
    ? readEnvelope<unknown>(buildRecoveryKey(resolvedFounderProfileId))
    : null;

  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(scopedEnvelope?.progress ?? recoveryEnvelope?.progress ?? 0),
    ),
  );

  const lastSavedAt =
    readLastSavedAt(resolvedFounderProfileId, "draft") ??
    readLastSavedAt(resolvedFounderProfileId, "recovery") ??
    scopedEnvelope?.savedAt ??
    recoveryEnvelope?.savedAt ??
    null;

  return {
    founderProfileId: resolvedFounderProfileId,
    hasDraft: scopedEnvelope !== null,
    hasRecovery: recoveryEnvelope !== null,
    progress,
    lastSavedAt,
  };
}

export function hasFounderProfileCache(
  founderProfileId?: string | null,
): boolean {
  const summary = getCachedFounderProfileSummary(founderProfileId);
  return summary.hasDraft || summary.hasRecovery;
}

export function getFounderProfileLastSavedAt(
  founderProfileId?: string | null,
): number | null {
  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  return (
    readLastSavedAt(resolvedFounderProfileId, "draft") ??
    readLastSavedAt(resolvedFounderProfileId, "recovery")
  );
}

export function cleanupStaleFounderProfileCache(
  founderProfileId?: string | null,
  ttlMs: number = AUTOSAVE.RECOVERY_TTL_MS,
): number {
  if (!isBrowser()) return 0;

  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  let removed = 0;

  const removeDraftArtifacts = (): number => {
    let count = 0;

    if (removeKey(buildDraftKey(resolvedFounderProfileId))) count += 1;
    if (removeKey(buildDraftLastSavedKey(resolvedFounderProfileId))) count += 1;
    if (removeKey(buildDraftMetadataKey(resolvedFounderProfileId))) count += 1;

    return count;
  };

  const removeRecoveryArtifacts = (): number => {
    let count = 0;

    if (removeKey(buildRecoveryKey(resolvedFounderProfileId))) count += 1;
    if (removeKey(buildRecoveryLastSavedKey(resolvedFounderProfileId))) count += 1;
    if (removeKey(buildRecoveryMetadataKey(resolvedFounderProfileId))) count += 1;

    return count;
  };

  try {
    const draftEnvelope = readEnvelope<unknown>(
      buildDraftKey(resolvedFounderProfileId),
    );
    const draftSavedAt =
      draftEnvelope?.savedAt ??
      safeNumber(
        window.localStorage.getItem(
          buildDraftLastSavedKey(resolvedFounderProfileId),
        ),
      );

    if (isStale(draftSavedAt, ttlMs)) {
      removed += removeDraftArtifacts();
    }

    const recoveryEnvelope = readEnvelope<unknown>(
      buildRecoveryKey(resolvedFounderProfileId),
    );
    const recoverySavedAt =
      recoveryEnvelope?.savedAt ??
      safeNumber(
        window.localStorage.getItem(
          buildRecoveryLastSavedKey(resolvedFounderProfileId),
        ),
      );

    if (isStale(recoverySavedAt, ttlMs)) {
      removed += removeRecoveryArtifacts();
    }
  } catch (error) {
    console.error(
      "[Cirglob Founder Profile Cache] Failed to clean stale cache:",
      getErrorMessage(error),
    );
  }

  if (
    removed > 0 &&
    resolvedFounderProfileId &&
    getActiveFounderProfileId() === resolvedFounderProfileId
  ) {
    removeKey(STORAGE_KEYS.activeFounderProfile);
    dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.CLEANED);
    return removed;
  }

  if (removed > 0) {
    dispatchCacheEvent(FOUNDER_PROFILE_CACHE_EVENTS.CLEANED);
  }

  return removed;
}

export function listFounderProfileCacheKeys(
  founderProfileId?: string | null,
): readonly string[] {
  const resolvedFounderProfileId =
    normalizeFounderProfileId(founderProfileId) ?? getActiveFounderProfileId();

  return collectScopedKeys(resolvedFounderProfileId) as readonly string[];
}

export function onFounderProfileCacheChange(handler: () => void): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const listener = () => handler();

  window.addEventListener("storage", listener);
  window.addEventListener(FOUNDER_PROFILE_CACHE_EVENTS.UPDATED, listener);
  window.addEventListener(FOUNDER_PROFILE_CACHE_EVENTS.CLEARED, listener);
  window.addEventListener(FOUNDER_PROFILE_CACHE_EVENTS.CLEANED, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(FOUNDER_PROFILE_CACHE_EVENTS.UPDATED, listener);
    window.removeEventListener(FOUNDER_PROFILE_CACHE_EVENTS.CLEARED, listener);
    window.removeEventListener(FOUNDER_PROFILE_CACHE_EVENTS.CLEANED, listener);
  };
}
