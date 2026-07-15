// =========================================================
// CIRGLOB — APPLICATION STATUS HELPERS
// =========================================================
//
// Purpose:
// Centralized lifecycle semantics for application state.
//
// This file intentionally contains:
// - status guards
// - editability checks
// - lock checks
// - submission checks
// - lifecycle convenience helpers
//
// This file intentionally does NOT contain:
// - persistence logic
// - auth logic
// - Supabase access
// - routing logic
// - UI logic
// - validation schema definitions
//
// Keep lifecycle decisions centralized so database rules,
// runtime orchestration, and UI states stay aligned.
// =========================================================

import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS,
  EDITABLE_APPLICATION_STATUSES,
  SUBMISSION_LOCK_STATUSES,
  type ApplicationStatus,
} from "./constants";

export type ApplicationStatusInput =
  | ApplicationStatus
  | string
  | null
  | undefined;

const APPLICATION_STATUS_SET: ReadonlySet<string> =
  new Set(APPLICATION_STATUSES);

const EDITABLE_STATUS_SET: ReadonlySet<string> = new Set(
  EDITABLE_APPLICATION_STATUSES,
);

const LOCKED_STATUS_SET: ReadonlySet<string> = new Set(
  SUBMISSION_LOCK_STATUSES,
);

function normalizeStatus(status: ApplicationStatusInput): string {
  if (typeof status !== "string") return "";
  return status.trim().toUpperCase();
}

/**
 * Returns true when the value is a recognized application status.
 */
export function isApplicationStatus(
  status: ApplicationStatusInput,
): status is ApplicationStatus {
  return APPLICATION_STATUS_SET.has(normalizeStatus(status));
}

/**
 * Returns true when the application is still in draft state.
 */
export function isDraft(status: ApplicationStatusInput): boolean {
  return normalizeStatus(status) === APPLICATION_STATUS.DRAFT;
}

/**
 * Returns true when the application has been submitted.
 */
export function isSubmitted(status: ApplicationStatusInput): boolean {
  return normalizeStatus(status) === APPLICATION_STATUS.SUBMITTED;
}

/**
 * Returns true when the application is in any immutable state.
 */
export function isLocked(status: ApplicationStatusInput): boolean {
  return LOCKED_STATUS_SET.has(normalizeStatus(status));
}

/**
 * Compatibility alias for existing runtime imports.
 */
export function isApplicationLocked(status: ApplicationStatusInput): boolean {
  return isLocked(status);
}

/**
 * Returns true when the application may still be edited.
 */
export function canEditApplication(status: ApplicationStatusInput): boolean {
  return EDITABLE_STATUS_SET.has(normalizeStatus(status));
}

/**
 * Returns true when the application can transition from draft to submitted.
 *
 * This is intentionally strict so runtime orchestration and server-side
 * submission logic share the same lifecycle gate.
 */
export function canSubmitApplication(status: ApplicationStatusInput): boolean {
  return isDraft(status);
}

/**
 * Returns a normalized application status when the value is valid.
 * Invalid values return null instead of throwing, which is safer for
 * runtime hydration and defensive rendering paths.
 */
export function parseApplicationStatus(
  status: ApplicationStatusInput,
): ApplicationStatus | null {
  const normalized = normalizeStatus(status);
  return isApplicationStatus(normalized) ? normalized : null;
}