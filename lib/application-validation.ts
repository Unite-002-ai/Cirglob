import { z, type ZodTypeAny } from "zod";

import {
  APPLICATION_SECTION_METADATA,
  REQUIRED_APPLICATION_SECTIONS,
  getOrderedApplicationSections,
} from "./application-sections";
import {
  APPLICATION_STATUS,
  SUBMISSION_LOCK_STATUSES,
  type ApplicationSection,
  type ApplicationStatus,
} from "./constants";
import {
  type SectionSchemaPair,
  type SectionSchemaRegistry,
  type SectionSchemaVariant,
} from "./validators";

export type ApplicationStatusInput =
  | ApplicationStatus
  | string
  | null
  | undefined;

const APPLICATION_STATUS_SET: ReadonlySet<string> = new Set(
  Object.values(APPLICATION_STATUS),
);

const SUBMIT_MODE_STATUS_SET: ReadonlySet<string> = new Set([
  APPLICATION_STATUS.SUBMITTED,
  ...SUBMISSION_LOCK_STATUSES,
]);

function normalizeStatus(status: ApplicationStatusInput): string {
  if (typeof status !== "string") return "";
  return status.trim().toUpperCase();
}

function isSubmitModeStatus(status: ApplicationStatusInput): boolean {
  return SUBMIT_MODE_STATUS_SET.has(normalizeStatus(status));
}

/**
 * =========================================================
 * CIRGLOB — APPLICATION VALIDATION ORCHESTRATION
 * =========================================================
 *
 * Purpose:
 * Centralized cross-section validation orchestration for the
 * application runtime.
 *
 * This file intentionally contains:
 * - completion calculations
 * - missing section detection
 * - invalid section detection
 * - submission readiness checks
 * - progress calculations
 * - schema orchestration helpers
 *
 * This file intentionally does NOT contain:
 * - UI rendering logic
 * - Supabase access
 * - auth/session logic
 * - permissions storage
 * - persistence orchestration
 * - section schema definitions themselves
 *
 * The actual schemas live in lib/validators.ts and the section
 * registry lives in lib/application-sections.ts.
 * =========================================================
 */

export type ValidationMode = "draft" | "submit";

/**
 * Describes the validation outcome for a single section.
 */
export type SectionValidationResult = {
  section: ApplicationSection;
  valid: boolean;
  required: boolean;
  missing: boolean;
  issues: string[];
};

/**
 * Describes the overall application validation outcome.
 */
export type ApplicationValidationResult = {
  valid: boolean;
  canSubmit: boolean;
  completionPercentage: number;
  totalSections: number;
  completedSections: number;
  missingSections: readonly ApplicationSection[];
  invalidSections: readonly ApplicationSection[];
  sectionResults: readonly SectionValidationResult[];
};

const ORDERED_APPLICATION_SECTIONS = getOrderedApplicationSections();

/**
 * Treats undefined, null, blank strings, empty arrays, and empty
 * plain objects as incomplete.
 */
export function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    if (typeof File !== "undefined" && value instanceof File) {
      return value.size > 0;
    }

    if (value instanceof Map || value instanceof Set) {
      return value.size > 0;
    }

    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
}

/**
 * Returns true when a payload should be considered present enough to
 * attempt validation.
 */
export function isSectionPayloadPresent(value: unknown): boolean {
  return isMeaningfulValue(value);
}

function isSectionSchemaPair(schema: SectionSchemaVariant): schema is SectionSchemaPair {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "draft" in schema &&
    "submit" in schema
  );
}

function resolveSchema(
  schema: SectionSchemaVariant | undefined,
  mode: ValidationMode,
): ZodTypeAny | undefined {
  if (!schema) return undefined;
  return isSectionSchemaPair(schema) ? schema[mode] : schema;
}

function isRequiredSection(section: ApplicationSection): boolean {
  return REQUIRED_APPLICATION_SECTIONS.includes(section);
}

export function getValidationModeForStatus(
  status: ApplicationStatusInput,
): ValidationMode {
  return isSubmitModeStatus(status) ? "submit" : "draft";
}

/**
 * Safely validates a section payload against an optional schema.
 *
 * Draft mode uses a permissive schema so autosave and incremental
 * hydration do not fail on partially completed sections.
 *
 * Submit mode uses the strict schema so submission readiness is
 * deterministic and reproducible.
 */
export function validateSectionPayload<T = unknown>(
  section: ApplicationSection,
  value: T,
  schema?: SectionSchemaVariant,
  mode: ValidationMode = "draft",
): SectionValidationResult {
  const required = isRequiredSection(section);
  const present = isSectionPayloadPresent(value);
  const resolvedSchema = resolveSchema(schema, mode);

  if (!present) {
    return {
      section,
      valid: !required,
      required,
      missing: required,
      issues: required ? ["Required section is missing"] : [],
    };
  }

  if (!resolvedSchema) {
    return {
      section,
      valid: true,
      required,
      missing: false,
      issues: [],
    };
  }

  const parsed = resolvedSchema.safeParse(value);

  if (parsed.success) {
    return {
      section,
      valid: true,
      required,
      missing: false,
      issues: [],
    };
  }

  return {
    section,
    valid: false,
    required,
    missing: false,
    issues: parsed.error.issues.map((issue) => issue.message),
  };
}

/**
 * Returns all section validation results in canonical order.
 */
export function validateApplicationSections(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): readonly SectionValidationResult[] {
  return ORDERED_APPLICATION_SECTIONS.map((section) =>
    validateSectionPayload(section, data[section], schemas[section], mode),
  );
}

/**
 * Determines the sections that are missing required content.
 */
export function getMissingSections(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): readonly ApplicationSection[] {
  return validateApplicationSections(data, schemas, mode)
    .filter((result) => result.required && result.missing)
    .map((result) => result.section);
}

/**
 * Determines the sections that have validation failures.
 */
export function getInvalidSections(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): readonly ApplicationSection[] {
  return validateApplicationSections(data, schemas, mode)
    .filter((result) => !result.valid)
    .map((result) => result.section);
}

/**
 * Returns true when all required sections are present and valid.
 */
export function canSubmitApplication(
  status: ApplicationStatusInput,
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "submit",
): boolean {
  if (normalizeStatus(status) !== APPLICATION_STATUS.DRAFT) return false;

  const invalidSections = getInvalidSections(data, schemas, mode);
  const missingSections = getMissingSections(data, schemas, mode);

  return invalidSections.length === 0 && missingSections.length === 0;
}

/**
 * Returns the percentage of required sections that are complete.
 */
export function calculateCompletionPercentage(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): number {
  if (REQUIRED_APPLICATION_SECTIONS.length === 0) return 100;

  const sectionResults = validateApplicationSections(data, schemas, mode);
  const completedRequired = sectionResults.filter(
    (result) => result.required && result.valid && !result.missing,
  ).length;

  return Math.round(
    (completedRequired / REQUIRED_APPLICATION_SECTIONS.length) * 100,
  );
}

/**
 * Returns the number of completed required sections.
 */
export function getCompletedRequiredSectionCount(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): number {
  return validateApplicationSections(data, schemas, mode).filter(
    (result) => result.required && result.valid && !result.missing,
  ).length;
}

/**
 * Returns the total number of required sections.
 */
export function getRequiredSectionCount(): number {
  return REQUIRED_APPLICATION_SECTIONS.length;
}

/**
 * Returns a normalized progress summary that downstream runtime code
 * can consume without duplicating logic.
 */
export function getApplicationProgressSummary(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): {
  completionPercentage: number;
  requiredSections: readonly ApplicationSection[];
  completedRequiredSections: number;
  missingSections: readonly ApplicationSection[];
  invalidSections: readonly ApplicationSection[];
} {
  const missingSections = getMissingSections(data, schemas, mode);
  const invalidSections = getInvalidSections(data, schemas, mode);

  return {
    completionPercentage: calculateCompletionPercentage(data, schemas, mode),
    requiredSections: REQUIRED_APPLICATION_SECTIONS,
    completedRequiredSections: getCompletedRequiredSectionCount(
      data,
      schemas,
      mode,
    ),
    missingSections,
    invalidSections,
  };
}

/**
 * Produces a full validation result for application state.
 *
 * The `valid` field stays aligned with submission readiness to avoid
 * changing existing runtime expectations.
 */
export function validateApplication(
  status: ApplicationStatusInput,
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode?: ValidationMode,
): ApplicationValidationResult {
  const validationMode = mode ?? getValidationModeForStatus(status);
  const sectionResults = validateApplicationSections(
    data,
    schemas,
    validationMode,
  );

  const missingSections = sectionResults
    .filter((result) => result.required && result.missing)
    .map((result) => result.section);

  const invalidSections = sectionResults
    .filter((result) => !result.valid)
    .map((result) => result.section);

  const completionPercentage = calculateCompletionPercentage(
    data,
    schemas,
    validationMode,
  );

  const canSubmit = canSubmitApplication(status, data, schemas, "submit");

  return {
    valid: canSubmit,
    canSubmit,
    completionPercentage,
    totalSections: ORDERED_APPLICATION_SECTIONS.length,
    completedSections: sectionResults.filter(
      (result) => result.valid && !result.missing,
    ).length,
    missingSections,
    invalidSections,
    sectionResults,
  };
}

/**
 * Returns a section-by-section map useful for UI progress rendering.
 */
export function getSectionValidationMap(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): Record<ApplicationSection, SectionValidationResult> {
  return ORDERED_APPLICATION_SECTIONS.reduce<
    Record<ApplicationSection, SectionValidationResult>
  >((acc, section) => {
    acc[section] = validateSectionPayload(
      section,
      data[section],
      schemas[section],
      mode,
    );
    return acc;
  }, {} as Record<ApplicationSection, SectionValidationResult>);
}

/**
 * Returns the ordered section metadata for progress UIs.
 */
export function getApplicationSectionProgressItems(): readonly {
  section: ApplicationSection;
  label: string;
  order: number;
  required: boolean;
  recommended: boolean;
}[] {
  return ORDERED_APPLICATION_SECTIONS.map((section) => ({
    section,
    label: APPLICATION_SECTION_METADATA[section].label,
    order: APPLICATION_SECTION_METADATA[section].order,
    required: APPLICATION_SECTION_METADATA[section].completion === "required",
    recommended:
      APPLICATION_SECTION_METADATA[section].completion === "recommended",
  }));
}

/**
 * Defensive helper for callers that receive unknown application status values.
 */
export function getNormalizedApplicationStatus(
  status: ApplicationStatusInput,
): ApplicationStatus | null {
  const normalized = normalizeStatus(status);
  return APPLICATION_STATUS_SET.has(normalized)
    ? (normalized as ApplicationStatus)
    : null;
}

/**
 * Safe guard to ensure section values are shaped for validation input.
 */
export function hasSectionData(
  data: Partial<Record<ApplicationSection, unknown>>,
  section: ApplicationSection,
): boolean {
  return isSectionPayloadPresent(data[section]);
}

/**
 * Returns the canonical application section order as a readonly list.
 */
export function getOrderedSections(): readonly ApplicationSection[] {
  return ORDERED_APPLICATION_SECTIONS;
}

/**
 * Returns the canonical required application section order.
 */
export function getOrderedRequiredSections(): readonly ApplicationSection[] {
  return REQUIRED_APPLICATION_SECTIONS;
}

/**
 * Utility to determine whether the application has any validation work left.
 */
export function hasValidationErrors(
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode: ValidationMode = "draft",
): boolean {
  return getInvalidSections(data, schemas, mode).length > 0;
}

/**
 * Utility to determine whether the application is complete enough to
 * render as a read-only snapshot in later phases.
 */
export function isApplicationReadyForSnapshot(
  status: ApplicationStatusInput,
  data: Partial<Record<ApplicationSection, unknown>>,
  schemas: SectionSchemaRegistry = {},
  mode?: ValidationMode,
): boolean {
  const validationMode = mode ?? getValidationModeForStatus(status);

  return (
    isSubmitModeStatus(status) &&
    getInvalidSections(data, schemas, validationMode).length === 0
  );
}

/**
 * Shared no-op zod schema helper for future phased migrations.
 * Useful when a section is enabled in the registry before the full
 * schema is ready.
 */
export function createLooseObjectSchema() {
  return z.record(z.string(), z.unknown());
}

/**
 * Re-export the registry types so other runtime layers do not need
 * to import directly from the schema file.
 */
export type { SectionSchemaRegistry, SectionSchemaVariant };