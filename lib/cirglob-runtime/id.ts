//lib/cirglob-runtime/id.ts
/**
 * Shared public ID utility for Cirglob.
 *
 * Goals:
 * - Pure, deterministic formatting/parsing helpers
 * - Secure random token generation only
 * - Stable prefix-based IDs for public routes and persisted entities
 * - No database, route, or permission logic
 */

const PUBLIC_ID_SEPARATOR = "_";
const PUBLIC_ID_TOKEN_BYTES = 16; // 128-bit token -> 32 hex chars

const PUBLIC_ID_PREFIX_REGEX = /^[a-z][a-z0-9-]*$/;
const PUBLIC_ID_TOKEN_REGEX = /^[a-f0-9]{32}$/i;

export const APPLICATION_ID_PREFIX = "app";
export const FOUNDER_PROFILE_ID_PREFIX = "founder-profile";

export type PublicIdParts = Readonly<{
  prefix: string;
  token: string;
}>;

export function normalizePublicIdPrefix(value: string): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!PUBLIC_ID_PREFIX_REGEX.test(normalized)) {
    return null;
  }

  return normalized;
}

function bytesToHex(bytes: Uint8Array): string {
  let output = "";
  for (const byte of bytes) {
    output += byte.toString(16).padStart(2, "0");
  }
  return output;
}

function createPublicIdToken(): string {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure crypto API unavailable for public ID generation.");
  }

  const bytes = new Uint8Array(PUBLIC_ID_TOKEN_BYTES);
  cryptoApi.getRandomValues(bytes);

  return bytesToHex(bytes);
}

export function formatPublicId(prefix: string, token: string): string {
  const normalizedPrefix = normalizePublicIdPrefix(prefix);
  const normalizedToken = token.trim().toLowerCase();

  if (!normalizedPrefix) {
    throw new Error(`Invalid public ID prefix: ${prefix}`);
  }

  if (!PUBLIC_ID_TOKEN_REGEX.test(normalizedToken)) {
    throw new Error(`Invalid public ID token: ${token}`);
  }

  return `${normalizedPrefix}${PUBLIC_ID_SEPARATOR}${normalizedToken}`;
}

export function generatePublicId(prefix: string): string {
  const normalizedPrefix = normalizePublicIdPrefix(prefix);

  if (!normalizedPrefix) {
    throw new Error(`Invalid public ID prefix: ${prefix}`);
  }

  return formatPublicId(normalizedPrefix, createPublicIdToken());
}

export function generateApplicationId(): string {
  return generatePublicId(APPLICATION_ID_PREFIX);
}

export function generateFounderProfileId(): string {
  return generatePublicId(FOUNDER_PROFILE_ID_PREFIX);
}

export function isValidFounderProfileId(value: unknown): value is string {
  return isValidPublicId(value, FOUNDER_PROFILE_ID_PREFIX);
}

export function assertValidFounderProfileId(
  value: unknown,
): asserts value is string {
  assertValidPublicId(value, FOUNDER_PROFILE_ID_PREFIX);
}

export function extractFounderProfileIdPrefix(value: string): string | null {
  return extractPublicIdPrefix(value) === FOUNDER_PROFILE_ID_PREFIX
    ? FOUNDER_PROFILE_ID_PREFIX
    : null;
}

export function parsePublicId(value: string): PublicIdParts | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const separatorIndex = trimmed.indexOf(PUBLIC_ID_SEPARATOR);
  if (separatorIndex <= 0) return null;

  const prefix = normalizePublicIdPrefix(trimmed.slice(0, separatorIndex));
  const token = trimmed.slice(separatorIndex + 1).toLowerCase();

  if (!prefix) return null;
  if (!PUBLIC_ID_TOKEN_REGEX.test(token)) return null;

  return { prefix, token };
}

export function extractPublicIdPrefix(value: string): string | null {
  return parsePublicId(value)?.prefix ?? null;
}

export function extractPublicIdToken(value: string): string | null {
  return parsePublicId(value)?.token ?? null;
}

export function isValidPublicId(
  value: unknown,
  expectedPrefix?: string,
): value is string {
  if (typeof value !== "string") return false;

  const parsed = parsePublicId(value);
  if (!parsed) return false;

  if (expectedPrefix === undefined) return true;

  const normalizedExpectedPrefix = normalizePublicIdPrefix(expectedPrefix);
  if (!normalizedExpectedPrefix) return false;

  return parsed.prefix === normalizedExpectedPrefix;
}

export function assertValidPublicId(
  value: unknown,
  expectedPrefix?: string,
): asserts value is string {
  if (!isValidPublicId(value, expectedPrefix)) {
    const normalizedExpectedPrefix =
      expectedPrefix !== undefined
        ? normalizePublicIdPrefix(expectedPrefix)
        : null;

    const prefixLabel = normalizedExpectedPrefix
      ? ` with prefix "${normalizedExpectedPrefix}"`
      : "";

    throw new Error(`Invalid public ID${prefixLabel}.`);
  }
}