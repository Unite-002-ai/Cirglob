import "server-only";

import { createHash, randomBytes } from "crypto";

import { INVITATION, SECURITY } from "@/lib/constants";

/**
 * =========================================================
 * CIRGLOB — INVITATION TOKEN HELPERS
 * =========================================================
 *
 * PURPOSE
 * -------
 * Centralized, server-only token generation and hashing for
 * the cofounder invitation system.
 *
 * SECURITY CONTRACT
 * -----------------
 * - Raw tokens are generated with cryptographically secure
 *   randomness (Node.js crypto.randomBytes).
 * - Only the SHA-256 hash of the raw token is stored in the
 *   database. The raw token is sent only in the email.
 * - Lookups always compare the hash, never the raw value.
 * - This file MUST remain server-only and never be imported
 *   by client components.
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Database access
 * - Email sending
 * - Route logic
 * - Permissions
 * =========================================================
 */

const TOKEN_BYTES = INVITATION.TOKEN_LENGTH_BYTES;
const TOKEN_HASH_ALGORITHM = "sha256";
const RAW_TOKEN_HEX_LENGTH = TOKEN_BYTES * 2;

/**
 * Generates a cryptographically secure raw invitation token.
 *
 * Returns a lowercase hex string of length TOKEN_BYTES * 2.
 * This value is sent in the email and MUST NOT be stored in
 * the database in its raw form.
 */
export function generateInvitationToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Produces the SHA-256 hash of a raw token.
 *
 * This is the value stored in application_invitations.token.
 * All database lookups compare against this hash.
 */
export function hashInvitationToken(rawToken: string): string {
  return createHash(TOKEN_HASH_ALGORITHM)
    .update(rawToken, "utf8")
    .digest("hex");
}

/**
 * Normalizes a raw token value from an HTTP request.
 *
 * Strips whitespace and lowercases. Does not validate.
 */
export function normalizeRawInvitationToken(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Returns true when the value looks like a valid raw invitation token.
 *
 * Used for cheap early rejection at the route layer before
 * any database lookup is performed.
 */
export function isValidRawInvitationToken(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase();

  if (normalized.length !== RAW_TOKEN_HEX_LENGTH) return false;
  if (normalized.length < SECURITY.INVITATION_TOKEN_MIN_LENGTH) return false;

  return /^[a-f0-9]+$/.test(normalized);
}