"use client";

import {
  AUTOSAVE,
  FOUNDER_PROFILE_SECTION_ORDER,
  PERSISTENCE,
  type FounderProfileSection,
} from "../constants";
import {
  clearApplicationRemoteState,
  syncApplicationSnapshot,
  type ApplicationSyncCoordinatorOptions,
  type ApplicationSyncSnapshot,
  type ApplicationSyncTransport,
} from "../application-sync";
import {
  createCirglobRuntimeError,
  type CirglobRuntimeErrorCode,
} from "./runtime-errors";
import {
  type CirglobRuntimeFlushOptions,
  type CirglobRuntimeListener,
  type CirglobRuntimeMutationOptions,
  type CirglobRuntimeRestoreMode,
  type CirglobRuntimeSeedPolicy,
  type CirglobRuntimeSource,
} from "./runtime-types";
import {
  clearFounderProfileRecovery,
  clearFounderProfileState,
  cleanupStaleFounderProfileCache,
  getCachedFounderProfileSummary,
  getLastActiveFounderProfile,
  loadFounderProfileRecovery,
  loadFounderProfileState,
  saveFounderProfileRecovery,
  saveFounderProfileState,
  setLastActiveFounderProfile,
} from "./founder-profile-cache";
import {
  getFounderProfileProgressSummary,
  validateFounderProfile,
  type FounderProfileSectionSchemaRegistry,
  type FounderProfileValidationResult,
} from "./founder-profile-validation";

export type FounderProfileTrustedAccess = {
  founderProfileId: string | null;
  isAuthenticated: boolean;
  ownsFounderProfile: boolean;
  canEditFounderProfile: boolean;
  source: CirglobRuntimeSource;
  hydrated: boolean;
};

export type CirglobFounderProfileSerializableState = {
  founderProfileId: string | null;
  sections: Partial<Record<FounderProfileSection, unknown>>;
  dirtySections: FounderProfileSection[];
  version: number;
  hydrated: boolean;
  lastSavedAt: number | null;
  lastError: string | null;
  progress: number;
  updatedAt: number;
};

export type CirglobFounderProfileSnapshot = CirglobFounderProfileSerializableState & {
  locked: boolean;
  saving: boolean;
  pendingMutations: number;
  completionPercentage: number;
  completedSections: readonly FounderProfileSection[];
  missingSections: readonly FounderProfileSection[];
  invalidSections: readonly FounderProfileSection[];
  valid: boolean;
  canSubmit: boolean;
  hasValidationErrors: boolean;
  validation: FounderProfileValidationResult;
  ownsFounderProfile: boolean;
  canEditFounderProfile: boolean;
  isAuthenticated: boolean;
  source: CirglobRuntimeSource;
};

export type CirglobFounderProfileStateOptions = {
  founderProfileId?: string | null;
  sections?: Partial<Record<FounderProfileSection, unknown>>;
  validationSchemas?: FounderProfileSectionSchemaRegistry;
  syncTransport?: ApplicationSyncTransport;
  syncOptions?: ApplicationSyncCoordinatorOptions;
  autosaveEnabled?: boolean;
  initialHydrate?: boolean;
  cleanupStaleCache?: boolean;
  restoreMode?: CirglobRuntimeRestoreMode;
  seedPolicy?: CirglobRuntimeSeedPolicy;
  trustedAccess?: FounderProfileTrustedAccess;
};

export type CirglobFounderProfileMutationOptions = CirglobRuntimeMutationOptions;
export type CirglobFounderProfileFlushOptions = CirglobRuntimeFlushOptions;

export type CirglobFounderProfileMutationEntry =
  | {
      kind: "founder-profile-section";
      section: FounderProfileSection;
      previousValue: unknown;
      nextValue: unknown;
      at: number;
    };

type FounderProfileStateListener =
  CirglobRuntimeListener<CirglobFounderProfileSnapshot>;

type SerializableHydrationInput =
  | CirglobFounderProfileSerializableState
  | Partial<CirglobFounderProfileSerializableState>
  | Record<string, unknown>
  | null;

type HydrationChoice = {
  current: CirglobFounderProfileSerializableState;
  committed: CirglobFounderProfileSerializableState;
};

type FounderProfileSerializableSeed = Partial<
  Omit<CirglobFounderProfileSerializableState, "version">
> & {
  version?: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function now(): number {
  return Date.now();
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

function clampProgress(value: unknown): number {
  const numeric = safeNumber(value);
  if (numeric === null) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown founder-profile runtime error.";
  }
}

function normalizeFounderProfileId(value?: string | null): string | null {
  return safeString(value);
}

function normalizeFounderProfileSections(
  input?: Partial<Record<FounderProfileSection, unknown>> | null,
): Partial<Record<FounderProfileSection, unknown>> {
  const result: Partial<Record<FounderProfileSection, unknown>> = {};

  if (!input || typeof input !== "object") return result;

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (!(section in input)) continue;

    const value = input[section];
    if (typeof value === "undefined") continue;
    result[section] = value;
  }

  return result;
}

function normalizeDirtyFounderProfileSections(input: unknown): FounderProfileSection[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<FounderProfileSection>();
  for (const value of input) {
    if (typeof value !== "string") continue;
    if (!FOUNDER_PROFILE_SECTION_ORDER.includes(value as FounderProfileSection)) {
      continue;
    }
    seen.add(value as FounderProfileSection);
  }

  return FOUNDER_PROFILE_SECTION_ORDER.filter((section) => seen.has(section));
}

function createEmptyState(
  founderProfileId: string | null,
): CirglobFounderProfileSerializableState {
  return {
    founderProfileId,
    sections: {},
    dirtySections: [],
    version: 0,
    hydrated: false,
    lastSavedAt: null,
    lastError: null,
    progress: 0,
    updatedAt: now(),
  };
}

function createCommittedSnapshotFrom(
  state: CirglobFounderProfileSerializableState,
): CirglobFounderProfileSerializableState {
  return {
    founderProfileId: state.founderProfileId,
    sections: normalizeFounderProfileSections(state.sections),
    dirtySections: [],
    version: state.version,
    hydrated: true,
    lastSavedAt: state.lastSavedAt,
    lastError: null,
    progress: clampProgress(state.progress),
    updatedAt: state.updatedAt,
  };
}

function cloneSerializableState(
  state: CirglobFounderProfileSerializableState,
): CirglobFounderProfileSerializableState {
  return {
    founderProfileId: state.founderProfileId,
    sections: normalizeFounderProfileSections(state.sections),
    dirtySections: FOUNDER_PROFILE_SECTION_ORDER.filter((section) =>
      state.dirtySections.includes(section),
    ),
    version: state.version,
    hydrated: state.hydrated,
    lastSavedAt: state.lastSavedAt,
    lastError: state.lastError,
    progress: clampProgress(state.progress),
    updatedAt: state.updatedAt,
  };
}

function syncProgressFromSections(
  sections: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry,
): number {
  return getFounderProfileProgressSummary(sections, schemas).completionPercentage;
}

function normalizeSerializableState(
  raw: SerializableHydrationInput,
  expectedFounderProfileId: string | null,
  preserveDirty: boolean,
): CirglobFounderProfileSerializableState | null {
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Partial<CirglobFounderProfileSerializableState> &
    Record<string, unknown>;

  const rawFounderProfileId = normalizeFounderProfileId(input.founderProfileId);

  if (
    expectedFounderProfileId &&
    rawFounderProfileId &&
    rawFounderProfileId !== expectedFounderProfileId
  ) {
    return null;
  }

  return {
    founderProfileId:
      expectedFounderProfileId ?? rawFounderProfileId ?? null,
    sections: normalizeFounderProfileSections(
      input.sections as Partial<Record<FounderProfileSection, unknown>> | null,
    ),
    dirtySections: preserveDirty
      ? normalizeDirtyFounderProfileSections(input.dirtySections)
      : [],
    version: Number.isFinite(Number(input.version)) ? Number(input.version) : 0,
    hydrated: true,
    lastSavedAt:
      input.lastSavedAt === null || input.lastSavedAt === undefined
        ? null
        : safeNumber(input.lastSavedAt),
    lastError: safeString(input.lastError),
    progress: clampProgress(input.progress),
    updatedAt: safeNumber(input.updatedAt) ?? now(),
  };
}

function buildSnapshot(
  state: CirglobFounderProfileSerializableState,
  saving: boolean,
  pendingMutations: number,
  validation: FounderProfileValidationResult,
  trustedAccess: FounderProfileTrustedAccess,
): CirglobFounderProfileSnapshot {
  const missingSections = validation.sectionResults
    .filter((result) => result.required && result.missing)
    .map((result) => result.section);

  const invalidSections = validation.sectionResults
    .filter((result) => !result.valid)
    .map((result) => result.section);

  const completedSections = validation.sectionResults
    .filter((result) => result.valid && !result.missing)
    .map((result) => result.section);

  const hasMatchingFounderProfileId =
    Boolean(state.founderProfileId) &&
    Boolean(trustedAccess.founderProfileId) &&
    state.founderProfileId === trustedAccess.founderProfileId;

  const canEdit =
    hasMatchingFounderProfileId &&
    trustedAccess.canEditFounderProfile &&
    state.hydrated;

  return {
    ...cloneSerializableState(state),
    locked: !hasMatchingFounderProfileId || !canEdit,
    saving,
    pendingMutations,
    completionPercentage: validation.completionPercentage,
    completedSections,
    missingSections,
    invalidSections,
    valid: validation.valid,
    canSubmit: validation.canSubmit && canEdit,
    hasValidationErrors: validation.invalidSections.length > 0,
    validation,
    ownsFounderProfile: trustedAccess.ownsFounderProfile,
    canEditFounderProfile: trustedAccess.canEditFounderProfile,
    isAuthenticated: trustedAccess.isAuthenticated,
    source: trustedAccess.source,
  };
}

function createRuntimeError(
  code: CirglobRuntimeErrorCode,
  message: string,
  details?: Record<string, unknown>,
) {
  return createCirglobRuntimeError(
    code,
    message,
    details ? { details } : undefined,
  );
}

function normalizeTrustedAccess(
  trustedAccess?: Partial<FounderProfileTrustedAccess> | null,
): FounderProfileTrustedAccess {
  return {
    founderProfileId: normalizeFounderProfileId(trustedAccess?.founderProfileId),
    isAuthenticated: trustedAccess?.isAuthenticated === true,
    ownsFounderProfile: trustedAccess?.ownsFounderProfile === true,
    canEditFounderProfile: trustedAccess?.canEditFounderProfile === true,
    source:
      trustedAccess?.source === "secure" ||
      trustedAccess?.source === "cache" ||
      trustedAccess?.source === "unknown"
        ? trustedAccess.source
        : "unknown",
    hydrated: trustedAccess?.hydrated === true,
  };
}

function resolveSelectedState(
  committedState: CirglobFounderProfileSerializableState | null,
  recoveryState: CirglobFounderProfileSerializableState | null,
  restoreMode: CirglobRuntimeRestoreMode,
  seedPolicy: CirglobRuntimeSeedPolicy,
): HydrationChoice | null {
  const commitClean = committedState
    ? createCommittedSnapshotFrom(committedState)
    : null;
  const recoveryClean = recoveryState
    ? createCommittedSnapshotFrom(recoveryState)
    : null;

  if (restoreMode === "empty" || restoreMode === "seed") {
    return null;
  }

  const effectivePolicy: CirglobRuntimeSeedPolicy =
    restoreMode === "recovery"
      ? seedPolicy === "prefer-committed"
        ? "prefer-recovery"
        : seedPolicy
      : seedPolicy;

  if (effectivePolicy === "committed") {
    if (committedState) {
      return {
        current: committedState,
        committed: commitClean ?? committedState,
      };
    }

    if (recoveryState) {
      return {
        current: recoveryState,
        committed: recoveryClean ?? recoveryState,
      };
    }

    return null;
  }

  if (effectivePolicy === "recovery") {
    if (recoveryState) {
      return {
        current: recoveryState,
        committed: commitClean ?? recoveryClean ?? recoveryState,
      };
    }

    if (committedState) {
      return {
        current: committedState,
        committed: commitClean ?? committedState,
      };
    }

    return null;
  }

  if (
    recoveryState &&
    (!committedState || recoveryState.updatedAt >= committedState.updatedAt)
  ) {
    return {
      current: recoveryState,
      committed: commitClean ?? recoveryClean ?? recoveryState,
    };
  }

  if (committedState) {
    return {
      current: committedState,
      committed: commitClean ?? committedState,
    };
  }

  if (recoveryState) {
    return {
      current: recoveryState,
      committed: recoveryClean ?? recoveryState,
    };
  }

  return null;
}

export class CirglobFounderProfileStateManager {
  private founderProfileId: string | null;
  private sections: Partial<Record<FounderProfileSection, unknown>>;
  private dirtySections: Set<FounderProfileSection>;
  private version: number;
  private hydrated: boolean;
  private lastSavedAt: number | null;
  private lastError: string | null;
  private progress: number;
  private updatedAt: number;
  private saving: boolean;
  private pendingMutations: number;
  private mutationJournal: CirglobFounderProfileMutationEntry[];
  private committedSnapshot: CirglobFounderProfileSerializableState;
  private cachedSnapshot: CirglobFounderProfileSnapshot | null = null;
  private autosaveEnabled: boolean;
  private validationSchemas: FounderProfileSectionSchemaRegistry;
  private syncTransport: ApplicationSyncTransport;
  private syncOptions: ApplicationSyncCoordinatorOptions;
  private listeners: Set<FounderProfileStateListener>;
  private autosaveTimer: ReturnType<typeof setTimeout> | null;
  private flushInFlight: Promise<boolean> | null;
  private cleanupStaleCacheOnHydrate: boolean;
  private restoreMode: CirglobRuntimeRestoreMode;
  private seedPolicy: CirglobRuntimeSeedPolicy;
  private trustedAccess: FounderProfileTrustedAccess;

    constructor(options: CirglobFounderProfileStateOptions = {}) {
    this.founderProfileId = normalizeFounderProfileId(options.founderProfileId);
    this.sections = normalizeFounderProfileSections(options.sections);
    this.dirtySections = new Set<FounderProfileSection>();
    this.version = 0;
    this.hydrated = false;
    this.lastSavedAt = null;
    this.lastError = null;
    this.progress = 0;
    this.updatedAt = now();
    this.saving = false;
    this.pendingMutations = 0;
    this.mutationJournal = [];
    this.autosaveEnabled = options.autosaveEnabled ?? true;
    this.validationSchemas = options.validationSchemas ?? {};
    this.syncTransport = options.syncTransport ?? {};
    this.syncOptions = options.syncOptions ?? {};
    this.listeners = new Set();
    this.autosaveTimer = null;
    this.flushInFlight = null;
    this.cleanupStaleCacheOnHydrate = options.cleanupStaleCache ?? true;
    this.restoreMode = options.restoreMode ?? "committed";
    this.seedPolicy =
      options.seedPolicy ??
      (this.restoreMode === "recovery"
        ? "prefer-recovery"
        : "prefer-committed");
    this.trustedAccess = normalizeTrustedAccess(options.trustedAccess);

    this.syncDerivedProgress();
    this.committedSnapshot = createCommittedSnapshotFrom(
      this.getSerializableState(),
    );

    if (options.initialHydrate ?? true) {
      void this.hydrateFromStorage();
    }
  }

  configure(options: Partial<CirglobFounderProfileStateOptions> = {}): void {
    let changed = false;

    if (typeof options.founderProfileId !== "undefined") {
      const nextFounderProfileId = normalizeFounderProfileId(
        options.founderProfileId,
      );

      if (nextFounderProfileId !== this.founderProfileId) {
        this.clearAutosaveTimer();
        this.founderProfileId = nextFounderProfileId;
        this.sections = {};
        this.dirtySections.clear();
        this.version += 1;
        this.hydrated = false;
        this.lastSavedAt = null;
        this.lastError = null;
        this.progress = 0;
        this.updatedAt = now();
        this.saving = false;
        this.pendingMutations = 0;
        this.mutationJournal = [];
        this.trustedAccess = normalizeTrustedAccess({
          ...this.trustedAccess,
          founderProfileId: nextFounderProfileId,
        });
        this.committedSnapshot = createCommittedSnapshotFrom(
          createEmptyState(nextFounderProfileId),
        );
        setLastActiveFounderProfile(nextFounderProfileId);
        changed = true;
      }
    }

    if (options.sections) {
      this.sections = normalizeFounderProfileSections(options.sections);
      this.syncDerivedProgress();
      this.updatedAt = now();
      this.version += 1;
      changed = true;
    }

    if (options.validationSchemas) {
      this.validationSchemas = options.validationSchemas;
      this.syncDerivedProgress();
      this.updatedAt = now();
      this.version += 1;
      changed = true;
    }

    if (options.syncTransport) {
      this.syncTransport = options.syncTransport;
    }

    if (options.syncOptions) {
      this.syncOptions = options.syncOptions;
    }

    if (
      typeof options.autosaveEnabled === "boolean" &&
      options.autosaveEnabled !== this.autosaveEnabled
    ) {
      this.autosaveEnabled = options.autosaveEnabled;
      this.updatedAt = now();
      this.version += 1;
      changed = true;
    }

    if (typeof options.cleanupStaleCache === "boolean") {
      this.cleanupStaleCacheOnHydrate = options.cleanupStaleCache;
    }

    if (options.restoreMode) {
      this.restoreMode = options.restoreMode;
    }

    if (options.seedPolicy) {
      this.seedPolicy = options.seedPolicy;
    }

    if (options.trustedAccess) {
      const nextTrustedAccess = normalizeTrustedAccess(options.trustedAccess);
      const trustedAccessChanged =
        nextTrustedAccess.founderProfileId !== this.trustedAccess.founderProfileId ||
        nextTrustedAccess.isAuthenticated !== this.trustedAccess.isAuthenticated ||
        nextTrustedAccess.ownsFounderProfile !== this.trustedAccess.ownsFounderProfile ||
        nextTrustedAccess.canEditFounderProfile !== this.trustedAccess.canEditFounderProfile ||
        nextTrustedAccess.source !== this.trustedAccess.source ||
        nextTrustedAccess.hydrated !== this.trustedAccess.hydrated;

      this.trustedAccess = nextTrustedAccess;

      if (trustedAccessChanged) {
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    this.committedSnapshot = createCommittedSnapshotFrom(
      this.getSerializableState(),
    );
    this.emit();
  }

  subscribe(listener: FounderProfileStateListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    // Invalidate so the next getSnapshot() recomputes exactly once,
    // then hands back a stable reference until the next real change.
    this.cachedSnapshot = null;
    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(
          "[Cirglob FounderProfile Runtime] Listener error:",
          getErrorMessage(error),
        );
      }
    }
  }


  private markStateChanged(): void {
    this.version += 1;
    this.updatedAt = now();
  }

  private clearAutosaveTimer(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  private hasDirtyChanges(): boolean {
    return this.dirtySections.size > 0;
  }

  private syncDerivedProgress(): void {
    this.progress = syncProgressFromSections(this.sections, this.validationSchemas);
  }

  private createSerializableState(
    overrides: Partial<CirglobFounderProfileSerializableState> = {},
  ): CirglobFounderProfileSerializableState {
    return {
      founderProfileId:
        typeof overrides.founderProfileId === "undefined"
          ? this.founderProfileId
          : overrides.founderProfileId,
      sections:
        typeof overrides.sections === "undefined"
          ? normalizeFounderProfileSections(this.sections)
          : normalizeFounderProfileSections(overrides.sections),
      dirtySections:
        typeof overrides.dirtySections === "undefined"
          ? FOUNDER_PROFILE_SECTION_ORDER.filter((section) =>
              this.dirtySections.has(section),
            )
          : overrides.dirtySections,
      version:
        typeof overrides.version === "undefined" ? this.version : overrides.version,
      hydrated:
        typeof overrides.hydrated === "undefined"
          ? this.hydrated
          : overrides.hydrated,
      lastSavedAt:
        typeof overrides.lastSavedAt === "undefined"
          ? this.lastSavedAt
          : overrides.lastSavedAt,
      lastError:
        typeof overrides.lastError === "undefined"
          ? this.lastError
          : overrides.lastError,
      progress:
        typeof overrides.progress === "undefined"
          ? this.progress
          : clampProgress(overrides.progress),
      updatedAt:
        typeof overrides.updatedAt === "undefined"
          ? this.updatedAt
          : overrides.updatedAt,
    };
  }

  private createCommittedSerializableState(
    base: FounderProfileSerializableSeed = {},
  ): CirglobFounderProfileSerializableState {
    return createCommittedSnapshotFrom({
      founderProfileId:
        typeof base.founderProfileId === "undefined"
          ? this.founderProfileId
          : base.founderProfileId,
      sections:
        typeof base.sections === "undefined"
          ? normalizeFounderProfileSections(this.sections)
          : normalizeFounderProfileSections(base.sections),
      dirtySections: [],
      version: typeof base.version === "number" ? base.version : this.version,
      hydrated: true,
      lastSavedAt:
        typeof base.lastSavedAt === "undefined"
          ? this.lastSavedAt
          : base.lastSavedAt,
      lastError: null,
      progress:
        typeof base.progress === "undefined"
          ? this.progress
          : clampProgress(base.progress),
      updatedAt:
        typeof base.updatedAt === "number" ? base.updatedAt : this.updatedAt,
    });
  }

  private setMutationMeta(): void {
    this.pendingMutations += 1;
    this.lastError = null;
  }

  private finishMutation(): void {
    this.pendingMutations = Math.max(0, this.pendingMutations - 1);
  }

  private recordJournal(entry: CirglobFounderProfileMutationEntry): void {
    this.mutationJournal.push(entry);

    if (this.mutationJournal.length > PERSISTENCE.MAX_PENDING_MUTATIONS) {
      this.mutationJournal.shift();
    }
  }

  private async persistCommittedSnapshot(
    committedSnapshot: CirglobFounderProfileSerializableState,
    founderProfileId: string | null,
  ): Promise<void> {
    await Promise.resolve(
      saveFounderProfileState(committedSnapshot, founderProfileId),
    );
    await Promise.resolve(clearFounderProfileRecovery(founderProfileId));
    await Promise.resolve(setLastActiveFounderProfile(founderProfileId));
  }

  private async persistRecoverySnapshot(
    snapshot: CirglobFounderProfileSerializableState,
    founderProfileId: string | null,
  ): Promise<void> {
    await Promise.resolve(saveFounderProfileRecovery(snapshot, founderProfileId));
  }

  private buildSyncSnapshot(): ApplicationSyncSnapshot & {
    founderProfileSections: Partial<Record<FounderProfileSection, unknown>>;
    dirtyFounderProfileSections: FounderProfileSection[];
  } {
    return {
      applicationId: this.founderProfileId,
      sections: {},
      founderProfileSections: normalizeFounderProfileSections(this.sections),
      dirtySections: [],
      dirtyFounderProfileSections: FOUNDER_PROFILE_SECTION_ORDER.filter((section) =>
        this.dirtySections.has(section),
      ),
      version: this.version,
      updatedAt: this.updatedAt,
    };
  }

    async hydrateFromStorage(
    founderProfileId?: string | null,
  ): Promise<CirglobFounderProfileSnapshot> {
    const resolvedFounderProfileId =
      normalizeFounderProfileId(founderProfileId) ?? this.founderProfileId;

    if (this.restoreMode === "empty") {
      this.founderProfileId = resolvedFounderProfileId;
      this.sections = {};
      this.dirtySections.clear();
      this.lastSavedAt = null;
      this.lastError = null;
      this.hydrated = true;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        founderProfileId: this.founderProfileId,
        sections: {},
        dirtySections: [],
        hydrated: true,
        lastSavedAt: null,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveFounderProfile(this.founderProfileId);
      this.emit();
      return this.getSnapshot();
    }

    if (this.restoreMode === "seed") {
      this.founderProfileId = resolvedFounderProfileId;
      this.hydrated = true;
      this.lastError = null;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        founderProfileId: this.founderProfileId,
        sections: this.sections,
        dirtySections: [],
        hydrated: true,
        lastSavedAt: this.lastSavedAt,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveFounderProfile(this.founderProfileId);
      this.emit();
      return this.getSnapshot();
    }

    if (resolvedFounderProfileId && this.cleanupStaleCacheOnHydrate) {
      cleanupStaleFounderProfileCache(resolvedFounderProfileId);
    }

    const summary = resolvedFounderProfileId
      ? getCachedFounderProfileSummary(resolvedFounderProfileId)
      : null;

    const committedRaw =
      resolvedFounderProfileId && summary?.hasDraft
        ? loadFounderProfileState<SerializableHydrationInput>(
            resolvedFounderProfileId,
          )
        : null;

    const recoveryRaw =
      resolvedFounderProfileId && summary?.hasRecovery
        ? loadFounderProfileRecovery<SerializableHydrationInput>(
            resolvedFounderProfileId,
          )
        : null;

    const committed = normalizeSerializableState(
      committedRaw,
      resolvedFounderProfileId,
      false,
    );
    const recovery = normalizeSerializableState(
      recoveryRaw,
      resolvedFounderProfileId,
      true,
    );

    const choice = resolveSelectedState(
      committed,
      recovery,
      this.restoreMode,
      this.seedPolicy,
    );

    if (!choice) {
      this.founderProfileId = resolvedFounderProfileId;
      this.hydrated = true;
      this.lastError = null;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        founderProfileId: this.founderProfileId,
        sections: this.sections,
        dirtySections: [],
        hydrated: true,
        lastSavedAt: this.lastSavedAt,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveFounderProfile(this.founderProfileId);
      this.emit();
      return this.getSnapshot();
    }

    this.founderProfileId = choice.current.founderProfileId;
    this.sections = normalizeFounderProfileSections(choice.current.sections);
    this.dirtySections = new Set(choice.current.dirtySections);
    this.version = Math.max(this.version, choice.current.version);
    this.hydrated = true;
    this.lastSavedAt = choice.current.lastSavedAt;
    this.lastError = choice.current.lastError;
    this.updatedAt = now();
    this.syncDerivedProgress();
    this.committedSnapshot = choice.committed;
    setLastActiveFounderProfile(this.founderProfileId);
    this.emit();
    return this.getSnapshot();
  }

  getSnapshot(): CirglobFounderProfileSnapshot {
    if (this.cachedSnapshot) {
      return this.cachedSnapshot;
    }

    const validation = validateFounderProfile(
      this.sections,
      this.validationSchemas,
    );

    this.cachedSnapshot = buildSnapshot(
      this.createSerializableState(),
      this.saving,
      this.pendingMutations,
      validation,
      this.trustedAccess,
    );

    return this.cachedSnapshot;
  }

  getSerializableState(): CirglobFounderProfileSerializableState {
    return this.createSerializableState();
  }

  getFounderProfileId(): string | null {
    return this.founderProfileId;
  }

  getSections(): Partial<Record<FounderProfileSection, unknown>> {
    return normalizeFounderProfileSections(this.sections);
  }

  getDirtySections(): readonly FounderProfileSection[] {
    return FOUNDER_PROFILE_SECTION_ORDER.filter((section) =>
      this.dirtySections.has(section),
    );
  }

  isHydrated(): boolean {
    return this.hydrated;
  }

  isSaving(): boolean {
    return this.saving;
  }

  getLastSavedAt(): number | null {
    return this.lastSavedAt;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  canEdit(): boolean {
    return this.trustedAccess.canEditFounderProfile && this.hydrated;
  }

  canSubmit(
    schemas: FounderProfileSectionSchemaRegistry = this.validationSchemas,
  ): boolean {
    const validation = validateFounderProfile(this.sections, schemas);
    return (
      validation.canSubmit &&
      this.trustedAccess.canEditFounderProfile &&
      this.hydrated
    );
  }

  getValidationResult(
    schemas: FounderProfileSectionSchemaRegistry = this.validationSchemas,
  ): FounderProfileValidationResult {
    return validateFounderProfile(this.sections, schemas);
  }

  getProgressSummary(
    schemas: FounderProfileSectionSchemaRegistry = this.validationSchemas,
  ): ReturnType<typeof getFounderProfileProgressSummary> {
    return getFounderProfileProgressSummary(this.sections, schemas);
  }

    setFounderProfileId(
    founderProfileId: string | null,
  ): CirglobFounderProfileSnapshot {
    const next = normalizeFounderProfileId(founderProfileId);
    if (next === this.founderProfileId) return this.getSnapshot();

    this.clearAutosaveTimer();
    this.founderProfileId = next;
    this.sections = {};
    this.dirtySections.clear();
    this.version += 1;
    this.hydrated = false;
    this.lastSavedAt = null;
    this.lastError = null;
    this.progress = 0;
    this.updatedAt = now();
    this.saving = false;
    this.pendingMutations = 0;
    this.mutationJournal = [];
    this.trustedAccess = normalizeTrustedAccess({
      ...this.trustedAccess,
      founderProfileId: next,
    });
    this.committedSnapshot = createCommittedSnapshotFrom(createEmptyState(next));
    setLastActiveFounderProfile(this.founderProfileId);
    this.emit();
    return this.getSnapshot();
  }

  setTrustedAccess(
    trustedAccess: Partial<FounderProfileTrustedAccess>,
  ): CirglobFounderProfileSnapshot {
    this.trustedAccess = normalizeTrustedAccess(trustedAccess);
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  setValidationSchemas(
    schemas: FounderProfileSectionSchemaRegistry,
  ): CirglobFounderProfileSnapshot {
    this.validationSchemas = schemas;
    this.syncDerivedProgress();
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  setAutosaveEnabled(enabled: boolean): CirglobFounderProfileSnapshot {
    if (this.autosaveEnabled === enabled) return this.getSnapshot();

    this.autosaveEnabled = enabled;
    if (!enabled) {
      this.clearAutosaveTimer();
    } else if (this.hasDirtyChanges()) {
      this.scheduleAutosave();
    }

    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  setFounderProfileSection(
    section: FounderProfileSection,
    value: unknown,
    options: CirglobFounderProfileMutationOptions = {},
  ): CirglobFounderProfileSnapshot {
    if (!this.canEdit()) return this.getSnapshot();

    const previousValue = this.sections[section];
    if (Object.is(previousValue, value)) return this.getSnapshot();

    this.setMutationMeta();
    try {
      this.recordJournal({
        kind: "founder-profile-section",
        section,
        previousValue,
        nextValue: value,
        at: now(),
      });

      const nextSections = normalizeFounderProfileSections(this.sections);
      if (typeof value === "undefined") {
        delete nextSections[section];
      } else {
        nextSections[section] = value;
      }

      this.sections = nextSections;
      if (options.markDirty !== false) {
        this.dirtySections.add(section);
      }
      this.syncDerivedProgress();
      this.markStateChanged();
      this.lastError = null;
      if (options.autosave !== false && options.markDirty !== false) {
        this.scheduleAutosave();
      }
      this.emit();
    } finally {
      this.finishMutation();
    }

    return this.getSnapshot();
  }

  patchFounderProfileSections(
    partial: Partial<Record<FounderProfileSection, unknown>>,
    options: CirglobFounderProfileMutationOptions = {},
  ): CirglobFounderProfileSnapshot {
    if (!this.canEdit()) return this.getSnapshot();

    let changed = false;

    for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
      if (!(section in partial)) continue;

      const nextValue = partial[section];
      const previousValue = this.sections[section];
      if (Object.is(previousValue, nextValue)) continue;

      this.setMutationMeta();
      try {
        this.recordJournal({
          kind: "founder-profile-section",
          section,
          previousValue,
          nextValue,
          at: now(),
        });

        const nextSections = normalizeFounderProfileSections(this.sections);
        if (typeof nextValue === "undefined") {
          delete nextSections[section];
        } else {
          nextSections[section] = nextValue;
        }

        this.sections = nextSections;
        if (options.markDirty !== false) {
          this.dirtySections.add(section);
        }
        changed = true;
        this.lastError = null;
      } finally {
        this.finishMutation();
      }
    }

    if (!changed) return this.getSnapshot();

    this.syncDerivedProgress();
    this.markStateChanged();
    if (options.autosave !== false && options.markDirty !== false) {
      this.scheduleAutosave();
    }
    this.emit();
    return this.getSnapshot();
  }

  removeFounderProfileSection(
    section: FounderProfileSection,
    options: CirglobFounderProfileMutationOptions = {},
  ): CirglobFounderProfileSnapshot {
    return this.setFounderProfileSection(section, undefined, options);
  }

  replaceFounderProfileState(
    nextSections: Partial<Record<FounderProfileSection, unknown>>,
    options: CirglobFounderProfileMutationOptions = {},
  ): CirglobFounderProfileSnapshot {
    if (!this.canEdit()) return this.getSnapshot();

    const normalizedNext = normalizeFounderProfileSections(nextSections);
    const changedSections = new Set<FounderProfileSection>();

    for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
      const previousValue = this.sections[section];
      const nextValue = normalizedNext[section];
      if (Object.is(previousValue, nextValue)) continue;
      changedSections.add(section);
    }

    if (changedSections.size === 0) return this.getSnapshot();

    this.setMutationMeta();
    try {
      for (const section of changedSections) {
        this.recordJournal({
          kind: "founder-profile-section",
          section,
          previousValue: this.sections[section],
          nextValue: normalizedNext[section],
          at: now(),
        });
      }

      this.sections = normalizedNext;
      if (options.markDirty !== false) {
        for (const section of changedSections) {
          this.dirtySections.add(section);
        }
      }
      this.syncDerivedProgress();
      this.markStateChanged();
      this.lastError = null;
      if (options.autosave !== false && options.markDirty !== false) {
        this.scheduleAutosave();
      }
      this.emit();
    } finally {
      this.finishMutation();
    }

    return this.getSnapshot();
  }

  clearDirtyState(): CirglobFounderProfileSnapshot {
    if (this.dirtySections.size === 0) return this.getSnapshot();

    this.dirtySections.clear();
    this.syncDerivedProgress();
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  rollbackLastMutation(): CirglobFounderProfileSnapshot {
    const entry = this.mutationJournal.pop();

    if (!entry) {
      this.rollbackToCommittedSnapshot();
      return this.getSnapshot();
    }

    this.setMutationMeta();
    try {
      if (entry.previousValue === undefined) {
        delete this.sections[entry.section];
      } else {
        this.sections = {
          ...this.sections,
          [entry.section]: entry.previousValue,
        };
      }

      this.dirtySections.add(entry.section);
      this.syncDerivedProgress();
      this.markStateChanged();
      this.lastError = null;
      if (this.autosaveEnabled) {
        this.scheduleAutosave();
      }
      this.emit();
    } finally {
      this.finishMutation();
    }

    return this.getSnapshot();
  }

  rollbackToCommittedSnapshot(): CirglobFounderProfileSnapshot {
    const committed = cloneSerializableState(this.committedSnapshot);

    this.founderProfileId = committed.founderProfileId;
    this.sections = normalizeFounderProfileSections(committed.sections);
    this.dirtySections = new Set(committed.dirtySections);
    this.version = committed.version + 1;
    this.hydrated = true;
    this.lastSavedAt = committed.lastSavedAt;
    this.lastError = null;
    this.progress = clampProgress(committed.progress);
    this.updatedAt = now();
    this.saving = false;
    this.pendingMutations = 0;
    this.syncDerivedProgress();
    this.emit();

    return this.getSnapshot();
  }

    async flushAutosave(
    options: CirglobFounderProfileFlushOptions = {},
  ): Promise<boolean> {
    if (this.flushInFlight) return this.flushInFlight;

    this.flushInFlight = (async () => {
      const forced = options.force ?? false;
      const allowLockedPersist = options.allowLockedPersist ?? false;
      const rollbackOnFailure = options.rollbackOnFailure ?? false;

      try {
        if (!this.hydrated) {
          await this.hydrateFromStorage();
        }

        if (!this.founderProfileId) {
          this.lastError = createRuntimeError(
            "RUNTIME_PERSISTENCE_FAILED",
            "Founder-profile autosave requires an active founder profile id.",
            {
              reason: options.reason ?? null,
            },
          ).message;
          this.saving = false;
          this.emit();
          return false;
        }

        if (this.trustedAccess.founderProfileId !== this.founderProfileId) {
          this.lastError = createRuntimeError(
            "RUNTIME_PERSISTENCE_FAILED",
            "Trusted access does not match the active founder profile id.",
            {
              reason: options.reason ?? null,
            },
          ).message;
          this.saving = false;
          this.emit();
          return false;
        }

        if (!this.canEdit() && !allowLockedPersist) {
          return true;
        }

        if (!this.hasDirtyChanges() && !forced) {
          return true;
        }

        this.clearAutosaveTimer();
        this.saving = true;
        this.lastError = null;
        this.emit();

        const liveSnapshot = this.createSerializableState({
          hydrated: true,
          lastError: null,
          dirtySections: FOUNDER_PROFILE_SECTION_ORDER.filter((section) =>
            this.dirtySections.has(section),
          ),
          progress: this.progress,
          updatedAt: this.updatedAt,
        });

        await this.persistRecoverySnapshot(liveSnapshot, this.founderProfileId);

        const syncResult = await syncApplicationSnapshot(
          this.syncTransport,
          this.buildSyncSnapshot(),
          this.syncOptions,
        );

        if (!syncResult.ok) {
          const syncError = createRuntimeError(
            "RUNTIME_SYNC_FAILED",
            "Founder-profile autosave sync failed.",
            {
              attempts: syncResult.attempts,
              lastError: syncResult.lastError,
              reason: options.reason ?? null,
            },
          );

          this.lastError = syncError.message;
          this.saving = false;

          if (rollbackOnFailure) {
            const rolledBackSnapshot = this.rollbackToCommittedSnapshot();
            const committed = this.createCommittedSerializableState({
              founderProfileId: rolledBackSnapshot.founderProfileId,
              sections: rolledBackSnapshot.sections,
              dirtySections: [],
              version: rolledBackSnapshot.version,
              hydrated: true,
              lastSavedAt: rolledBackSnapshot.lastSavedAt,
              lastError: null,
              progress: rolledBackSnapshot.progress,
              updatedAt: rolledBackSnapshot.updatedAt,
            });

            this.committedSnapshot = committed;
            await this.persistCommittedSnapshot(committed, this.founderProfileId);
            this.dirtySections.clear();
            this.lastSavedAt = committed.lastSavedAt;
            this.lastError = null;
            this.progress = committed.progress;
            this.syncDerivedProgress();
          } else {
            this.emit();
          }

          return false;
        }

        this.version += 1;
        this.updatedAt = now();

        const committed = this.createCommittedSerializableState({
          hydrated: true,
          dirtySections: [],
          lastError: null,
          lastSavedAt: this.updatedAt,
          updatedAt: this.updatedAt,
          progress: this.progress,
          version: this.version,
        });

        this.dirtySections.clear();
        this.lastSavedAt = committed.lastSavedAt;
        this.lastError = null;
        this.progress = committed.progress;
        this.committedSnapshot = committed;

        await this.persistCommittedSnapshot(committed, this.founderProfileId);
        this.emit();
        return true;
      } catch (error) {
        const runtimeError = createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          "Founder-profile autosave failed.",
          {
            error: getErrorMessage(error),
            reason: options.reason ?? null,
          },
        );
        this.lastError = runtimeError.message;
        this.saving = false;

        if (rollbackOnFailure) {
          const rolledBackSnapshot = this.rollbackToCommittedSnapshot();
          const committed = this.createCommittedSerializableState({
            founderProfileId: rolledBackSnapshot.founderProfileId,
            sections: rolledBackSnapshot.sections,
            dirtySections: [],
            version: rolledBackSnapshot.version,
            hydrated: true,
            lastSavedAt: rolledBackSnapshot.lastSavedAt,
            lastError: null,
            progress: rolledBackSnapshot.progress,
            updatedAt: rolledBackSnapshot.updatedAt,
          });

          this.committedSnapshot = committed;
          await this.persistCommittedSnapshot(committed, this.founderProfileId);
          this.dirtySections.clear();
          this.lastSavedAt = committed.lastSavedAt;
          this.lastError = null;
          this.progress = committed.progress;
          this.syncDerivedProgress();
        }

        this.emit();
        return false;
      } finally {
        this.saving = false;
        this.flushInFlight = null;
      }
    })();

    return this.flushInFlight;
  }

  scheduleFlushNow(reason = "manual"): void {
    this.clearAutosaveTimer();
    void this.flushAutosave({
      force: true,
      allowLockedPersist: true,
      reason,
    });
  }

  private scheduleAutosave(): void {
    if (!this.autosaveEnabled) return;
    if (!isBrowser()) return;
    if (!this.hasDirtyChanges()) return;

    this.clearAutosaveTimer();
    this.autosaveTimer = setTimeout(() => {
      void this.flushAutosave({ reason: "scheduled" });
    }, AUTOSAVE.DEBOUNCE_MS);
  }

    async clearFounderProfile(): Promise<void> {
    const previousFounderProfileId = this.founderProfileId;
    this.clearAutosaveTimer();
    this.saving = true;
    this.lastError = null;
    this.emit();

    try {
      if (previousFounderProfileId) {
        clearFounderProfileState(previousFounderProfileId);
        clearFounderProfileRecovery(previousFounderProfileId);

        const remoteResult = await clearApplicationRemoteState(
          this.syncTransport,
          previousFounderProfileId,
          this.syncOptions,
        );

        if (!remoteResult.ok) {
          this.lastError = createRuntimeError(
            "RUNTIME_SYNC_FAILED",
            "Failed to clear remote founder-profile state.",
            {
              attempts: remoteResult.attempts,
              lastError: remoteResult.lastError,
            },
          ).message;
        }
      }
    } catch (error) {
      this.lastError = createRuntimeError(
        "RUNTIME_PERSISTENCE_FAILED",
        "Failed to clear founder-profile workspace.",
        {
          error: getErrorMessage(error),
        },
      ).message;
    } finally {
      this.founderProfileId = null;
      this.sections = {};
      this.dirtySections.clear();
      this.version += 1;
      this.hydrated = true;
      this.lastSavedAt = null;
      this.lastError = null;
      this.progress = 0;
      this.updatedAt = now();
      this.pendingMutations = 0;
      this.mutationJournal = [];
      this.saving = false;
      this.trustedAccess = normalizeTrustedAccess({
        ...this.trustedAccess,
        founderProfileId: null,
        ownsFounderProfile: false,
        canEditFounderProfile: false,
      });
      this.committedSnapshot = createCommittedSnapshotFrom(
        createEmptyState(null),
      );
      setLastActiveFounderProfile(null);
      this.syncDerivedProgress();
      this.emit();
    }
  }

  destroy(): void {
    this.clearAutosaveTimer();
    this.listeners.clear();
    this.flushInFlight = null;
    this.pendingMutations = 0;
    this.mutationJournal = [];
    this.saving = false;
  }
}

let globalCirglobFounderProfileState: CirglobFounderProfileStateManager | null =
  null;

export function createCirglobFounderProfileState(
  options: CirglobFounderProfileStateOptions = {},
): CirglobFounderProfileStateManager {
  return new CirglobFounderProfileStateManager(options);
}

export function getCirglobFounderProfileState(
  options: CirglobFounderProfileStateOptions = {},
): CirglobFounderProfileStateManager {
  if (!globalCirglobFounderProfileState) {
    globalCirglobFounderProfileState = new CirglobFounderProfileStateManager(
      options,
    );
    return globalCirglobFounderProfileState;
  }

  globalCirglobFounderProfileState.configure(options);
  return globalCirglobFounderProfileState;
}

export function resetCirglobFounderProfileState(): void {
  if (globalCirglobFounderProfileState) {
    globalCirglobFounderProfileState.destroy();
  }

  globalCirglobFounderProfileState = null;
}

export const cirglobFounderProfileState = {
  get: getCirglobFounderProfileState,
  create: createCirglobFounderProfileState,
  reset: resetCirglobFounderProfileState,
} as const;

export type { FounderProfileSection };