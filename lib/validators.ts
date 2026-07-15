import { z } from "zod";

import {
  APPLICATION_MEMBER_ROLES,
  APPLICATION_SECTIONS,
  FOUNDER_PROFILE_SECTIONS,
  type ApplicationSection,
  type FounderProfileSection,
} from "./constants";

/**
 * =========================================================
 * CIRGLOB — VALIDATION + SANITIZATION LAYER
 * =========================================================
 *
 * PURPOSE
 * -------
 * Centralized validation system for:
 *
 * - auth flows
 * - account/profile updates
 * - identity normalization
 * - input sanitization
 * - application section schemas
 * - founder profile schemas
 *
 * IMPORTANT ARCHITECTURE RULES
 * ----------------------------
 * This file MUST remain:
 *
 * - framework-agnostic
 * - database-agnostic
 * - role-agnostic
 * - ecosystem-agnostic
 *
 * DO NOT ADD:
 * - permissions logic
 * - orchestration logic
 * - persistence logic
 * - route logic
 *
 * This file defines schemas and schema pairs only.
 * =========================================================
 */

/* ========================================================
   CONSTANTS
======================================================== */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 120;

export const EMAIL_MAX_LENGTH = 320;

export const AVATAR_URL_MAX_LENGTH = 2048;

export const PHONE_MAX_LENGTH = 32;
export const SOCIAL_HANDLE_MAX_LENGTH = 64;
export const URL_MAX_LENGTH = 2048;

export const SECTION_TEXT_MAX_LENGTH = 10_000;
export const SECTION_SUMMARY_MAX_LENGTH = 4_000;
export const SECTION_LONG_TEXT_MAX_LENGTH = 20_000;

/* ========================================================
   SANITIZATION UTILITIES
======================================================== */

/**
 * Normalizes email for:
 * - auth consistency
 * - uniqueness stability
 * - login reliability
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Basic string sanitization.
 *
 * Prevents:
 * - accidental malformed input
 * - inconsistent spacing
 * - primitive injection vectors
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

/**
 * Sanitizes optional strings safely.
 */
export function sanitizeOptionalString(
  input?: string | null,
): string | undefined {
  if (input === null || input === undefined) return undefined;

  const sanitized = sanitizeString(input);
  return sanitized.length > 0 ? sanitized : undefined;
}

/**
 * Sanitizes URL-like strings conservatively.
 */
export function sanitizeUrl(input: string): string {
  return input.trim();
}

/**
 * Normalizes phone values to a stable, human-readable format boundary.
 *
 * This intentionally does not attempt locale-specific formatting.
 */
export function sanitizePhone(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes social handles for stable storage.
 */
export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, "").toLowerCase();
}

/* ========================================================
   SHARED SCHEMA PRIMITIVES
======================================================== */

const NAME_PATTERN = /^[\p{L}\p{M}\s'-]+$/u;
const SOCIAL_HANDLE_PATTERN = /^@?[\p{L}\p{N}._-]{1,64}$/u;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,32}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const emailSchema = z
  .string()
  .trim()
  .max(EMAIL_MAX_LENGTH, "Email is too long")
  .email("Invalid email address")
  .transform(normalizeEmail);

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`,
  )
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const firstNameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, "First name is required")
  .max(NAME_MAX_LENGTH, "First name is too long")
  .regex(NAME_PATTERN, "First name contains invalid characters")
  .transform(sanitizeString);

export const lastNameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, "Last name is required")
  .max(NAME_MAX_LENGTH, "Last name is too long")
  .regex(NAME_PATTERN, "Last name contains invalid characters")
  .transform(sanitizeString);

export const fullNameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, "Full name is required")
  .max(NAME_MAX_LENGTH, "Full name is too long")
  .regex(NAME_PATTERN, "Full name contains invalid characters")
  .transform(sanitizeString);

export const avatarUrlSchema = z
  .string()
  .trim()
  .max(AVATAR_URL_MAX_LENGTH, "Avatar URL is too long")
  .url("Invalid avatar URL")
  .transform(sanitizeUrl);

export const urlSchema = z
  .string()
  .trim()
  .max(URL_MAX_LENGTH, "URL is too long")
  .url("Invalid URL")
  .transform(sanitizeUrl);

export const phoneSchema = z
  .string()
  .trim()
  .max(PHONE_MAX_LENGTH, "Phone number is too long")
  .regex(PHONE_PATTERN, "Invalid phone number")
  .transform(sanitizePhone);

export const socialHandleSchema = z
  .string()
  .trim()
  .max(SOCIAL_HANDLE_MAX_LENGTH, "Handle is too long")
  .regex(SOCIAL_HANDLE_PATTERN, "Invalid social handle")
  .transform(normalizeHandle);

export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .transform(sanitizeString);

export const optionalStringSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => sanitizeOptionalString(value ?? undefined));

export const uuidSchema = z.string().uuid("Invalid UUID");

export const optionalUuidSchema = z
  .union([uuidSchema, z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    return value;
  });

export const booleanLikeSchema = z
  .union([
    z.boolean(),
    z.literal(0),
    z.literal(1),
    z.literal("0"),
    z.literal("1"),
  ])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    return value === 1 || value === "1";
  });

export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Must contain only digits");

export const positiveIntegerSchema = z.coerce
  .number()
  .int("Must be an integer")
  .positive("Must be greater than zero");

export const nonNegativeIntegerSchema = z.coerce
  .number()
  .int("Must be an integer")
  .min(0, "Must be zero or greater");

export const isoDateSchema = z
  .string()
  .trim()
  .regex(ISO_DATE_PATTERN, "Invalid date format");

/* ========================================================
   OPTIONAL STRING HELPERS
======================================================== */

function optionalText(maxLength: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return undefined;

      const sanitized = sanitizeString(value);
      if (sanitized.length === 0) return undefined;
      return sanitized.slice(0, maxLength);
    });
}

function optionalUrl() {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return undefined;

      const trimmed = sanitizeUrl(value);
      if (trimmed.length === 0) return undefined;
      return urlSchema.parse(trimmed);
    });
}

function optionalEmail() {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return undefined;

      const trimmed = value.trim();
      if (trimmed.length === 0) return undefined;
      return emailSchema.parse(trimmed);
    });
}

/* ========================================================
   AUTH VALIDATION
======================================================== */

/**
 * SIGN UP
 *
 * Accepts the current identity model and remains compatible with
 * existing profile bootstrap flows.
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: firstNameSchema.optional(),
  last_name: lastNameSchema.optional(),
  full_name: fullNameSchema.optional(),
  avatar_url: avatarUrlSchema.optional(),
});

/**
 * SIGN IN
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(PASSWORD_MAX_LENGTH),
});

/**
 * RESET PASSWORD
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

/**
 * FORGOT PASSWORD
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * AUTH CALLBACK / REDIRECT STATE
 *
 * Keep this intentionally minimal and generic so middleware,
 * server actions, and auth callbacks can share it safely.
 */
export const authCallbackSchema = z.object({
  next: z.string().trim().optional(),
  error: z.string().trim().optional(),
});

/* ========================================================
   PROFILE VALIDATION
======================================================== */

/**
 * IMPORTANT:
 * Profiles are UNIVERSAL identity only.
 *
 * The current identity model is:
 * - first_name
 * - last_name
 * - avatar_url
 * - completed
 *
 * full_name is retained as a compatibility field during migration.
 */
export const profileUpdateSchema = z.object({
  first_name: firstNameSchema.optional(),
  last_name: lastNameSchema.optional(),
  full_name: fullNameSchema.optional(),
  avatar_url: avatarUrlSchema.optional(),
  completed: booleanLikeSchema.optional(),
});

export const profileCreateSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  first_name: firstNameSchema.optional(),
  last_name: lastNameSchema.optional(),
  full_name: fullNameSchema.optional(),
  avatar_url: avatarUrlSchema.nullish(),
  completed: booleanLikeSchema.optional().default(false),
});

/* ========================================================
   SHARED ROLE / ENUM SCHEMAS
======================================================== */

export const applicationMemberRoleSchema = z.enum([
  APPLICATION_MEMBER_ROLES.OWNER,
  APPLICATION_MEMBER_ROLES.CO_FOUNDER,
]);

/* ========================================================
   SECTION SCHEMA TYPES
======================================================== */

export type SectionSchemaPair = {
  draft: z.ZodTypeAny;
  submit: z.ZodTypeAny;
};

export type SectionSchemaVariant = z.ZodTypeAny | SectionSchemaPair;

export type SectionSchemaRegistry = Partial<
  Record<ApplicationSection, SectionSchemaVariant>
>;

export type FounderProfileSchemaRegistry = Partial<
  Record<FounderProfileSection, SectionSchemaVariant>
>;

/* ========================================================
   REUSABLE FIELD SCHEMAS
======================================================== */

export const sectionTitleSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .transform(sanitizeString);

export const sectionTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(SECTION_TEXT_MAX_LENGTH)
  .transform(sanitizeString);

export const optionalSectionTextSchema = optionalText(SECTION_TEXT_MAX_LENGTH);
export const optionalSummarySchema = optionalText(SECTION_SUMMARY_MAX_LENGTH);
export const optionalLongTextSchema = optionalText(SECTION_LONG_TEXT_MAX_LENGTH);

const metricSchemaDraft = z
  .object({
    label: optionalText(200).optional(),
    value: optionalText(1_000).optional(),
    note: optionalText(1_000).optional(),
  })
  .passthrough();

const metricSchemaSubmit = z
  .object({
    label: nonEmptyStringSchema,
    value: nonEmptyStringSchema,
    note: optionalText(1_000).optional(),
  })
  .passthrough();

const yesNoAnswerSchema = z
  .union([
    z.literal(""),
    z.literal("Yes"),
    z.literal("No"),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (value === "Yes" || value === "No") return value;
    return "";
  });

/* ========================================================
   APPLICATION SECTION SCHEMAS
======================================================== */

/**
 * FOUNDERS
 *
 * Server-backed roster state lives outside the section draft.
 * This schema only covers the questionnaire answers.
 */
const foundersSectionDraftSchema = z
  .object({
    whoBuildsToday: optionalLongTextSchema.optional(),
    criticalWorkByNonFounders: yesNoAnswerSchema.optional(),
    criticalWorkExplain: optionalLongTextSchema.optional(),
    howFoundersMet: optionalLongTextSchema.optional(),
    metInPerson: yesNoAnswerSchema.optional(),
    metInPersonExplain: optionalLongTextSchema.optional(),
    allFullTime: yesNoAnswerSchema.optional(),
    fullTimeExplain: optionalLongTextSchema.optional(),
    whyTeam: optionalLongTextSchema.optional(),
    lookingForCoFounder: yesNoAnswerSchema.optional(),
    coFounderNeedExplain: optionalLongTextSchema.optional(),
  })
  .passthrough();

const foundersSectionSubmitSchema = z
  .object({
    whoBuildsToday: optionalLongTextSchema.optional(),
    criticalWorkByNonFounders: yesNoAnswerSchema.optional(),
    criticalWorkExplain: optionalLongTextSchema.optional(),
    howFoundersMet: optionalLongTextSchema.optional(),
    metInPerson: yesNoAnswerSchema.optional(),
    metInPersonExplain: optionalLongTextSchema.optional(),
    allFullTime: yesNoAnswerSchema.optional(),
    fullTimeExplain: optionalLongTextSchema.optional(),
    whyTeam: optionalLongTextSchema.optional(),
    lookingForCoFounder: yesNoAnswerSchema.optional(),
    coFounderNeedExplain: optionalLongTextSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.criticalWorkByNonFounders === "Yes" &&
      !sanitizeOptionalString(value.criticalWorkExplain)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["criticalWorkExplain"],
        message: "Please explain the non-founder work.",
      });
    }

    if (
      value.metInPerson === "No" &&
      !sanitizeOptionalString(value.metInPersonExplain)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["metInPersonExplain"],
        message: "Please explain how the founders collaborate across locations.",
      });
    }

    if (
      value.allFullTime === "No" &&
      !sanitizeOptionalString(value.fullTimeExplain)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullTimeExplain"],
        message: "Please explain the founders' current commitment status.",
      });
    }

    if (
      value.lookingForCoFounder === "Yes" &&
      !sanitizeOptionalString(value.coFounderNeedExplain)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coFounderNeedExplain"],
        message: "Please describe the founder or key early hire you need.",
      });
    }
  })
  .passthrough();

/**
 * FOUNDER VIDEO
 *
 * Draft state stores only serializable metadata.
 * Submit state requires a real uploaded asset reference.
 */
export const MAX_FOUNDER_VIDEO_DURATION_SECONDS = 90;

export const founderVideoUploadStatusSchema = z.enum([
  "idle",
  "selected",
  "validated",
  "uploaded",
  "error",
]);

export type FounderVideoUploadStatus = z.infer<
  typeof founderVideoUploadStatusSchema
>;

const founderVideoSectionDraftSchema = z
  .object({
    video_url: optionalUrl().optional(),
    asset_id: optionalText(120).optional(),
    storage_path: optionalText(500).optional(),
    file_name: optionalText(255).optional(),
    mime_type: optionalText(120).optional(),
    file_size_bytes: positiveIntegerSchema.optional(),
    duration_seconds: positiveIntegerSchema.optional(),
    upload_status: founderVideoUploadStatusSchema.optional(),
    title: optionalText(250).optional(),
    provider: optionalText(120).optional(),
    transcript: optionalLongTextSchema.optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

const founderVideoSectionSubmitSchema = z
  .object({
    video_url: urlSchema,
    asset_id: nonEmptyStringSchema,
    storage_path: nonEmptyStringSchema,
    file_name: nonEmptyStringSchema,
    mime_type: nonEmptyStringSchema,
    file_size_bytes: positiveIntegerSchema,
    duration_seconds: positiveIntegerSchema,
    upload_status: z.literal("uploaded"),
    title: sectionTitleSchema,
    provider: optionalText(120).optional(),
    transcript: optionalLongTextSchema.optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.duration_seconds > MAX_FOUNDER_VIDEO_DURATION_SECONDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration_seconds"],
        message: "Founder video must be 90 seconds or shorter.",
      });
    }
  })
  .passthrough();

/**
 * COMPANY
 */
const companyDemoVideoDraftSchema = z
  .object({
    name: optionalText(255).optional(),
    type: optionalText(120).optional(),
    lastModified: nonNegativeIntegerSchema.optional(),
    size: positiveIntegerSchema.optional(),
    storageKey: optionalText(500).optional(),
  })
  .passthrough();

const companyDemoVideoSubmitSchema = z
  .object({
    name: nonEmptyStringSchema,
    type: nonEmptyStringSchema,
    lastModified: nonNegativeIntegerSchema,
    size: positiveIntegerSchema,
    storageKey: nonEmptyStringSchema,
  })
  .passthrough();

const companySectionDraftSchema = z
  .object({
    company_name: optionalText(250).optional(),
    tagline: optionalText(60).optional(),
    website: optionalUrl().optional(),
    productUrl: optionalUrl().optional(),
    login: optionalLongTextSchema.optional(),
    whatBuilding: optionalLongTextSchema.optional(),
    problem: optionalLongTextSchema.optional(),
    customer: optionalLongTextSchema.optional(),
    location: optionalText(250).optional(),
    locationReason: optionalLongTextSchema.optional(),
    productDemoVideo: companyDemoVideoDraftSchema.nullish(),
  })
  .passthrough();

const companySectionSubmitSchema = z
  .object({
    company_name: sectionTitleSchema,
    tagline: z.string().trim().min(1).max(60).transform(sanitizeString),
    website: optionalUrl().optional(),
    productUrl: optionalUrl().optional(),
    login: optionalLongTextSchema.optional(),
    whatBuilding: sectionTextSchema,
    problem: sectionTextSchema,
    customer: sectionTextSchema,
    location: optionalText(250).optional(),
    locationReason: optionalLongTextSchema.optional(),
    productDemoVideo: companyDemoVideoSubmitSchema.nullish(),
  })
  .passthrough();

/**
 * PROGRESS
 */
const progressStageOptions = [
  "Research / exploration",
  "Building initial product",
  "Private testing",
  "Publicly available",
  "Active usage",
  "Revenue generating",
  "Scaling",
] as const;

const progressStageSchema = z.enum(progressStageOptions);

const progressYesNoSchema = z.enum(["Yes", "No"]);

const progressDraftTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return "";
    return sanitizeString(value);
  });

const progressOptionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    const sanitized = sanitizeString(value);
    return sanitized.length > 0 ? sanitized : undefined;
  });

const progressSectionDraftSchema = z
  .object({
    stage: progressDraftTextSchema,
    timeWorked: progressDraftTextSchema,
    stack: progressDraftTextSchema,

    hasUsers: progressDraftTextSchema,
    activeUsers: progressDraftTextSchema,
    payingCustomers: progressDraftTextSchema,
    monthlyRevenue: progressDraftTextSchema,
    fastestChange: progressDraftTextSchema,
    usageBlockers: progressDraftTextSchema,
    expectedLaunchTimeline: progressDraftTextSchema,

    mostImportantBuild: progressDraftTextSchema,
    userLearnings: progressDraftTextSchema,

    pivoted: progressDraftTextSchema,
    pivotExplanation: progressDraftTextSchema,
  })
  .passthrough();

const progressSectionSubmitSchema = z
  .object({
    stage: progressStageSchema,
    timeWorked: sectionTextSchema,
    stack: sectionTextSchema,

    hasUsers: progressYesNoSchema,
    activeUsers: progressOptionalTextSchema.optional(),
    payingCustomers: progressOptionalTextSchema.optional(),
    monthlyRevenue: progressOptionalTextSchema.optional(),
    fastestChange: progressOptionalTextSchema.optional(),
    usageBlockers: progressOptionalTextSchema.optional(),
    expectedLaunchTimeline: progressOptionalTextSchema.optional(),

    mostImportantBuild: sectionTextSchema,
    userLearnings: sectionTextSchema,

    pivoted: progressYesNoSchema,
    pivotExplanation: progressOptionalTextSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.hasUsers === "Yes") {
      if (!value.activeUsers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["activeUsers"],
          message: "Please provide the active user or deployment count.",
        });
      }

      if (!value.fastestChange) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fastestChange"],
          message: "Please describe the most important current improvement.",
        });
      }
    }

    if (value.hasUsers === "No") {
      if (!value.usageBlockers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["usageBlockers"],
          message: "Please describe what still needs to happen before usage begins.",
        });
      }

      if (!value.expectedLaunchTimeline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expectedLaunchTimeline"],
          message: "Please provide the expected launch or activation timeline.",
        });
      }
    }

    if (value.pivoted === "Yes" && !value.pivotExplanation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pivotExplanation"],
        message: "Please explain the change in direction.",
      });
    }
  })
  .passthrough();
  
/**
 * INSIGHT
 */
const insightCategoryOptions = [
  "AI",
  "SaaS",
  "Education",
  "Fintech",
  "Cybersecurity",
  "Healthcare",
  "Climate",
  "Consumer",
  "Marketplace",
  "Deep Tech",
  "Robotics",
  "Infrastructure",
  "Biotech",
  "Developer Tools",
  "Defense",
  "Other",
] as const;

const insightCategorySchema = z.enum(insightCategoryOptions);

const insightDraftTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return "";
    return sanitizeString(value);
  });

const insightSectionDraftSchema = z
  .object({
    whyProblemMatter: insightDraftTextSchema,
    whyNow: insightDraftTextSchema,
    marketInsight: insightDraftTextSchema,
    scalingDurable: insightDraftTextSchema,
    failureReason: insightDraftTextSchema,
    category: insightDraftTextSchema,
  })
  .passthrough();

const insightSectionSubmitSchema = z
  .object({
    whyProblemMatter: sectionTextSchema,
    whyNow: sectionTextSchema,
    marketInsight: sectionTextSchema,
    scalingDurable: sectionTextSchema,
    failureReason: sectionTextSchema,
    category: insightCategorySchema,
  })
  .passthrough();

/**
 * STRUCTURE & CAPITAL
 */
const structureCapitalFormationDraftSchema = z.union([
  z.literal(""),
  z.literal("Yes"),
  z.literal("No"),
]);

const structureCapitalFormationSchema = z.enum(["Yes", "No"]);

const structureCapitalYesNoDraftSchema = z.union([
  z.literal(""),
  z.literal("Yes"),
  z.literal("No"),
]);

const structureCapitalYesNoSchema = z.enum(["Yes", "No"]);

const structureCapitalCapitalSourceTypeDraftSchema = z.union([
  z.literal(""),
  z.literal("SAFE"),
  z.literal("Equity"),
  z.literal("Convertible note"),
  z.literal("Grant"),
  z.literal("Accelerator"),
  z.literal("Revenue financing"),
  z.literal("Other"),
]);

const structureCapitalCapitalSourceTypeSchema = z.enum([
  "SAFE",
  "Equity",
  "Convertible note",
  "Grant",
  "Accelerator",
  "Revenue financing",
  "Other",
]);

const structureCapitalFundingStatusDraftSchema = z.union([
  z.literal(""),
  z.literal("Closed"),
  z.literal("Committed"),
  z.literal("Pending"),
]);

const structureCapitalFundingStatusSchema = z.enum([
  "Closed",
  "Committed",
  "Pending",
]);

const structureCapitalFundingEntryDraftSchema = z
  .object({
    sourceName: optionalText(250).optional(),
    sourceType: structureCapitalCapitalSourceTypeDraftSchema.optional(),
    amount: optionalText(120).optional(),
    date: optionalText(120).optional(),
    status: structureCapitalFundingStatusDraftSchema.optional(),
  })
  .passthrough();

const structureCapitalFundingEntrySubmitSchema = z
  .object({
    sourceName: sectionTextSchema,
    sourceType: structureCapitalCapitalSourceTypeSchema.optional(),
    amount: sectionTextSchema,
    date: optionalText(120).optional(),
    status: structureCapitalFundingStatusSchema.optional(),
  })
  .passthrough();

const structureCapitalCompensationEntryDraftSchema = z
  .object({
    founder: optionalText(200).optional(),
    compensationType: optionalText(200).optional(),
    monthlyAmount: optionalText(120).optional(),
  })
  .passthrough();

const structureCapitalCompensationEntrySubmitSchema = z
  .object({
    founder: sectionTitleSchema,
    compensationType: sectionTitleSchema,
    monthlyAmount: optionalText(120).optional(),
  })
  .passthrough();

const structureCapitalFinancingPostureDraftSchema = z.union([
  z.literal(""),
  z.literal("Currently raising capital"),
  z.literal("Planning to raise later"),
  z.literal("Operating without outside fundraising"),
  z.literal("Undecided"),
]);

const structureCapitalFinancingPostureSchema = z.enum([
  "Currently raising capital",
  "Planning to raise later",
  "Operating without outside fundraising",
  "Undecided",
]);

const structureCapitalSectionDraftSchema = z
  .object({
    companyFormed: structureCapitalFormationDraftSchema,
    legalStructure: optionalLongTextSchema.optional(),
    ownershipPlan: optionalLongTextSchema.optional(),
    decisionControl: optionalLongTextSchema.optional(),

    outsideCapital: structureCapitalYesNoDraftSchema,
    fundingEntries: z.array(structureCapitalFundingEntryDraftSchema).optional(),

    founderCompensationStatus: structureCapitalYesNoDraftSchema,
    compensationEntries: z
      .array(structureCapitalCompensationEntryDraftSchema)
      .optional(),

    financingPosture: structureCapitalFinancingPostureDraftSchema,
    financingContext: optionalLongTextSchema.optional(),

    obligations: optionalLongTextSchema.optional(),
  })
  .passthrough();

const structureCapitalSectionSubmitSchema = z
  .object({
    companyFormed: structureCapitalFormationSchema,
    legalStructure: optionalLongTextSchema.optional(),
    ownershipPlan: optionalLongTextSchema.optional(),
    decisionControl: sectionTextSchema,

    outsideCapital: structureCapitalYesNoSchema,
    fundingEntries: z
      .array(structureCapitalFundingEntrySubmitSchema)
      .optional()
      .default([]),

    founderCompensationStatus: structureCapitalYesNoSchema,
    compensationEntries: z
      .array(structureCapitalCompensationEntrySubmitSchema)
      .optional()
      .default([]),

    financingPosture: structureCapitalFinancingPostureSchema,
    financingContext: optionalLongTextSchema.optional(),

    obligations: sectionTextSchema,
  })
  .superRefine((value, ctx) => {
    if (value.companyFormed === "Yes" && !sanitizeOptionalString(value.legalStructure)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["legalStructure"],
        message: "Please provide the legal structure and jurisdiction.",
      });
    }

    if (value.companyFormed === "No" && !sanitizeOptionalString(value.ownershipPlan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownershipPlan"],
        message: "Please describe the planned ownership structure.",
      });
    }

    if (value.outsideCapital === "Yes" && (value.fundingEntries?.length ?? 0) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fundingEntries"],
        message: "Please add at least one capital source.",
      });
    }

    if (
      value.founderCompensationStatus === "Yes" &&
      (value.compensationEntries?.length ?? 0) === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compensationEntries"],
        message: "Please add at least one founder compensation entry.",
      });
    }

    if (
      (value.financingPosture === "Currently raising capital" ||
        value.financingPosture === "Planning to raise later") &&
      !sanitizeOptionalString(value.financingContext)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financingContext"],
        message: "Please provide the financing strategy and context.",
      });
    }
  })
  .passthrough();

/**
 * ALIGNMENT
 */
const alignmentHelpNeededOptions = [
  "Fundraising",
  "Strategic Partnerships",
  "AI Infrastructure",
  "Go-to-Market",
  "Enterprise Access",
  "Growth",
  "Recruiting",
  "Global Expansion",
  "Regulatory / Compliance",
  "Technical Architecture",
] as const;

const alignmentHelpNeededSchema = z.enum(alignmentHelpNeededOptions);

const alignmentDraftTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return "";
    return sanitizeString(value);
  });

const alignmentOptionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    const sanitized = sanitizeString(value);
    return sanitized.length > 0 ? sanitized : undefined;
  });

const alignmentSectionDraftSchema = z
  .object({
    whyCirglob: alignmentDraftTextSchema,
    helpNeeded: z.array(alignmentHelpNeededSchema).max(3).default([]),
    relationship: alignmentDraftTextSchema,
  })
  .passthrough();

const alignmentSectionSubmitSchema = z
  .object({
    whyCirglob: sectionTextSchema,
    helpNeeded: z.array(alignmentHelpNeededSchema).max(3),
    relationship: alignmentOptionalTextSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.helpNeeded.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["helpNeeded"],
        message: "Select up to 3 alignment areas.",
      });
    }
  })
  .passthrough();

/**
 * TIMING & COMMITMENT
 */
const timingCommitmentCycleOptions = [
  "Upcoming Cycle",
  "A Future Cycle",
] as const;

const timingCommitmentFutureCycleOptions = [
  "Winter 2027",
  "Summer 2027",
] as const;

const timingCommitmentCycleSchema = z.enum(timingCommitmentCycleOptions);
const timingCommitmentFutureCycleSchema = z.enum(
  timingCommitmentFutureCycleOptions,
);

const timingCommitmentDraftSelectionSchema = z
  .union([z.literal(""), timingCommitmentCycleSchema])
  .transform((value) => value);

const timingCommitmentDraftFutureCycleSchema = z
  .union([z.literal(""), timingCommitmentFutureCycleSchema])
  .transform((value) => value);

const timingCommitmentDraftTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return "";
    return sanitizeString(value);
  });

const timingCommitmentSectionDraftSchema = z
  .object({
    applyingFor: timingCommitmentDraftSelectionSchema,
    futureCycle: timingCommitmentDraftFutureCycleSchema,
    futureCycleReason: timingCommitmentDraftTextSchema,
  })
  .passthrough();

const timingCommitmentSectionSubmitSchema = z
  .object({
    applyingFor: timingCommitmentCycleSchema,
    futureCycle: z
      .union([z.literal(""), timingCommitmentFutureCycleSchema])
      .transform((value) => value),
    futureCycleReason: z.string().trim().transform(sanitizeString),
  })
  .superRefine((value, ctx) => {
    if (value.applyingFor === "A Future Cycle") {
      if (!value.futureCycle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["futureCycle"],
          message: "Please select the future cycle you are targeting.",
        });
      }

      if (!sanitizeOptionalString(value.futureCycleReason)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["futureCycleReason"],
          message:
            "Please explain why you are applying for a future cycle.",
        });
      }
    }

    if (value.applyingFor === "Upcoming Cycle") {
      if (value.futureCycle !== "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["futureCycle"],
          message: "Future cycle must be empty for the upcoming cycle.",
        });
      }

      if (sanitizeOptionalString(value.futureCycleReason)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["futureCycleReason"],
          message:
            "Future cycle reason must be empty for the upcoming cycle.",
        });
      }
    }
  })
  .passthrough();

/* ========================================================
   FOUNDER PROFILE SCHEMAS
======================================================== */

/**
 * IDENTITY
 */
const founderIdentityDraftSchema = z
  .object({
    first_name: firstNameSchema.optional(),
    last_name: lastNameSchema.optional(),
    full_name: fullNameSchema.optional(),
    email: optionalEmail().optional(),
    avatar_url: optionalUrl().optional(),
    title: optionalText(200).optional(),
    location: optionalText(200).optional(),
    completed: booleanLikeSchema.optional(),
  })
  .passthrough();

const founderIdentitySubmitSchema = z
  .object({
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    full_name: fullNameSchema.optional(),
    email: emailSchema.optional(),
    avatar_url: optionalUrl().optional(),
    title: optionalText(200).optional(),
    location: optionalText(200).optional(),
    completed: booleanLikeSchema.optional(),
  })
  .passthrough();

/**
 * RESPONSIBILITIES & COMMITMENT
 */
const founderResponsibilitiesDraftSchema = z
  .object({
    role: optionalText(200).optional(),
    responsibilities: optionalLongTextSchema.optional(),
    commitment_level: optionalText(120).optional(),
    availability_hours: nonNegativeIntegerSchema.optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

const founderResponsibilitiesSubmitSchema = z
  .object({
    role: sectionTitleSchema,
    responsibilities: sectionTextSchema,
    commitment_level: sectionTitleSchema,
    availability_hours: positiveIntegerSchema,
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

/**
 * BACKGROUND
 */
const founderBackgroundDraftSchema = z
  .object({
    summary: optionalSummarySchema.optional(),
    experience: optionalLongTextSchema.optional(),
    education: optionalLongTextSchema.optional(),
    previous_companies: z.array(optionalText(180)).optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

const founderBackgroundSubmitSchema = z
  .object({
    summary: sectionTextSchema,
    experience: sectionTextSchema,
    education: optionalLongTextSchema.optional(),
    previous_companies: z.array(optionalText(180)).optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

/**
 * ACCOMPLISHMENTS
 */
const founderAccomplishmentsDraftSchema = z
  .object({
    accomplishments: z.array(optionalText(500)).optional(),
    highlights: z.array(optionalText(500)).optional(),
    awards: z.array(optionalText(250)).optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

const founderAccomplishmentsSubmitSchema = z
  .object({
    accomplishments: z
      .array(nonEmptyStringSchema)
      .min(1, "At least one accomplishment is required"),
    highlights: z.array(optionalText(500)).optional(),
    awards: z.array(optionalText(250)).optional(),
    notes: optionalLongTextSchema.optional(),
  })
  .passthrough();

/* ========================================================
   SCHEMA REGISTRIES
======================================================== */

export const applicationSectionSchemaPairs: Record<
  ApplicationSection,
  SectionSchemaPair
> = {
  [APPLICATION_SECTIONS.FOUNDERS]: {
    draft: foundersSectionDraftSchema,
    submit: foundersSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]: {
    draft: founderVideoSectionDraftSchema,
    submit: founderVideoSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.COMPANY]: {
    draft: companySectionDraftSchema,
    submit: companySectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.PROGRESS]: {
    draft: progressSectionDraftSchema,
    submit: progressSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.INSIGHT]: {
    draft: insightSectionDraftSchema,
    submit: insightSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]: {
    draft: structureCapitalSectionDraftSchema,
    submit: structureCapitalSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.ALIGNMENT]: {
    draft: alignmentSectionDraftSchema,
    submit: alignmentSectionSubmitSchema,
  },
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]: {
    draft: timingCommitmentSectionDraftSchema,
    submit: timingCommitmentSectionSubmitSchema,
  },
} as const;

export const founderProfileSchemaPairs: Record<
  FounderProfileSection,
  SectionSchemaPair
> = {
  [FOUNDER_PROFILE_SECTIONS.IDENTITY]: {
    draft: founderIdentityDraftSchema,
    submit: founderIdentitySubmitSchema,
  },
  [FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT]: {
    draft: founderResponsibilitiesDraftSchema,
    submit: founderResponsibilitiesSubmitSchema,
  },
  [FOUNDER_PROFILE_SECTIONS.BACKGROUND]: {
    draft: founderBackgroundDraftSchema,
    submit: founderBackgroundSubmitSchema,
  },
  [FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS]: {
    draft: founderAccomplishmentsDraftSchema,
    submit: founderAccomplishmentsSubmitSchema,
  },
} as const;

/**
 * Backward-friendly registries:
 * - single-schema consumers get the draft schema by default
 * - dual-mode consumers use the pair maps above
 */
export const applicationSectionDraftSchemas: Record<
  ApplicationSection,
  z.ZodTypeAny
> = {
  [APPLICATION_SECTIONS.FOUNDERS]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.FOUNDERS].draft,
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.FOUNDER_VIDEO].draft,
  [APPLICATION_SECTIONS.COMPANY]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.COMPANY].draft,
  [APPLICATION_SECTIONS.PROGRESS]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.PROGRESS].draft,
  [APPLICATION_SECTIONS.INSIGHT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.INSIGHT].draft,
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.STRUCTURE_CAPITAL].draft,
  [APPLICATION_SECTIONS.ALIGNMENT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.ALIGNMENT].draft,
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.TIMING_COMMITMENT].draft,
} as const;

export const applicationSectionSubmitSchemas: Record<
  ApplicationSection,
  z.ZodTypeAny
> = {
  [APPLICATION_SECTIONS.FOUNDERS]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.FOUNDERS].submit,
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.FOUNDER_VIDEO].submit,
  [APPLICATION_SECTIONS.COMPANY]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.COMPANY].submit,
  [APPLICATION_SECTIONS.PROGRESS]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.PROGRESS].submit,
  [APPLICATION_SECTIONS.INSIGHT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.INSIGHT].submit,
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.STRUCTURE_CAPITAL].submit,
  [APPLICATION_SECTIONS.ALIGNMENT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.ALIGNMENT].submit,
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]:
    applicationSectionSchemaPairs[APPLICATION_SECTIONS.TIMING_COMMITMENT].submit,
} as const;

export const founderProfileDraftSchemas: Record<
  FounderProfileSection,
  z.ZodTypeAny
> = {
  [FOUNDER_PROFILE_SECTIONS.IDENTITY]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.IDENTITY].draft,
  [FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT].draft,
  [FOUNDER_PROFILE_SECTIONS.BACKGROUND]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.BACKGROUND].draft,
  [FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS].draft,
} as const;

export const founderProfileSubmitSchemas: Record<
  FounderProfileSection,
  z.ZodTypeAny
> = {
  [FOUNDER_PROFILE_SECTIONS.IDENTITY]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.IDENTITY].submit,
  [FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT].submit,
  [FOUNDER_PROFILE_SECTIONS.BACKGROUND]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.BACKGROUND].submit,
  [FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS]:
    founderProfileSchemaPairs[FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS].submit,
} as const;

/* ========================================================
   SAFE PARSERS
======================================================== */

export function validateSignUp(data: unknown) {
  return signUpSchema.safeParse(data);
}

export function validateSignIn(data: unknown) {
  return signInSchema.safeParse(data);
}

export function validateResetPassword(data: unknown) {
  return resetPasswordSchema.safeParse(data);
}

export function validateForgotPassword(data: unknown) {
  return forgotPasswordSchema.safeParse(data);
}

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data);
}

export function validateProfileCreate(data: unknown) {
  return profileCreateSchema.safeParse(data);
}

export function validateAuthCallback(data: unknown) {
  return authCallbackSchema.safeParse(data);
}

/* ========================================================
   TYPE EXPORTS
======================================================== */

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;
export type AuthCallbackInput = z.infer<typeof authCallbackSchema>;

export type ApplicationSectionDraftInput = {
  [K in ApplicationSection]: z.infer<(typeof applicationSectionDraftSchemas)[K]>;
};

export type ApplicationSectionSubmitInput = {
  [K in ApplicationSection]: z.infer<(typeof applicationSectionSubmitSchemas)[K]>;
};

export type FounderProfileDraftInput = {
  [K in FounderProfileSection]: z.infer<(typeof founderProfileDraftSchemas)[K]>;
};

export type FounderProfileSubmitInput = {
  [K in FounderProfileSection]: z.infer<(typeof founderProfileSubmitSchemas)[K]>;
};

/* ========================================================
   PROFILE NORMALIZATION
======================================================== */

/**
 * Creates deterministic profile payloads.
 *
 * Prevents:
 * - undefined drift
 * - malformed writes
 * - inconsistent hydration
 */
export function normalizeProfileUpdate(
  input: ProfileUpdateInput,
): ProfileUpdateInput {
  return {
    first_name: sanitizeOptionalString(input.first_name),
    last_name: sanitizeOptionalString(input.last_name),
    full_name: sanitizeOptionalString(input.full_name),
    avatar_url:
      typeof input.avatar_url === "string"
        ? sanitizeUrl(input.avatar_url)
        : input.avatar_url,
    completed:
      typeof input.completed === "boolean" ? input.completed : input.completed,
  };
}

/**
 * Normalizes bootstrap profile data while preserving the contract.
 */
export function normalizeProfileCreate(
  input: ProfileCreateInput,
): ProfileCreateInput {
  return {
    ...input,
    email: normalizeEmail(input.email),
    first_name: sanitizeOptionalString(input.first_name),
    last_name: sanitizeOptionalString(input.last_name),
    full_name: sanitizeOptionalString(input.full_name),
    avatar_url:
      typeof input.avatar_url === "string"
        ? input.avatar_url.trim() || null
        : input.avatar_url ?? null,
    completed: typeof input.completed === "boolean" ? input.completed : false,
  };
}

/* ========================================================
   SECURITY HELPERS
======================================================== */

/**
 * Runtime-safe string guard.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Runtime-safe UUID guard.
 *
 * Useful later for:
 * - route params
 * - ownership checks
 * - storage ownership validation
 */
export function isUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

/**
 * Runtime-safe URL guard.
 */
export function isUrl(value: string): boolean {
  return z.string().url().safeParse(value).success;
}

/* ========================================================
   EXPORTABLE VALIDATION MAP
======================================================== */

export const validators = {
  // Auth
  signUp: signUpSchema,
  signIn: signInSchema,
  resetPassword: resetPasswordSchema,
  forgotPassword: forgotPasswordSchema,
  authCallback: authCallbackSchema,

  // Identity / profile
  profileUpdate: profileUpdateSchema,
  profileCreate: profileCreateSchema,

  // Shared primitives
  email: emailSchema,
  password: passwordSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  fullName: fullNameSchema,
  avatarUrl: avatarUrlSchema,
  url: urlSchema,
  phone: phoneSchema,
  socialHandle: socialHandleSchema,
  nonEmptyString: nonEmptyStringSchema,
  optionalString: optionalStringSchema,
  uuid: uuidSchema,
  optionalUuid: optionalUuidSchema,
  booleanLike: booleanLikeSchema,
  numericString: numericStringSchema,
  isoDate: isoDateSchema,

  // Application sections
  applicationSectionPairs: applicationSectionSchemaPairs,
  applicationSectionDraftSchemas,
  applicationSectionSubmitSchemas,

  // Founder profile sections
  founderProfilePairs: founderProfileSchemaPairs,
  founderProfileDraftSchemas,
  founderProfileSubmitSchemas,
} as const;

/* ========================================================
   FINAL NOTES
======================================================== */

/**
 * THIS FILE SHOULD REMAIN:
 *
 * - stable
 * - deterministic
 * - universal
 * - identity-focused
 * - schema-only
 *
 * This is NOT:
 * - a business rules layer
 * - a permissions layer
 * - an orchestration layer
 *
 * Keep validation centralized.
 * Keep identity neutral.
 * Keep architecture decoupled.
 */