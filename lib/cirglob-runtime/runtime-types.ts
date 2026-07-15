// lib/cirglob-runtime/runtime-types.ts

/**
 * Shared, dependency-light runtime contracts for Cirglob client runtime engines.
 * This file must remain type-only: no runtime logic, no persistence, no sync,
 * no validation, and no access to browser APIs.
 */

export type CirglobRuntimeMaybePromise<T> = T | Promise<T>;

export type CirglobRuntimeResourceId = string | null;

/**
 * Stable source labels shared by all runtime snapshots.
 * - secure: server-trusted snapshot
 * - cache: local cache / recovery / seed-derived snapshot
 * - unknown: not yet classified
 */
export type CirglobRuntimeSource = "secure" | "cache" | "unknown";

/**
 * Shared hydration states for client runtime presentation.
 * - loading: runtime is still hydrating
 * - ready: runtime is hydrated and usable
 * - anonymous: runtime has no trusted identity / snapshot yet
 */
export type CirglobRuntimeHydrationState = "loading" | "ready" | "anonymous";

/**
 * Explicit constructor / boot behavior for runtime engines.
 * Use this when the caller needs to state what kind of data is being restored.
 */
export type CirglobRuntimeRestoreMode = "committed" | "recovery" | "seed" | "empty";

/**
 * Optional policy for choosing between trusted committed data and local recovery data.
 * This keeps boot semantics explicit instead of inferred inside the runtime.
 */
export type CirglobRuntimeSeedPolicy =
  | "committed"
  | "recovery"
  | "prefer-committed"
  | "prefer-recovery"
  | "empty";

export type CirglobRuntimeMutationOptions = {
  autosave?: boolean;
  markDirty?: boolean;
  rollbackOnFailure?: boolean;
};

export type CirglobRuntimeFlushOptions = {
  force?: boolean;
  allowLockedPersist?: boolean;
  rollbackOnFailure?: boolean;
  reason?: string;
};

export type CirglobRuntimeListener<TSnapshot> = (snapshot: TSnapshot) => void;

/**
 * Generic record shape for runtime-owned section maps and similar keyed state.
 */
export type CirglobRuntimeStateMap<TValue = unknown, TKey extends string = string> =
  Partial<Record<TKey, TValue>>;

/**
 * Shared dirty-state contract. Runtime engines can use this directly or adapt it
 * to domain-specific names like dirtySections / dirtyFounderProfileSections.
 */
export type CirglobRuntimeDirtyKeyList<TKey extends string = string> =
  readonly TKey[];

/**
 * Shared metadata carried by runtime snapshots before domain-specific fields are added.
 */
export interface CirglobRuntimeSnapshotMetaBase {
  source: CirglobRuntimeSource;
  hydrated: boolean;
  hydrationState: CirglobRuntimeHydrationState;
  version: number;
  updatedAt: number;
  lastSavedAt: number | null;
  lastError: string | null;
}

/**
 * Shared metadata carried by serializable runtime state.
 * This is intentionally smaller than the live snapshot surface.
 */
export interface CirglobRuntimeSerializableStateMetaBase {
  source: CirglobRuntimeSource;
  hydrated: boolean;
  version: number;
  updatedAt: number;
  lastSavedAt: number | null;
  lastError: string | null;
}

/**
 * Shared dirty-state contract for live snapshots and persisted state.
 * Keep the field name generic here so each runtime engine can map it cleanly.
 */
export interface CirglobRuntimeDirtyStateBase<TKey extends string = string> {
  dirtyKeys: CirglobRuntimeDirtyKeyList<TKey>;
}

/**
 * Shared live snapshot base. Domain-specific runtime snapshots should extend this
 * and add their own data/validation fields.
 */
export type CirglobRuntimeSnapshotBase<TKey extends string = string> =
  CirglobRuntimeSnapshotMetaBase &
  CirglobRuntimeDirtyStateBase<TKey> & {
    saving: boolean;
    pendingMutations: number;
    locked: boolean;
    progress: number;
  };

/**
 * Shared serializable state base. Domain-specific runtime engines should extend this
 * and add their own persisted domain state.
 */
export type CirglobRuntimeSerializableStateBase<TKey extends string = string> =
  CirglobRuntimeSerializableStateMetaBase &
  CirglobRuntimeDirtyStateBase<TKey> & {
    progress: number;
  };

/**
 * Explicit hydration input so constructors can remain deterministic and readable.
 */
export interface CirglobRuntimeHydrationInput<TSerializableState> {
  restoreMode?: CirglobRuntimeRestoreMode;
  seedPolicy?: CirglobRuntimeSeedPolicy;
  committedState: TSerializableState | null;
  recoveryState?: TSerializableState | null;
}

/**
 * Storage adapter contract for local cache / recovery persistence.
 * Keep this generic so application and founder-profile engines can share it.
 */
export interface CirglobRuntimeStorageAdapter<TSerializedState> {
  loadState(resourceId: CirglobRuntimeResourceId): CirglobRuntimeMaybePromise<TSerializedState | null>;
  saveState(
    resourceId: CirglobRuntimeResourceId,
    state: TSerializedState,
  ): CirglobRuntimeMaybePromise<void>;
  clearState(resourceId: CirglobRuntimeResourceId): CirglobRuntimeMaybePromise<void>;
}

/**
 * Sync adapter contract for remote orchestration.
 * The runtime engines should only speak to this interface, never directly to
 * network or platform code.
 */
export interface CirglobRuntimeSyncAdapter<
  TSnapshot,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  syncSnapshot(
    resourceId: CirglobRuntimeResourceId,
    snapshot: TSnapshot,
    options?: TOptions,
  ): CirglobRuntimeMaybePromise<void>;

  clearRemoteState?(
    resourceId: CirglobRuntimeResourceId,
    options?: TOptions,
  ): CirglobRuntimeMaybePromise<void>;
}