// lib/cirglob-runtime/founder-profile-validation.ts

import { z, type ZodTypeAny } from "zod";

import {
  FOUNDER_PROFILE_SECTION_LABELS,
  FOUNDER_PROFILE_SECTION_ORDER,
  type FounderProfileSection,
} from "../constants";

export type FounderProfileValidationMode = "draft" | "submit";

export type FounderProfileSectionSchemaPair = {
  draft?: ZodTypeAny;
  submit?: ZodTypeAny;
};

export type FounderProfileSectionSchemaVariant =
  | ZodTypeAny
  | FounderProfileSectionSchemaPair;

export type FounderProfileSectionSchemaRegistry = Partial<
  Record<FounderProfileSection, FounderProfileSectionSchemaVariant>
>;

export type FounderProfileSectionValidationResult = {
  section: FounderProfileSection;
  label: string;
  valid: boolean;
  required: boolean;
  missing: boolean;
  issues: string[];
};

export type FounderProfileProgressSummary = {
  completionPercentage: number;
  totalSections: number;
  completedSections: number;
  missingSections: readonly FounderProfileSection[];
  invalidSections: readonly FounderProfileSection[];
};

export type FounderProfileValidationResult = FounderProfileProgressSummary & {
  valid: boolean;
  canSubmit: boolean;
  sectionResults: readonly FounderProfileSectionValidationResult[];
};

function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    if (typeof File !== "undefined" && value instanceof File) {
      return true;
    }

    if (typeof Blob !== "undefined" && value instanceof Blob) {
      return true;
    }

    if (value instanceof Map || value instanceof Set) {
      return value.size > 0;
    }

    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
}

const REQUIRED_FOUNDER_PROFILE_SECTIONS: ReadonlySet<FounderProfileSection> =
  new Set(FOUNDER_PROFILE_SECTION_ORDER);

function isRequiredSection(section: FounderProfileSection): boolean {
  return REQUIRED_FOUNDER_PROFILE_SECTIONS.has(section);
}

function isSchemaPair(
  schema: FounderProfileSectionSchemaVariant,
): schema is FounderProfileSectionSchemaPair {
  return (
    typeof schema === "object" &&
    schema !== null &&
    !("safeParse" in schema) &&
    ("draft" in schema || "submit" in schema)
  );
}

function resolveSchema(
  schema: FounderProfileSectionSchemaVariant | undefined,
  mode: FounderProfileValidationMode,
): ZodTypeAny | undefined {
  if (!schema) return undefined;
  if (!isSchemaPair(schema)) return schema;

  return mode === "submit" ? schema.submit ?? schema.draft : schema.draft ?? schema.submit;
}

function isSectionPresent(value: unknown): boolean {
  return isMeaningfulValue(value);
}

function validateFounderProfileSection(
  section: FounderProfileSection,
  value: unknown,
  schema: FounderProfileSectionSchemaVariant | undefined,
  mode: FounderProfileValidationMode,
): FounderProfileSectionValidationResult {
  const required = isRequiredSection(section);
  const label = FOUNDER_PROFILE_SECTION_LABELS[section];
  const present = isSectionPresent(value);
  const resolvedSchema = resolveSchema(schema, mode);

  if (!present) {
    return {
      section,
      label,
      valid: !required,
      required,
      missing: required,
      issues: required ? ["Required section is missing"] : [],
    };
  }

  if (!resolvedSchema) {
    return {
      section,
      label,
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
      label,
      valid: true,
      required,
      missing: false,
      issues: [],
    };
  }

  return {
    section,
    label,
    valid: false,
    required,
    missing: false,
    issues: parsed.error.issues.map((issue) => issue.message),
  };
}

export function getOrderedFounderProfileSections(): readonly FounderProfileSection[] {
  return FOUNDER_PROFILE_SECTION_ORDER;
}

export function validateFounderProfileSections(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): readonly FounderProfileSectionValidationResult[] {
  return FOUNDER_PROFILE_SECTION_ORDER.map((section) =>
    validateFounderProfileSection(section, data[section], schemas[section], mode),
  );
}

function summarizeFounderProfileValidation(
  sectionResults: readonly FounderProfileSectionValidationResult[],
): FounderProfileProgressSummary {
  const missingSections = sectionResults
    .filter((result) => result.required && result.missing)
    .map((result) => result.section);

  const invalidSections = sectionResults
    .filter((result) => !result.valid)
    .map((result) => result.section);

  const completedSections = sectionResults.filter(
    (result) => result.valid && !result.missing,
  ).length;

  const totalSections = sectionResults.length;

  return {
    completionPercentage:
      totalSections === 0
        ? 100
        : Math.round((completedSections / totalSections) * 100),
    totalSections,
    completedSections,
    missingSections,
    invalidSections,
  };
}

export function getFounderProfileProgressSummary(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): FounderProfileProgressSummary {
  return summarizeFounderProfileValidation(
    validateFounderProfileSections(data, schemas, mode),
  );
}

export function getMissingFounderProfileSections(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): readonly FounderProfileSection[] {
  return getFounderProfileProgressSummary(data, schemas, mode).missingSections;
}

export function getInvalidFounderProfileSections(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): readonly FounderProfileSection[] {
  return getFounderProfileProgressSummary(data, schemas, mode).invalidSections;
}

export function validateFounderProfile(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): FounderProfileValidationResult {
  const sectionResults = validateFounderProfileSections(data, schemas, mode);
  const summary = summarizeFounderProfileValidation(sectionResults);
  const submitSummary = summarizeFounderProfileValidation(
    validateFounderProfileSections(data, schemas, "submit"),
  );

  const valid =
    summary.missingSections.length === 0 && summary.invalidSections.length === 0;

  const canSubmit =
    submitSummary.missingSections.length === 0 &&
    submitSummary.invalidSections.length === 0;

  return {
    ...summary,
    valid,
    canSubmit,
    sectionResults,
  };
}

export function isFounderProfileComplete(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
): boolean {
  const result = validateFounderProfile(data, schemas, "submit");
  return result.canSubmit;
}

export function isFounderProfileValid(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): boolean {
  return validateFounderProfile(data, schemas, mode).valid;
}

export function hasFounderProfileValidationErrors(
  data: Partial<Record<FounderProfileSection, unknown>>,
  schemas: FounderProfileSectionSchemaRegistry = {},
  mode: FounderProfileValidationMode = "draft",
): boolean {
  return getInvalidFounderProfileSections(data, schemas, mode).length > 0;
}

export function createLooseObjectSchema() {
  return z.record(z.string(), z.unknown());
}