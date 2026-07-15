"use client";

import {
  APPLICATION_STATUS,
  APPLICATION_SECTION_ORDER,
  AUTOSAVE,
  PERSISTENCE,
  type ApplicationSection,
} from "../constants";
import {
  canEditApplication,
  isLocked,
  parseApplicationStatus,
  type ApplicationStatusInput,
} from "../application-status";
import {
  getApplicationProgressSummary,
  validateApplication,
  type ApplicationValidationResult,
  type SectionSchemaRegistry,
} from "../application-validation";
import {
  clearApplyRecovery,
  clearApplyState,
  cleanupStaleApplyCache,
  getCachedApplySummary,
  getLastActiveApplication,
  loadApplyRecovery,
  loadApplyState,
  saveApplyRecovery,
  saveApplyState,
  updateCachedProgressEnvelope,
  setLastActiveApplication,
} from "../application-cache";
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
} from "./runtime-types";

export type CirglobApplicationSerializableState = {
  applicationId: string | null;
  status: ApplicationStatusInput;
  sections: Partial<Record<ApplicationSection, unknown>>;
  dirtySections: ApplicationSection[];
  version: number;
  hydrated: boolean;
  lastSavedAt: number | null;
  lastError: string | null;
  progress: number;
  updatedAt: number;
};

export type CirglobApplicationSnapshot = CirglobApplicationSerializableState & {
  locked: boolean;
  saving: boolean;
  pendingMutations: number;
  completionPercentage: number;
  completedSections: readonly ApplicationSection[];
  missingSections: readonly ApplicationSection[];
  invalidSections: readonly ApplicationSection[];
  valid: boolean;
  canSubmit: boolean;
  hasValidationErrors: boolean;
  validation: ApplicationValidationResult;
};

export type CirglobApplicationStateOptions = {
  applicationId?: string | null;
  status?: ApplicationStatusInput;
  sections?: Partial<Record<ApplicationSection, unknown>>;
  validationSchemas?: SectionSchemaRegistry;
  syncTransport?: ApplicationSyncTransport;
  syncOptions?: ApplicationSyncCoordinatorOptions;
  autosaveEnabled?: boolean;
  initialHydrate?: boolean;
  cleanupStaleCache?: boolean;
  restoreMode?: CirglobRuntimeRestoreMode;
  seedPolicy?: CirglobRuntimeSeedPolicy;
};

export type CirglobApplicationMutationOptions = CirglobRuntimeMutationOptions;
export type CirglobApplicationFlushOptions = CirglobRuntimeFlushOptions;

export type CirglobApplicationMutationEntry =
  | {
      kind: "application-section";
      section: ApplicationSection;
      previousValue: unknown;
      nextValue: unknown;
      at: number;
    };

type ApplicationStateListener = CirglobRuntimeListener<CirglobApplicationSnapshot>;

type SerializableHydrationInput =
  | CirglobApplicationSerializableState
  | Partial<CirglobApplicationSerializableState>
  | Record<string, unknown>
  | null;

type HydrationChoice = {
  current: CirglobApplicationSerializableState;
  committed: CirglobApplicationSerializableState;
};

type ApplicationSerializableSeed = Partial<
  Omit<CirglobApplicationSerializableState, "version">
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
    return "Unknown application runtime error.";
  }
}

function normalizeApplicationId(value?: string | null): string | null {
  return safeString(value);
}

function normalizeApplicationStatus(
  value?: ApplicationStatusInput,
): ApplicationStatusInput {
  return parseApplicationStatus(value) ?? APPLICATION_STATUS.DRAFT;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertPlainJsonSafeValue(
  value: unknown,
  context: string,
  seen: Set<object> = new Set(),
): void {
  const valueType = typeof value;

  if (
    value === null ||
    valueType === "string" ||
    valueType === "boolean"
  ) {
    return;
  }

  if (valueType === "number") {
    if (Number.isFinite(value)) return;

    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section payload contains an invalid number at "${context}".`,
      { context, value },
    );
  }

  if (
    valueType === "undefined" ||
    valueType === "function" ||
    valueType === "symbol" ||
    valueType === "bigint"
  ) {
    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section payload contains an unsupported value at "${context}".`,
      { context, valueType },
    );
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw createRuntimeError(
        "RUNTIME_PERSISTENCE_FAILED",
        `Section payload contains a circular array reference at "${context}".`,
        { context },
      );
    }

    seen.add(value);

    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) {
        throw createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          `Section payload contains a sparse array at "${context}[${index}]".`,
          { context, index },
        );
      }

      assertPlainJsonSafeValue(value[index], `${context}[${index}]`, seen);
    }

    seen.delete(value);
    return;
  }

  if (!isPlainObject(value)) {
    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section payload contains a non-plain object at "${context}".`,
      {
        context,
        constructor:
          typeof (value as { constructor?: { name?: string } }).constructor?.name ===
          "string"
            ? (value as { constructor?: { name?: string } }).constructor?.name
            : null,
      },
    );
  }

  if (seen.has(value)) {
    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section payload contains a circular object reference at "${context}".`,
      { context },
    );
  }

  seen.add(value);

  for (const [key, nextValue] of Object.entries(value)) {
    assertPlainJsonSafeValue(nextValue, `${context}.${key}`, seen);
  }

  seen.delete(value);
}

function cloneSections(
  input?: Partial<Record<ApplicationSection, unknown>> | null,
): Partial<Record<ApplicationSection, unknown>> {
  const result: Partial<Record<ApplicationSection, unknown>> = {};

  if (!input || typeof input !== "object") return result;

  for (const section of APPLICATION_SECTION_ORDER) {
    if (!(section in input)) continue;

    const value = input[section];
    if (typeof value === "undefined") continue;
    result[section] = value;
  }

  return result;
}

function normalizeDirtySections(input: unknown): ApplicationSection[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<ApplicationSection>();
  for (const value of input) {
    if (typeof value !== "string") continue;
    if (!APPLICATION_SECTION_ORDER.includes(value as ApplicationSection)) continue;
    seen.add(value as ApplicationSection);
  }

  return APPLICATION_SECTION_ORDER.filter((section) => seen.has(section));
}

function normalizeSectionState(
  input?: Partial<Record<ApplicationSection, unknown>> | null,
): Partial<Record<ApplicationSection, unknown>> {
  const sections = cloneSections(input);
  assertSectionsWithinLimit(sections);
  return sections;
}

function assertSectionsWithinLimit(
  input?: Partial<Record<ApplicationSection, unknown>> | null,
): void {
  if (!input || typeof input !== "object") return;

  for (const section of APPLICATION_SECTION_ORDER) {
    assertSectionPayloadWithinLimit(section, input[section]);
  }
}

function areSerializableStatesEqual(
  left: CirglobApplicationSerializableState | null,
  right: CirglobApplicationSerializableState,
): boolean {
  if (!left) return false;

  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function getSectionPayloadSizeInBytes(value: unknown): number {
  const serialized = JSON.stringify(value);
  if (typeof serialized !== "string") {
    throw new Error("Section payload is not serializable.");
  }

  return new TextEncoder().encode(serialized).length;
}

function assertSectionPayloadWithinLimit(
  section: ApplicationSection,
  value: unknown,
): void {
  if (typeof value === "undefined") return;

  try {
    assertPlainJsonSafeValue(value, section);
  } catch (error) {
    if (error instanceof Error) throw error;

    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section "${section}" contains an unsupported payload.`,
      {
        section,
        error: getErrorMessage(error),
      },
    );
  }

  let size: number;

  try {
    size = getSectionPayloadSizeInBytes(value);
  } catch (error) {
    throw createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      `Section "${section}" contains an unsupported payload.`,
      {
        section,
        error: getErrorMessage(error),
      },
    );
  }

  if (size <= PERSISTENCE.MAX_SECTION_PAYLOAD_BYTES) return;

  throw createRuntimeError(
    "RUNTIME_PERSISTENCE_FAILED",
    `Section "${section}" exceeds the maximum allowed payload size.`,
    {
      section,
      size,
      limit: PERSISTENCE.MAX_SECTION_PAYLOAD_BYTES,
    },
  );
}

function createEmptyState(
  applicationId: string | null,
  status: ApplicationStatusInput,
): CirglobApplicationSerializableState {
  return {
    applicationId,
    status,
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
  state: CirglobApplicationSerializableState,
): CirglobApplicationSerializableState {
  return {
    applicationId: state.applicationId,
    status: state.status,
    sections: cloneSections(state.sections),
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
  state: CirglobApplicationSerializableState,
): CirglobApplicationSerializableState {
  return {
    applicationId: state.applicationId,
    status: state.status,
    sections: cloneSections(state.sections),
    dirtySections: APPLICATION_SECTION_ORDER.filter((section) => state.dirtySections.includes(section)),
    version: state.version,
    hydrated: state.hydrated,
    lastSavedAt: state.lastSavedAt,
    lastError: state.lastError,
    progress: clampProgress(state.progress),
    updatedAt: state.updatedAt,
  };
}

function syncProgressFromSections(
  status: ApplicationStatusInput,
  sections: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry,
): number {
  const validationMode = isLocked(status) ? "submit" : "draft";
  return getApplicationProgressSummary(sections, schemas, validationMode)
    .completionPercentage;
}

function normalizeSerializableState(
  raw: SerializableHydrationInput,
  fallbackApplicationId: string | null,
  fallbackStatus: ApplicationStatusInput,
  preserveDirty: boolean,
): CirglobApplicationSerializableState | null {
  if (!raw || typeof raw !== "object") return null;

  const input = raw as Partial<CirglobApplicationSerializableState> &
    Record<string, unknown>;

  try {
    return {
      applicationId:
        normalizeApplicationId(input.applicationId) ?? fallbackApplicationId,
      status: normalizeApplicationStatus(input.status ?? fallbackStatus),
      sections: normalizeSectionState(
        isRecord(input.sections)
          ? (input.sections as Partial<Record<ApplicationSection, unknown>>)
          : {},
      ),
      dirtySections: preserveDirty
        ? normalizeDirtySections(input.dirtySections)
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
  } catch {
    return null;
  }
}

function buildSnapshot(
  state: CirglobApplicationSerializableState,
  saving: boolean,
  pendingMutations: number,
  validation: ApplicationValidationResult,
): CirglobApplicationSnapshot {
  return {
    ...cloneSerializableState(state),
    locked: isLocked(state.status),
    saving,
    pendingMutations,
    completionPercentage: validation.completionPercentage,
    completedSections: validation.sectionResults
      .filter((result) => result.valid && !result.missing)
      .map((result) => result.section),
    missingSections: validation.missingSections,
    invalidSections: validation.invalidSections,
    valid: validation.valid,
    canSubmit: validation.canSubmit,
    hasValidationErrors: validation.invalidSections.length > 0,
    validation,
  };
}

function createRuntimeError(
  code: CirglobRuntimeErrorCode,
  message: string,
  details?: Record<string, unknown>,
) {
  return createCirglobRuntimeError(code, message, details ? { details } : undefined);
}

function resolveSelectedState(
  committedState: CirglobApplicationSerializableState | null,
  recoveryState: CirglobApplicationSerializableState | null,
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

export class CirglobApplicationStateManager {
  private applicationId: string | null;
  private status: ApplicationStatusInput;
  private sections: Partial<Record<ApplicationSection, unknown>>;
  private dirtySections: Set<ApplicationSection>;
  private version: number;
  private contentMutationSequence: number;
  private hydrated: boolean;
  private lastSavedAt: number | null;
  private lastError: string | null;
  private progress: number;
  private updatedAt: number;
  private saving: boolean;
  private pendingMutations: number;
  private mutationJournal: CirglobApplicationMutationEntry[];
  private committedSnapshot: CirglobApplicationSerializableState;
  private autosaveEnabled: boolean;
  private validationSchemas: SectionSchemaRegistry;
  private syncTransport: ApplicationSyncTransport;
  private syncOptions: ApplicationSyncCoordinatorOptions;
  private listeners: Set<ApplicationStateListener>;
  private autosaveTimer: ReturnType<typeof setTimeout> | null;
  private flushInFlight: Promise<boolean> | null;
  private cleanupStaleCacheOnHydrate: boolean;
  private restoreMode: CirglobRuntimeRestoreMode;
  private seedPolicy: CirglobRuntimeSeedPolicy;

  constructor(options: CirglobApplicationStateOptions = {}) {
    this.applicationId =
      normalizeApplicationId(options.applicationId) ?? getLastActiveApplication();
    this.status = normalizeApplicationStatus(options.status);
    this.sections = normalizeSectionState(options.sections);
    this.dirtySections = new Set<ApplicationSection>();
    this.version = 0;
    this.contentMutationSequence = 0;
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

    this.syncDerivedProgress();
    this.committedSnapshot = createCommittedSnapshotFrom(
      this.getSerializableState(),
    );

    if (options.initialHydrate === true) {
      void this.hydrateFromStorage();
    }
  }

  configure(options: Partial<CirglobApplicationStateOptions> = {}): void {
    if (typeof options.applicationId !== "undefined") {
      this.applicationId = normalizeApplicationId(options.applicationId);
      setLastActiveApplication(this.applicationId);
    }

    if (typeof options.status !== "undefined") {
      this.status = normalizeApplicationStatus(options.status);
      this.syncDerivedProgress();
      this.updatedAt = now();
      this.version += 1;
    }

    if (typeof options.sections !== "undefined") {
      this.sections = normalizeSectionState(options.sections);
      this.syncDerivedProgress();
      this.updatedAt = now();
      this.contentMutationSequence += 1;
      this.version += 1;
    }

    if (options.validationSchemas) {
      this.validationSchemas = options.validationSchemas;
      this.syncDerivedProgress();
      this.updatedAt = now();
      this.version += 1;
    }

    if (options.syncTransport) {
      this.syncTransport = options.syncTransport;
    }

    if (options.syncOptions) {
      this.syncOptions = options.syncOptions;
    }

    if (typeof options.autosaveEnabled === "boolean") {
      this.autosaveEnabled = options.autosaveEnabled;
      this.updatedAt = now();
      this.version += 1;
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

    this.committedSnapshot = createCommittedSnapshotFrom(this.getSerializableState());
    this.emit();
  }

  subscribe(listener: ApplicationStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(
          "[Cirglob Application Runtime] Listener error:",
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
    this.progress = syncProgressFromSections(
      this.status,
      this.sections,
      this.validationSchemas,
    );
  }

  private createSerializableState(
    overrides: Partial<CirglobApplicationSerializableState> = {},
  ): CirglobApplicationSerializableState {
    return {
      applicationId:
        typeof overrides.applicationId === "undefined"
          ? this.applicationId
          : overrides.applicationId,
      status:
        typeof overrides.status === "undefined" ? this.status : overrides.status,
      sections:
        typeof overrides.sections === "undefined"
          ? cloneSections(this.sections)
          : cloneSections(overrides.sections),
      dirtySections:
        typeof overrides.dirtySections === "undefined"
          ? APPLICATION_SECTION_ORDER.filter((section) => this.dirtySections.has(section))
          : overrides.dirtySections,
      version: typeof overrides.version === "undefined" ? this.version : overrides.version,
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
    base: ApplicationSerializableSeed = {},
  ): CirglobApplicationSerializableState {
    return createCommittedSnapshotFrom({
      applicationId:
        typeof base.applicationId === "undefined"
          ? this.applicationId
          : base.applicationId,
      status: typeof base.status === "undefined" ? this.status : base.status,
      sections:
        typeof base.sections === "undefined"
          ? cloneSections(this.sections)
          : cloneSections(base.sections),
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
    this.contentMutationSequence += 1;
  }

  private finishMutation(): void {
    this.pendingMutations = Math.max(0, this.pendingMutations - 1);
  }

  private recordJournal(entry: CirglobApplicationMutationEntry): void {
    this.mutationJournal.push(entry);

    if (this.mutationJournal.length > PERSISTENCE.MAX_PENDING_MUTATIONS) {
      this.mutationJournal.shift();
    }
  }

  private async persistCommittedSnapshot(
    committedSnapshot: CirglobApplicationSerializableState,
    applicationId: string | null,
  ): Promise<void> {
    saveApplyState(committedSnapshot, applicationId);
    clearApplyRecovery(applicationId);
    updateCachedProgressEnvelope(committedSnapshot.progress, applicationId);

    if (applicationId) {
      const persisted = loadApplyState<CirglobApplicationSerializableState>(
        applicationId,
      );

      if (!areSerializableStatesEqual(persisted ?? null, committedSnapshot)) {
        throw createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          "Committed application state could not be verified after save.",
          {
            applicationId,
          },
        );
      }
    }

    setLastActiveApplication(applicationId);
  }

  private persistRecoverySnapshot(
    snapshot: CirglobApplicationSerializableState,
    applicationId: string | null,
  ): void {
    saveApplyRecovery(snapshot, applicationId);

    if (applicationId) {
      const persisted = loadApplyRecovery<CirglobApplicationSerializableState>(
        applicationId,
      );

      if (!areSerializableStatesEqual(persisted ?? null, snapshot)) {
        throw createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          "Recovery application state could not be verified after save.",
          {
            applicationId,
          },
        );
      }
    }
  }

  private toSyncSnapshot(): ApplicationSyncSnapshot {
    return {
      applicationId: this.applicationId,
      sections: cloneSections(this.sections),
      dirtySections: APPLICATION_SECTION_ORDER.filter((section) => this.dirtySections.has(section)),
      version: this.version,
      updatedAt: this.updatedAt,
    };
  }

  async hydrateFromStorage(
    applicationId?: string | null,
  ): Promise<CirglobApplicationSnapshot> {
    const resolvedApplicationId =
      normalizeApplicationId(applicationId) ??
      this.applicationId ??
      getLastActiveApplication();

    if (this.restoreMode === "empty") {
      this.applicationId = resolvedApplicationId;
      this.status = APPLICATION_STATUS.DRAFT;
      this.sections = {};
      this.dirtySections.clear();
      this.lastSavedAt = null;
      this.lastError = null;
      this.hydrated = true;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        applicationId: this.applicationId,
        status: this.status,
        sections: {},
        dirtySections: [],
        hydrated: true,
        lastSavedAt: null,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveApplication(this.applicationId);
      this.emit();
      return this.getSnapshot();
    }

    if (this.restoreMode === "seed") {
      this.applicationId = resolvedApplicationId;
      this.hydrated = true;
      this.lastError = null;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        applicationId: this.applicationId,
        status: this.status,
        sections: this.sections,
        dirtySections: [],
        hydrated: true,
        lastSavedAt: this.lastSavedAt,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveApplication(this.applicationId);
      this.emit();
      return this.getSnapshot();
    }

    if (this.cleanupStaleCacheOnHydrate) {
      cleanupStaleApplyCache(resolvedApplicationId);
    }

    const summary = getCachedApplySummary(resolvedApplicationId);
    const committedRaw = summary.hasDraft
      ? loadApplyState<SerializableHydrationInput>(resolvedApplicationId)
      : null;
    const recoveryRaw = summary.hasRecovery
      ? loadApplyRecovery<SerializableHydrationInput>(resolvedApplicationId)
      : null;

    const committed = normalizeSerializableState(
      committedRaw,
      resolvedApplicationId,
      this.status,
      false,
    );
    const recovery = normalizeSerializableState(
      recoveryRaw,
      resolvedApplicationId,
      this.status,
      true,
    );

    const choice = resolveSelectedState(
      committed,
      recovery,
      this.restoreMode,
      this.seedPolicy,
    );

    if (!choice) {
      this.applicationId = resolvedApplicationId;
      this.hydrated = true;
      this.lastError = null;
      this.updatedAt = now();
      this.syncDerivedProgress();
      this.committedSnapshot = this.createCommittedSerializableState({
        applicationId: this.applicationId,
        status: this.status,
        sections: this.sections,
        dirtySections: [],
        hydrated: true,
        lastSavedAt: this.lastSavedAt,
        lastError: null,
        progress: this.progress,
        updatedAt: this.updatedAt,
      });
      setLastActiveApplication(this.applicationId);
      this.emit();
      return this.getSnapshot();
    }

    this.applicationId = choice.current.applicationId;
    this.status = choice.current.status;
    this.sections = cloneSections(choice.current.sections);
    this.dirtySections = new Set(choice.current.dirtySections);
    this.version = Math.max(this.version, choice.current.version);
    this.hydrated = true;
    this.lastSavedAt = choice.current.lastSavedAt;
    this.lastError = choice.current.lastError;
    this.updatedAt = now();
    this.syncDerivedProgress();
    this.committedSnapshot = choice.committed;
    setLastActiveApplication(this.applicationId);
    this.emit();
    return this.getSnapshot();
  }

  getSnapshot(): CirglobApplicationSnapshot {
    const validation = validateApplication(
      this.status,
      this.sections,
      this.validationSchemas,
    );

    return buildSnapshot(
      this.createSerializableState(),
      this.saving,
      this.pendingMutations,
      validation,
    );
  }

  getSerializableState(): CirglobApplicationSerializableState {
    return this.createSerializableState();
  }

  getApplicationId(): string | null {
    return this.applicationId;
  }

  getStatus(): ApplicationStatusInput {
    return this.status;
  }

  getSections(): Partial<Record<ApplicationSection, unknown>> {
    return cloneSections(this.sections);
  }

  getDirtySections(): readonly ApplicationSection[] {
    return APPLICATION_SECTION_ORDER.filter((section) => this.dirtySections.has(section));
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
    return canEditApplication(this.status);
  }

  canSubmit(schemas: SectionSchemaRegistry = this.validationSchemas): boolean {
    return validateApplication(this.status, this.sections, schemas).canSubmit;
  }

  getValidationResult(
    schemas: SectionSchemaRegistry = this.validationSchemas,
  ): ApplicationValidationResult {
    return validateApplication(this.status, this.sections, schemas);
  }

  getProgressSummary(
    schemas: SectionSchemaRegistry = this.validationSchemas,
  ): ReturnType<typeof getApplicationProgressSummary> {
    return getApplicationProgressSummary(
      this.sections,
      schemas,
      isLocked(this.status) ? "submit" : "draft",
    );
  }

  setApplicationId(applicationId: string | null): CirglobApplicationSnapshot {
    const next = normalizeApplicationId(applicationId);
    if (next === this.applicationId) return this.getSnapshot();

    this.applicationId = next;
    setLastActiveApplication(this.applicationId);
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  setStatus(status: ApplicationStatusInput): CirglobApplicationSnapshot {
    const next = normalizeApplicationStatus(status);
    if (next === this.status) return this.getSnapshot();

    this.status = next;
    this.syncDerivedProgress();
    this.markStateChanged();

    if (isLocked(this.status) && this.hasDirtyChanges()) {
      void this.flushAutosave({
        force: true,
        allowLockedPersist: true,
        reason: "status-locked",
      });
    } else if (this.autosaveEnabled && this.hasDirtyChanges()) {
      this.scheduleAutosave();
    }

    this.emit();
    return this.getSnapshot();
  }

  setValidationSchemas(
    schemas: SectionSchemaRegistry,
  ): CirglobApplicationSnapshot {
    this.validationSchemas = schemas;
    this.syncDerivedProgress();
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

  setAutosaveEnabled(enabled: boolean): CirglobApplicationSnapshot {
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

  setSection(
    section: ApplicationSection,
    value: unknown,
    options: CirglobApplicationMutationOptions = {},
  ): CirglobApplicationSnapshot {
    if (isLocked(this.status)) return this.getSnapshot();

    const previousValue = this.sections[section];
    if (Object.is(previousValue, value)) return this.getSnapshot();

    assertSectionPayloadWithinLimit(section, value);

    this.setMutationMeta();
    try {
      this.recordJournal({
        kind: "application-section",
        section,
        previousValue,
        nextValue: value,
        at: now(),
      });

      const nextSections = cloneSections(this.sections);
      if (typeof value === "undefined") {
        delete nextSections[section];
        if (options.markDirty !== false) this.dirtySections.add(section);
      } else {
        nextSections[section] = value;
        if (options.markDirty !== false) this.dirtySections.add(section);
      }

      this.sections = nextSections;
      this.syncDerivedProgress();
      this.markStateChanged();
      this.contentMutationSequence += 1;
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

  patchSections(
    partial: Partial<Record<ApplicationSection, unknown>>,
    options: CirglobApplicationMutationOptions = {},
  ): CirglobApplicationSnapshot {
    if (isLocked(this.status)) return this.getSnapshot();

    let changed = false;

    for (const section of APPLICATION_SECTION_ORDER) {
      if (!(section in partial)) continue;

      const nextValue = partial[section];
      const previousValue = this.sections[section];
      if (Object.is(previousValue, nextValue)) continue;

      assertSectionPayloadWithinLimit(section, nextValue);

      this.setMutationMeta();
      try {
        this.recordJournal({
          kind: "application-section",
          section,
          previousValue,
          nextValue,
          at: now(),
        });

        const nextSections = cloneSections(this.sections);
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
    this.contentMutationSequence += 1;
    if (options.autosave !== false && options.markDirty !== false) {
      this.scheduleAutosave();
    }
    this.emit();
    return this.getSnapshot();
  }

  removeSection(
    section: ApplicationSection,
    options: CirglobApplicationMutationOptions = {},
  ): CirglobApplicationSnapshot {
    return this.setSection(section, undefined, options);
  }

  replaceApplicationState(
    nextSections: Partial<Record<ApplicationSection, unknown>>,
    options: CirglobApplicationMutationOptions = {},
  ): CirglobApplicationSnapshot {
    if (isLocked(this.status)) return this.getSnapshot();

    const normalizedNext = cloneSections(nextSections);
    const changedSections = new Set<ApplicationSection>();

    for (const section of APPLICATION_SECTION_ORDER) {
      const nextValue = normalizedNext[section];
      assertSectionPayloadWithinLimit(section, nextValue);

      const previousValue = this.sections[section];
      if (Object.is(previousValue, nextValue)) continue;
      changedSections.add(section);
    }

    if (changedSections.size === 0) return this.getSnapshot();

    this.setMutationMeta();
    try {
      for (const section of changedSections) {
        this.recordJournal({
          kind: "application-section",
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
      this.contentMutationSequence += 1;
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

  clearDirtyState(): CirglobApplicationSnapshot {
    if (this.dirtySections.size === 0) return this.getSnapshot();

    this.dirtySections.clear();
    this.syncDerivedProgress();
    this.markStateChanged();
    this.emit();
    return this.getSnapshot();
  }

    rollbackLastMutation(): CirglobApplicationSnapshot {
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
      this.contentMutationSequence += 1;
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

  rollbackToCommittedSnapshot(): CirglobApplicationSnapshot {
    const committed = cloneSerializableState(this.committedSnapshot);

    this.applicationId = committed.applicationId;
    this.status = committed.status;
    this.sections = cloneSections(committed.sections);
    this.dirtySections = new Set(committed.dirtySections);
    this.version = committed.version + 1;
    this.contentMutationSequence += 1;
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
    options: CirglobApplicationFlushOptions = {},
  ): Promise<boolean> {
    if (this.flushInFlight) return this.flushInFlight;

    this.flushInFlight = (async () => {
      const forced = options.force ?? false;
      const allowLockedPersist = options.allowLockedPersist ?? false;
      const rollbackOnFailure = options.rollbackOnFailure ?? false;
      const startedContentMutationSequence = this.contentMutationSequence;

      try {
        if (!this.hydrated) {
          await this.hydrateFromStorage();
        }

        if (isLocked(this.status) && !allowLockedPersist) {
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
          dirtySections: APPLICATION_SECTION_ORDER.filter((section) =>
            this.dirtySections.has(section),
          ),
          progress: this.progress,
          updatedAt: this.updatedAt,
        });

        this.persistRecoverySnapshot(liveSnapshot, this.applicationId);

        const syncResult = await syncApplicationSnapshot(
          this.syncTransport,
          this.toSyncSnapshot(),
          this.syncOptions,
        );

        if (!syncResult.ok) {
          const syncError = createRuntimeError(
            "RUNTIME_SYNC_FAILED",
            "Application autosave sync failed.",
            {
              attempts: syncResult.attempts,
              lastError: syncResult.lastError,
              reason: options.reason ?? null,
            },
          );

          this.lastError = syncError.message;

          if (rollbackOnFailure) {
            this.rollbackToCommittedSnapshot();
            const committed = this.createCommittedSerializableState(
              this.createSerializableState({
                hydrated: true,
                dirtySections: [],
                lastError: null,
              }),
            );
            await this.persistCommittedSnapshot(committed, this.applicationId);
            this.committedSnapshot = committed;
            this.dirtySections.clear();
            this.lastSavedAt = committed.lastSavedAt;
            this.lastError = null;
            this.updatedAt = now();
            this.syncDerivedProgress();
          } else if (this.autosaveEnabled && this.hasDirtyChanges()) {
            this.scheduleAutosave();
          }

          return false;
        }

        const completedAt = now();

        const committed = this.createCommittedSerializableState({
          applicationId: liveSnapshot.applicationId,
          status: liveSnapshot.status,
          sections: liveSnapshot.sections,
          dirtySections: [],
          version: this.version,
          hydrated: true,
          lastSavedAt: completedAt,
          lastError: null,
          progress: this.progress,
          updatedAt: completedAt,
        });

        await this.persistCommittedSnapshot(committed, this.applicationId);
        this.committedSnapshot = committed;
        this.lastSavedAt = committed.lastSavedAt;
        this.lastError = null;

        if (this.contentMutationSequence !== startedContentMutationSequence) {  
          const currentRecovery = this.createSerializableState({
            hydrated: true,
            lastError: null,
            dirtySections: APPLICATION_SECTION_ORDER.filter((section) =>
              this.dirtySections.has(section),
            ),
            progress: this.progress,
            updatedAt: this.updatedAt,
          });

          this.persistRecoverySnapshot(currentRecovery, this.applicationId);

          if (this.autosaveEnabled && this.hasDirtyChanges()) {
            this.scheduleAutosave();
          }

          return true;
        }

        this.dirtySections.clear();
        this.updatedAt = completedAt;
        this.syncDerivedProgress();
        return true;
      } catch (error) {
        const runtimeError = createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          "Application autosave failed.",
          {
            error: getErrorMessage(error),
            reason: options.reason ?? null,
          },
        );
        this.lastError = runtimeError.message;

        if (options.rollbackOnFailure) {
          const rolledBackSnapshot = this.rollbackToCommittedSnapshot();
          const committed = this.createCommittedSerializableState({
            applicationId: rolledBackSnapshot.applicationId,
            status: rolledBackSnapshot.status,
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
          await this.persistCommittedSnapshot(committed, this.applicationId);
          this.dirtySections.clear();
          this.lastSavedAt = committed.lastSavedAt;
          this.lastError = null;
          this.progress = committed.progress;
          this.syncDerivedProgress();
        } else if (this.autosaveEnabled && this.hasDirtyChanges()) {
          this.scheduleAutosave();
        }

        return false;
      } finally {
        this.saving = false;
        this.flushInFlight = null;
        this.emit();
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

  async clearWorkspace(): Promise<void> {
  const previousApplicationId = this.applicationId;
  this.clearAutosaveTimer();
  this.saving = true;
  this.lastError = null;
  this.emit();

  try {
    clearApplyState(previousApplicationId);
    clearApplyRecovery(previousApplicationId);

    const remoteResult = await clearApplicationRemoteState(
      this.syncTransport,
      previousApplicationId,
      this.syncOptions,
    );

    if (!remoteResult.ok) {
      this.lastError = createRuntimeError(
        "RUNTIME_SYNC_FAILED",
        "Failed to clear remote application state.",
        {
          attempts: remoteResult.attempts,
          lastError: remoteResult.lastError,
        },
      ).message;
    }

    // Stronger version: verify local clear really happened.
    if (previousApplicationId) {
      const draftStillExists = loadApplyState(previousApplicationId);
      const recoveryStillExists = loadApplyRecovery(previousApplicationId);

      if (draftStillExists || recoveryStillExists) {
        this.lastError = createRuntimeError(
          "RUNTIME_PERSISTENCE_FAILED",
          "Failed to fully clear local application state.",
          { applicationId: previousApplicationId },
        ).message;
      }
    }
  } catch (error) {
    this.lastError = createRuntimeError(
      "RUNTIME_PERSISTENCE_FAILED",
      "Failed to clear application workspace.",
      {
        error: getErrorMessage(error),
      },
    ).message;
  } finally {
    this.applicationId = null;
    this.status = APPLICATION_STATUS.DRAFT;
    this.sections = {};
    this.dirtySections.clear();
    this.version += 1;
    this.contentMutationSequence += 1;
    this.hydrated = true;
    this.lastSavedAt = null;
    this.progress = 0;
    this.updatedAt = now();
    this.pendingMutations = 0;
    this.mutationJournal = [];
    this.committedSnapshot = createCommittedSnapshotFrom(
      createEmptyState(null, APPLICATION_STATUS.DRAFT),
    );
    setLastActiveApplication(null);
    this.saving = false;
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

let globalCirglobApplicationState: CirglobApplicationStateManager | null = null;

export function createCirglobApplicationState(
  options: CirglobApplicationStateOptions = {},
): CirglobApplicationStateManager {
  return new CirglobApplicationStateManager(options);
}

export function getCirglobApplicationState(
  options: CirglobApplicationStateOptions = {},
): CirglobApplicationStateManager {
  if (!globalCirglobApplicationState) {
    globalCirglobApplicationState = new CirglobApplicationStateManager(options);
    return globalCirglobApplicationState;
  }

  globalCirglobApplicationState.configure(options);
  return globalCirglobApplicationState;
}

export function resetCirglobApplicationState(): void {
  if (globalCirglobApplicationState) {
    globalCirglobApplicationState.destroy();
  }

  globalCirglobApplicationState = null;
}

export const cirglobApplicationState = {
  get: getCirglobApplicationState,
  create: createCirglobApplicationState,
  reset: resetCirglobApplicationState,
} as const;

export type { ApplicationSection };
