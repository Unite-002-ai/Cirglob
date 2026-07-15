// lib/cirglob-runtime/runtime-errors.ts

/**
 * Shared, policy-free runtime error contract for Cirglob client runtime engines.
 * Keep this file side-effect free and dependency-light.
 */

export const CIRGLOB_RUNTIME_ERROR_CODES = [
  "RUNTIME_NOT_HYDRATED",
  "RUNTIME_INVALID_STATE",
  "RUNTIME_LOCKED",
  "RUNTIME_MUTATION_REJECTED",
  "RUNTIME_PERSISTENCE_FAILED",
  "RUNTIME_SYNC_FAILED",
  "RUNTIME_ROLLBACK_FAILED",
  "RUNTIME_STORAGE_CORRUPT",
  "RUNTIME_INVALID_INPUT",
  "RUNTIME_CONFLICT",
] as const;

export type CirglobRuntimeErrorCode =
  (typeof CIRGLOB_RUNTIME_ERROR_CODES)[number];

export type CirglobRuntimeErrorDetails = Readonly<Record<string, unknown>>;

export type CirglobRuntimeErrorOptions = {
  cause?: unknown;
  details?: CirglobRuntimeErrorDetails;
};

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCirglobRuntimeErrorCode(
  value: unknown,
): value is CirglobRuntimeErrorCode {
  return (
    typeof value === "string" &&
    (CIRGLOB_RUNTIME_ERROR_CODES as readonly string[]).includes(value)
  );
}

export class CirglobRuntimeError extends Error {
  public readonly code: CirglobRuntimeErrorCode;
  public readonly details?: CirglobRuntimeErrorDetails;
  public readonly cause?: unknown;

  constructor(
    code: CirglobRuntimeErrorCode,
    message: string,
    options: CirglobRuntimeErrorOptions = {},
  ) {
    super(message);

    this.name = "CirglobRuntimeError";
    this.code = code;

    if (options.details) {
      this.details = Object.freeze({ ...options.details });
    }

    if (typeof options.cause !== "undefined") {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): {
    name: string;
    code: CirglobRuntimeErrorCode;
    message: string;
    details?: CirglobRuntimeErrorDetails;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export function createCirglobRuntimeError(
  code: CirglobRuntimeErrorCode,
  message: string,
  options: CirglobRuntimeErrorOptions = {},
): CirglobRuntimeError {
  return new CirglobRuntimeError(code, message, options);
}

export function isCirglobRuntimeError(value: unknown): value is CirglobRuntimeError {
  if (!isObjectLike(value)) return false;

  const candidate = value as Partial<CirglobRuntimeError> & {
    name?: unknown;
    code?: unknown;
    message?: unknown;
  };

  return (
    candidate.name === "CirglobRuntimeError" &&
    isCirglobRuntimeErrorCode(candidate.code) &&
    typeof candidate.message === "string"
  );
}

export function assertCirglobRuntimeError(
  value: unknown,
  fallbackCode: CirglobRuntimeErrorCode = "RUNTIME_INVALID_STATE",
): asserts value is CirglobRuntimeError {
  if (isCirglobRuntimeError(value)) return;

  throw createCirglobRuntimeError(
    fallbackCode,
    "Unexpected runtime error shape.",
    {
      details: {
        receivedType: typeof value,
      },
    },
  );
}