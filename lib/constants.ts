// =========================================================
// CIRGLOB — GLOBAL CONSTANTS
// =========================================================
//
// Purpose:
// Centralized application-wide constants for:
//
// - auth redirects
// - protected routes
// - storage buckets
// - avatar conventions
// - cache keys
// - realtime channels
// - route stability
// - provider synchronization
// - application lifecycle contracts
// - membership roles
// - application sections
// - founder profile sections
// - autosave/runtime contracts
//
// This file MUST remain:
// - framework-agnostic
// - side-effect free
// - dependency-free
// - business-logic free
//
// NOTE:
// Keep all literals stable and reusable across server, client,
// database helpers, validation layers, and orchestration code.
// =========================================================

export const APP_NAME = "Cirglob";
export const APP_DESCRIPTION = "Cirglob ecosystem operating platform.";
export const APP_VERSION = "1.0.0";

/**
 * =========================================================
 * ROUTES
 * =========================================================
 */

export const ROUTES = {
  HOME: "/",

  APPLY: "/apply",
  APPLY_DASHBOARD: "/apply/dashboard",
  APPLY_APPLICATION: "/apply/application",
  APPLY_APPLICATION_REVIEW: "/apply/application/review",
  APPLY_PROFILE: "/apply/profile",
  APPLY_PROFILE_BY_ID: (profileId: string) =>
    `/apply/profile/${encodeURIComponent(profileId)}`,
  APPLY_INVITE: "/apply/invite",

  ACCOUNT: "/account",

  FAQ: "/faq",
  CONTACT: "/contact",

  AUTH: {
    ROOT: "/auth",
    ACCESS: "/auth/access",
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    CALLBACK: "/auth/callback",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ERROR: "/auth/error",
  },

  SUCCESS: {
    APPLICATION_CREATED: "/apply/success",
  },
} as const;

/**
 * =========================================================
 * COMPATIBILITY EXPORTS
 * =========================================================
 *
 * These keep older files compiling while the codebase
 * is being normalized to the ROUTES / AUTH model.
 */

export const AUTH_ROUTES = ROUTES.AUTH;

export const AUTH_SIGNIN_ROUTE = ROUTES.AUTH.SIGNIN;
export const AUTH_SIGNUP_ROUTE = ROUTES.AUTH.SIGNUP;
export const AUTH_ACCESS_ROUTE = ROUTES.AUTH.ACCESS;
export const AUTH_CALLBACK_ROUTE = ROUTES.AUTH.CALLBACK;
export const AUTH_ERROR_ROUTE = ROUTES.AUTH.ERROR;

export const APPLY_DASHBOARD_ROUTE = ROUTES.APPLY_DASHBOARD;
export const APPLY_APPLICATION_ROUTE = ROUTES.APPLY_APPLICATION;
export const APPLY_APPLICATION_REVIEW_ROUTE = ROUTES.APPLY_APPLICATION_REVIEW;
export const APPLY_PROFILE_ROUTE = ROUTES.APPLY_PROFILE;
export const APPLY_INVITE_ROUTE = ROUTES.APPLY_INVITE;
export const ACCOUNT_ROUTE = ROUTES.ACCOUNT;
export const FAQ_ROUTE = ROUTES.FAQ;
export const CONTACT_ROUTE = ROUTES.CONTACT;

/**
 * This is a fallback error reason used by the callback route.
 * It is a reason string, not a path.
 */
export const AUTH_ERROR_REDIRECT = "unexpected" as const;

export const DEFAULT_AUTH_REDIRECT = ROUTES.APPLY_DASHBOARD;
export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.APPLY_DASHBOARD;
export const DEFAULT_SIGNOUT_REDIRECT = ROUTES.HOME;

/**
 * Small public route map used by some client pages.
 */
export const PUBLIC_ROUTES = {
  home: ROUTES.HOME,
  apply: ROUTES.APPLY,
  faq: ROUTES.FAQ,
  contact: ROUTES.CONTACT,
} as const;

/**
 * =========================================================
 * PUBLIC ID PREFIXES
 * =========================================================
 *
 * Canonical prefixes used across public IDs, routes, and
 * workspace identity helpers.
 */
export const PUBLIC_ID_PREFIXES = {
  APPLICATION: "app",
  FOUNDER_PROFILE: "founder-profile",
} as const;

/**
 * =========================================================
 * AUTH
 * =========================================================
 */

export const AUTH = {
  NEXT_QUERY_PARAM: "next",
  DEFAULT_AUTH_REDIRECT: ROUTES.APPLY_DASHBOARD,
  DEFAULT_SIGNOUT_REDIRECT: ROUTES.HOME,
  SESSION_REFRESH_BUFFER_SECONDS: 60,
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
} as const;

/**
 * =========================================================
 * PROTECTED ROUTES
 * =========================================================
 */

export const PROTECTED_ROUTES = [
  ROUTES.APPLY_DASHBOARD,
  ROUTES.APPLY_APPLICATION,
  ROUTES.APPLY_APPLICATION_REVIEW,
  ROUTES.APPLY_PROFILE,
  ROUTES.ACCOUNT,
] as const;

/**
 * =========================================================
 * PUBLIC AUTH ROUTES
 * =========================================================
 */

export const PUBLIC_AUTH_ROUTES = [
  ROUTES.AUTH.SIGNIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.ACCESS,
  ROUTES.AUTH.CALLBACK,
  ROUTES.AUTH.ERROR,
] as const;

/**
 * =========================================================
 * STORAGE
 * =========================================================
 */

export const STORAGE = {
  BUCKETS: {
    AVATARS: "avatars",
    APPLICATION_ATTACHMENTS: "application-attachments",
    FOUNDER_PROFILE_ATTACHMENTS: "founder-profile-attachments",
  },

  PATHS: {
    avatar: (userId: string) => `${userId}/avatar.png`,
    applicationAttachment: (applicationId: string, fileName: string) =>
      `${applicationId}/${fileName}`,
    founderProfileAttachment: (profileId: string, fileName: string) =>
      `${profileId}/${fileName}`,
  },

  CACHE: {
    AVATAR_MAX_AGE: "3600",
  },
} as const;

/**
 * =========================================================
 * REALTIME
 * =========================================================
 */

export const REALTIME = {
  CHANNELS: {
    PROFILE: (userId: string) => `profile-${userId}`,
    APPLICATION: (applicationId: string) => `application-${applicationId}`,
    APPLICATION_SECTION: (applicationId: string, section: string) =>
      `application-${applicationId}-section-${section}`,
    FOUNDER_PROFILE: (profileId: string) => `founder-profile-${profileId}`,
  },
} as const;

/**
 * =========================================================
 * APPLICATION CYCLES
 * =========================================================
 *
 * Canonical cycle identifiers for the workspace.
 * Keep this contract stable across dashboard, hydration,
 * validation, and future routing layers.
 */

export const APPLICATION_CYCLES = {
  SUMMER_2027: "summer-2027",
} as const;

export type ApplicationCycle =
  (typeof APPLICATION_CYCLES)[keyof typeof APPLICATION_CYCLES];

export const APPLICATION_CYCLE_LABELS: Record<ApplicationCycle, string> = {
  [APPLICATION_CYCLES.SUMMER_2027]: "Summer 2027 Founder Cycle",
} as const;

export const DEFAULT_APPLICATION_CYCLE = APPLICATION_CYCLES.SUMMER_2027;

/**
 * =========================================================
 * PROFILE
 * =========================================================
 */

export const MAX_FULL_NAME_LENGTH = 120;

export const PROFILE = {
  TABLE: "profiles",
  DEFAULT_NAME: "Account",
  DEFAULT_AVATAR: null,
  MAX_FULL_NAME_LENGTH,
} as const;


/**
 * =========================================================
 * APPLICATION LIFECYCLE
 * =========================================================
 */

export const APPLICATION_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUSES = Object.values(
  APPLICATION_STATUS,
) as readonly ApplicationStatus[];

export const SUBMISSION_LOCK_STATUSES = [
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.ACCEPTED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.WITHDRAWN,
] as const;

export const EDITABLE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.DRAFT,
] as const;

export const EDITABLE_STATUSES = EDITABLE_APPLICATION_STATUSES;

/**
 * =========================================================
 * APPLICATION MEMBER ROLES
 * =========================================================
 */

export const APPLICATION_MEMBER_ROLES = {
  OWNER: "OWNER",
  CO_FOUNDER: "CO_FOUNDER",
} as const;

export type ApplicationMemberRole =
  (typeof APPLICATION_MEMBER_ROLES)[keyof typeof APPLICATION_MEMBER_ROLES];

export const APPLICATION_MEMBER_ROLE_VALUES = Object.values(
  APPLICATION_MEMBER_ROLES,
) as readonly ApplicationMemberRole[];

/**
 * =========================================================
 * APPLICATION SECTIONS
 * =========================================================
 */

export const APPLICATION_SECTIONS = {
  FOUNDERS: "founders",
  FOUNDER_VIDEO: "founder_video",
  COMPANY: "company",
  PROGRESS: "progress",
  INSIGHT: "insight",
  STRUCTURE_CAPITAL: "structure_capital",
  ALIGNMENT: "alignment",
  TIMING_COMMITMENT: "timing_commitment",
} as const;

export type ApplicationSection =
  (typeof APPLICATION_SECTIONS)[keyof typeof APPLICATION_SECTIONS];

export const APPLICATION_SECTION_VALUES = Object.values(
  APPLICATION_SECTIONS,
) as readonly ApplicationSection[];

export const APPLICATION_SECTION_ORDER = [
  APPLICATION_SECTIONS.FOUNDERS,
  APPLICATION_SECTIONS.FOUNDER_VIDEO,
  APPLICATION_SECTIONS.COMPANY,
  APPLICATION_SECTIONS.PROGRESS,
  APPLICATION_SECTIONS.INSIGHT,
  APPLICATION_SECTIONS.STRUCTURE_CAPITAL,
  APPLICATION_SECTIONS.ALIGNMENT,
  APPLICATION_SECTIONS.TIMING_COMMITMENT,
] as const;

export const APPLICATION_SECTION_LABELS: Record<ApplicationSection, string> = {
  [APPLICATION_SECTIONS.FOUNDERS]: "Founders",
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]: "Founder Video",
  [APPLICATION_SECTIONS.COMPANY]: "Company",
  [APPLICATION_SECTIONS.PROGRESS]: "Progress",
  [APPLICATION_SECTIONS.INSIGHT]: "Insight",
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]: "Structure & Capital",
  [APPLICATION_SECTIONS.ALIGNMENT]: "Alignment",
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]: "Timing & Commitment",
} as const;

/**
 * =========================================================
 * FOUNDER PROFILE SECTIONS
 * =========================================================
 */

export const FOUNDER_PROFILE_SECTIONS = {
  IDENTITY: "identity",
  RESPONSIBILITIES_COMMITMENT: "responsibilities_commitment",
  BACKGROUND: "background",
  ACCOMPLISHMENTS: "accomplishments",
} as const;

export type FounderProfileSection =
  (typeof FOUNDER_PROFILE_SECTIONS)[keyof typeof FOUNDER_PROFILE_SECTIONS];

export const FOUNDER_PROFILE_SECTION_VALUES = Object.values(
  FOUNDER_PROFILE_SECTIONS,
) as readonly FounderProfileSection[];

export const FOUNDER_PROFILE_SECTION_ORDER = [
  FOUNDER_PROFILE_SECTIONS.IDENTITY,
  FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT,
  FOUNDER_PROFILE_SECTIONS.BACKGROUND,
  FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS,
] as const;

export const FOUNDER_PROFILE_SECTION_LABELS: Record<
  FounderProfileSection,
  string
> = {
  [FOUNDER_PROFILE_SECTIONS.IDENTITY]: "Identity",
  [FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT]:
    "Responsibilities & Commitment",
  [FOUNDER_PROFILE_SECTIONS.BACKGROUND]: "Background",
  [FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS]: "Accomplishments",
} as const;

/**
 * =========================================================
 * AUTOSAVE / PERSISTENCE CONTRACTS
 * =========================================================
 */

export const AUTOSAVE = {
  DEBOUNCE_MS: 800,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1500,
  RECOVERY_TTL_MS: 1000 * 60 * 60 * 24 * 7, // 7 days
} as const;

export const AUTOSAVE_DEBOUNCE_MS = AUTOSAVE.DEBOUNCE_MS;
export const AUTOSAVE_MAX_RETRIES = AUTOSAVE.MAX_RETRIES;
export const AUTOSAVE_RETRY_DELAY_MS = AUTOSAVE.RETRY_DELAY_MS;
export const AUTOSAVE_RECOVERY_TTL_MS = AUTOSAVE.RECOVERY_TTL_MS;

export const MAX_RETRY_ATTEMPTS = AUTOSAVE.MAX_RETRIES;

export const PERSISTENCE = {
  MAX_PENDING_MUTATIONS: 25,
  MAX_SECTION_PAYLOAD_BYTES: 256 * 1024, // 256KB per section payload safety rail
  MAX_LOCAL_DRAFT_BYTES: 1024 * 1024, // 1MB per application draft cache safety rail
} as const;

/**
 * =========================================================
 * INVITATIONS
 * =========================================================
 */

export const INVITATION = {
  EXPIRATION_HOURS: 168, // 7 days
  TOKEN_LENGTH_BYTES: 32,
} as const;

export const INVITATION_EXPIRATION_HOURS = INVITATION.EXPIRATION_HOURS;

/**
 * =========================================================
 * LOCAL STORAGE
 * =========================================================
 */

export const LOCAL_STORAGE_KEYS = {
  ACCOUNT: "cirglob:account",
  SESSION: "cirglob:session",

  // Canonical scoped keys.
  APPLICATION_DRAFT_PREFIX: "cirglob:application-draft:",
  APPLICATION_RECOVERY_PREFIX: "cirglob:application-recovery:",
  LAST_ACTIVE_APPLICATION: "cirglob:last-active-application",

  FOUNDER_PROFILE_DRAFT_PREFIX: "cirglob:founder-profile-draft:",
  FOUNDER_PROFILE_RECOVERY_PREFIX: "cirglob:founder-profile-recovery:",
  LAST_ACTIVE_FOUNDER_PROFILE: "cirglob:last-active-founder-profile",

  // Legacy compatibility aliases.
  APPLICATION_DRAFT: "cirglob-application-draft",
  APPLICATION_PROGRESS: "cirglob-application-progress",
  APPLICATION_LAST_SAVED: "cirglob-application-last-saved",
  APPLICATION_SUBMITTED: "cirglob-application-submitted",
  FOUNDER_PROFILE_DRAFT: "cirglob-founder-profile-draft",
  FOUNDER_PROFILE_COMPLETE: "cirglob-founder-profile-complete",
} as const;

/**
 * =========================================================
 * ACCOUNT PROVIDER
 * =========================================================
 */

export const ACCOUNT_PROVIDER = {
  EVENTS: {
    PROFILE_UPDATED: "cirglob:profile-updated",
    AUTH_UPDATED: "cirglob:auth-updated",
    SESSION_EXPIRED: "cirglob:session-expired",
    APPLICATION_UPDATED: "cirglob:application-updated",
  },

  REFRESH_INTERVAL_MS: 1000 * 60 * 10, // 10 minutes
} as const;

/**
 * =========================================================
 * CACHE KEYS
 * =========================================================
 */

export const CACHE_KEYS = {
  ACCOUNT: "account",
  PROFILE: "profile",
  SESSION: "session",
  APPLICATION: "application",
  APPLICATION_MEMBERS: "application-members",
  APPLICATION_SECTIONS: "application-sections",
  FOUNDER_PROFILE: "founder-profile",
} as const;


/**
 * =========================================================
 * FOUNDER PROFILE WORKSPACE
 * =========================================================
 *
 * Canonical constants for founder-profile routing, storage,
 * identity scoping, and realtime access.
 */
export const FOUNDER_PROFILE = {
  TABLE: "founder_profiles",
  PUBLIC_ID_PREFIX: PUBLIC_ID_PREFIXES.FOUNDER_PROFILE,

  ROUTE_BASE: ROUTES.APPLY_PROFILE,
  buildRoute: (profileId: string) =>
    ROUTES.APPLY_PROFILE_BY_ID(profileId),

  STORAGE: {
    DRAFT_PREFIX: LOCAL_STORAGE_KEYS.FOUNDER_PROFILE_DRAFT_PREFIX,
    RECOVERY_PREFIX: LOCAL_STORAGE_KEYS.FOUNDER_PROFILE_RECOVERY_PREFIX,
    LAST_ACTIVE: LOCAL_STORAGE_KEYS.LAST_ACTIVE_FOUNDER_PROFILE,
  },

  REALTIME: {
    channel: (profileId: string) =>
      REALTIME.CHANNELS.FOUNDER_PROFILE(profileId),
  },
} as const;

/**
 * =========================================================
 * QUERY PARAMS
 * =========================================================
 */

export const QUERY_PARAMS = {
  NEXT: "next",
  ERROR: "error",
  TOKEN: "token",
  INVITE: "invite",
} as const;

/**
 * =========================================================
 * UI
 * =========================================================
 */

export const UI = {
  AVATAR_FALLBACK_TEXT: "A",
  LOADING_MIN_DURATION_MS: 150,
  MAX_SECTION_TITLE_LENGTH: 48,
} as const;

/**
 * =========================================================
 * SECURITY
 * =========================================================
 */

export const SECURITY = {
  PASSWORD_MIN_LENGTH: 8,
  FULL_NAME_MAX_LENGTH: MAX_FULL_NAME_LENGTH,
  EMAIL_MAX_LENGTH: 320,
  AVATAR_MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_AVATAR_TYPES: ["image/png", "image/jpeg", "image/webp"] as const,
  INVITATION_TOKEN_MIN_LENGTH: 32,
} as const;

/**
 * =========================================================
 * ENVIRONMENT
 * =========================================================
 *
 * Intentionally simple and side-effect free. This is safe for
 * bundlers that replace process.env at build time.
 */

export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
} as const;

/**
 * =========================================================
 * ERROR MESSAGES
 * =========================================================
 */

export const ERRORS = {
  UNAUTHORIZED: "Unauthorized.",
  SESSION_EXPIRED: "Your session has expired.",
  PROFILE_NOT_FOUND: "Profile not found.",
  INVALID_FILE_TYPE: "Invalid file type.",
  FILE_TOO_LARGE: "File size exceeds allowed limit.",
  APPLICATION_NOT_FOUND: "Application not found.",
  APPLICATION_LOCKED: "This application is locked.",
  INVITATION_INVALID: "Invitation is invalid or expired.",
} as const;

/**
 * =========================================================
 * SUCCESS MESSAGES
 * =========================================================
 */

export const SUCCESS = {
  PROFILE_UPDATED: "Profile updated successfully.",
  AVATAR_UPDATED: "Avatar updated successfully.",
  SIGNED_OUT: "Signed out successfully.",
  APPLICATION_CREATED: "Application created successfully.",
  INVITATION_SENT: "Invitation sent successfully.",
} as const;

/**
 * =========================================================
 * REGEX
 * =========================================================
 */


export const FULL_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{N}\s'-]*$/u;

export const REGEX = {
  FULL_NAME: FULL_NAME_PATTERN,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PUBLIC_ID: /^CGA-[A-Z0-9]+-[A-Z0-9]{5}$/,
  SLUG_SEGMENT: /^[a-z0-9_-]+$/,
} as const;

/**
 * =========================================================
 * TYPE HELPERS
 * =========================================================
 */

type RouteLeaf<T> = T extends string
  ? T
  : T extends Record<string, infer V>
    ? RouteLeaf<V>
    : never;

export type AppRoute = RouteLeaf<typeof ROUTES>;
export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];
export type PublicAuthRoute = (typeof PUBLIC_AUTH_ROUTES)[number];
export type ApplicationSectionKey = ApplicationSection;
export type FounderProfileSectionKey = FounderProfileSection;