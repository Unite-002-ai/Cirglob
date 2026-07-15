import {
  APPLICATION_SECTION_ORDER,
  AUTOSAVE,
  type ApplicationSection,
} from "./constants";

/**
 * =========================================================
 * CIRGLOB — APPLICATION SYNC LAYER
 * =========================================================
 *
 * Purpose:
 * Persistence adapter and retry orchestration layer for the
 * application runtime.
 *
 * Responsibilities:
 * - section synchronization
 * - snapshot synchronization
 * - retry orchestration
 * - persistence abstraction
 * - deterministic sync ordering
 *
 * Non-responsibilities:
 * - UI rendering
 * - auth/session logic
 * - route protection
 * - validation orchestration
 * - direct Supabase access
 *
 * This layer is intentionally transport-agnostic so it can be
 * wired to browser, server, worker, or test implementations.
 */

export type ApplicationSyncSnapshot = {
  applicationId: string | null;
  sections: Partial<Record<ApplicationSection, unknown>>;
  dirtySections?: readonly ApplicationSection[];
  version?: number;
  updatedAt?: number;
};

export type ApplicationSyncResult = {
  ok: boolean;
  attempts: number;
  durationMs: number;
  lastError: string | null;
};

export type ApplicationSyncRetryPolicy = {
  maxRetries?: number;
  retryDelayMs?: number;
  exponentialBackoff?: boolean;
  retryable?: (error: unknown) => boolean;
};

export type ApplicationSyncTransport = {
  persistSnapshot?: (snapshot: ApplicationSyncSnapshot) => void | Promise<void>;
  persistSection?: (
    section: ApplicationSection,
    value: unknown,
    snapshot: ApplicationSyncSnapshot,
  ) => void | Promise<void>;
  clearRemoteState?: (applicationId: string | null) => void | Promise<void>;
};

export type ApplicationSyncCoordinatorOptions = {
  retryPolicy?: ApplicationSyncRetryPolicy;
};

export type ApplicationSectionSyncInput = {
  section: ApplicationSection;
  value: unknown;
  snapshot: ApplicationSyncSnapshot;
};

export const DEFAULT_APPLICATION_SYNC_RETRY_POLICY: Required<
  Pick<
    ApplicationSyncRetryPolicy,
    "maxRetries" | "retryDelayMs" | "exponentialBackoff"
  >
> = {
  maxRetries: AUTOSAVE.MAX_RETRIES,
  retryDelayMs: AUTOSAVE.RETRY_DELAY_MS,
  exponentialBackoff: true,
};

function isBrowserLikeError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const normalized = message.toLowerCase();

  return (
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch") ||
    normalized.includes("rate limit") ||
    normalized.includes("429") ||
    normalized.includes("5xx") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("request failed") ||
    normalized.includes("connection")
  );
}

function isRetryableError(
  error: unknown,
  retryable?: (error: unknown) => boolean,
): boolean {
  if (typeof retryable === "function") {
    return retryable(error);
  }

  return isBrowserLikeError(error);
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown sync error.";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeApplicationId(applicationId: string | null): string | null {
  if (typeof applicationId !== "string") return null;

  const trimmed = applicationId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getOrderedSections(
  dirtySections: readonly ApplicationSection[] | undefined,
  sections: Partial<Record<ApplicationSection, unknown>>,
): readonly ApplicationSection[] {
  const source =
    dirtySections && dirtySections.length > 0
      ? dirtySections
      : APPLICATION_SECTION_ORDER.filter((section) => section in sections);

  return APPLICATION_SECTION_ORDER.filter((section) => source.includes(section));
}

async function resolveMaybePromise<T>(value: T | Promise<T>): Promise<T> {
  return await Promise.resolve(value);
}

export async function runApplicationSyncWithRetry<T>(
  operation: () => T | Promise<T>,
  policy: ApplicationSyncRetryPolicy = {},
): Promise<{ result: T | null; meta: ApplicationSyncResult }> {
  const maxRetries =
    policy.maxRetries ?? DEFAULT_APPLICATION_SYNC_RETRY_POLICY.maxRetries;

  const retryDelayMs =
    policy.retryDelayMs ?? DEFAULT_APPLICATION_SYNC_RETRY_POLICY.retryDelayMs;

  const exponentialBackoff =
    policy.exponentialBackoff ??
    DEFAULT_APPLICATION_SYNC_RETRY_POLICY.exponentialBackoff;

  const startedAt = Date.now();
  let attempts = 0;
  let lastError: string | null = null;

  while (attempts <= maxRetries) {
    try {
      const result = await resolveMaybePromise(operation());

      return {
        result,
        meta: {
          ok: true,
          attempts: attempts + 1,
          durationMs: Date.now() - startedAt,
          lastError: null,
        },
      };
    } catch (error) {
      lastError = stringifyError(error);
      attempts += 1;

      const shouldRetry =
        attempts <= maxRetries && isRetryableError(error, policy.retryable);

      if (!shouldRetry) {
        return {
          result: null,
          meta: {
            ok: false,
            attempts,
            durationMs: Date.now() - startedAt,
            lastError,
          },
        };
      }

      const multiplier = exponentialBackoff ? 2 ** (attempts - 1) : 1;
      await delay(retryDelayMs * multiplier);
    }
  }

  return {
    result: null,
    meta: {
      ok: false,
      attempts,
      durationMs: Date.now() - startedAt,
      lastError,
    },
  };
}

export class ApplicationSyncCoordinator {
  private readonly transport: ApplicationSyncTransport;
  private readonly retryPolicy: ApplicationSyncRetryPolicy;
  private queue: Promise<void> = Promise.resolve();

  constructor(
    transport: ApplicationSyncTransport,
    options: ApplicationSyncCoordinatorOptions = {},
  ) {
    this.transport = transport;
    this.retryPolicy = options.retryPolicy ?? {};
  }

  async syncSnapshot(
    snapshot: ApplicationSyncSnapshot,
  ): Promise<ApplicationSyncResult> {
    return await this.enqueue(async () => {
      const startedAt = Date.now();

      if (this.transport.persistSnapshot) {
        const { meta } = await runApplicationSyncWithRetry(
          () => this.transport.persistSnapshot?.(snapshot),
          this.retryPolicy,
        );

        return meta;
      }

      const sectionResult = await this.syncSections(snapshot);

      return {
        ok: sectionResult.ok,
        attempts: sectionResult.attempts,
        durationMs: Date.now() - startedAt,
        lastError: sectionResult.lastError,
      };
    });
  }

  async syncSection(
    input: ApplicationSectionSyncInput,
  ): Promise<ApplicationSyncResult> {
    return await this.enqueue(async () => {
      const startedAt = Date.now();

      if (this.transport.persistSection) {
        const { meta } = await runApplicationSyncWithRetry(
          () =>
            this.transport.persistSection?.(
              input.section,
              input.value,
              input.snapshot,
            ),
          this.retryPolicy,
        );

        return meta;
      }

      return {
        ok: false,
        attempts: 0,
        durationMs: Date.now() - startedAt,
        lastError:
          "Application sync transport is not configured for section sync.",
      };
    });
  }

  async syncSections(
    snapshot: ApplicationSyncSnapshot,
  ): Promise<ApplicationSyncResult> {
    const startedAt = Date.now();

    const sections = getOrderedSections(
      snapshot.dirtySections,
      snapshot.sections,
    );

    if (!this.transport.persistSection) {
      return {
        ok: false,
        attempts: 0,
        durationMs: Date.now() - startedAt,
        lastError:
          "Application sync transport is not configured for section sync.",
      };
    }

    let attempts = 1;
    let lastError: string | null = null;

    if (sections.length === 0) {
      return {
        ok: true,
        attempts,
        durationMs: Date.now() - startedAt,
        lastError: null,
      };
    }

    for (const section of sections) {
      const { meta } = await runApplicationSyncWithRetry(
        () =>
          this.transport.persistSection?.(
            section,
            snapshot.sections[section],
            snapshot,
          ),
        this.retryPolicy,
      );

      attempts = Math.max(attempts, meta.attempts);

      if (!meta.ok) {
        lastError = meta.lastError;

        return {
          ok: false,
          attempts,
          durationMs: Date.now() - startedAt,
          lastError,
        };
      }
    }

    return {
      ok: true,
      attempts,
      durationMs: Date.now() - startedAt,
      lastError,
    };
  }

  async clearRemoteState(
    applicationId: string | null,
  ): Promise<ApplicationSyncResult> {
    return await this.enqueue(async () => {
      const startedAt = Date.now();

      if (!this.transport.clearRemoteState) {
        return {
          ok: false,
          attempts: 0,
          durationMs: Date.now() - startedAt,
          lastError:
            "Application sync transport is not configured for remote clear.",
        };
      }

      const normalizedApplicationId = normalizeApplicationId(applicationId);

      const { meta } = await runApplicationSyncWithRetry(
        () => this.transport.clearRemoteState?.(normalizedApplicationId),
        this.retryPolicy,
      );

      return meta;
    });
  }

  private async enqueue(
    operation: () => Promise<ApplicationSyncResult>,
  ): Promise<ApplicationSyncResult> {
    const next = this.queue.then(operation, operation);

    this.queue = next.then(
      () => undefined,
      () => undefined,
    );

    return await next;
  }
}

export function createApplicationSyncCoordinator(
  transport: ApplicationSyncTransport,
  options: ApplicationSyncCoordinatorOptions = {},
): ApplicationSyncCoordinator {
  return new ApplicationSyncCoordinator(transport, options);
}

export async function syncApplicationSnapshot(
  transport: ApplicationSyncTransport,
  snapshot: ApplicationSyncSnapshot,
  options: ApplicationSyncCoordinatorOptions = {},
): Promise<ApplicationSyncResult> {
  const coordinator = createApplicationSyncCoordinator(transport, options);
  return await coordinator.syncSnapshot(snapshot);
}

export async function syncApplicationSection(
  transport: ApplicationSyncTransport,
  input: ApplicationSectionSyncInput,
  options: ApplicationSyncCoordinatorOptions = {},
): Promise<ApplicationSyncResult> {
  const coordinator = createApplicationSyncCoordinator(transport, options);
  return await coordinator.syncSection(input);
}

export async function clearApplicationRemoteState(
  transport: ApplicationSyncTransport,
  applicationId: string | null,
  options: ApplicationSyncCoordinatorOptions = {},
): Promise<ApplicationSyncResult> {
  const coordinator = createApplicationSyncCoordinator(transport, options);
  return await coordinator.clearRemoteState(applicationId);
}