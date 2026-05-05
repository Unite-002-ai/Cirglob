export const APPLICATION_STORAGE_KEY = "cirglob-application-draft";

/**
 * =========================
 * SIDEBAR SECTION ORDER
 * =========================
 * This controls:
 * - Sidebar rendering
 * - Scroll navigation targets
 * - Section routing in ApplicationContent
 */
export const APPLICATION_SECTIONS = [
  "Founders",
  "Founder Video",
  "Company",
  "Progress",
  "Idea",
  "Equity",
  "Curious",
  "Batch Preference",
] as const;

export type ApplicationSection = (typeof APPLICATION_SECTIONS)[number];

/**
 * =========================
 * DROPDOWN OPTIONS
 * =========================
 */

export const FOUNDER_RELATIONSHIP_DURATION = [
  "< 6 months",
  "6–12 months",
  "1–3 years",
  "3+ years",
] as const;

export const PROGRESS_STAGE_OPTIONS = [
  "Idea stage",
  "MVP built",
  "Beta live",
  "Public launch",
  "Revenue generating",
  "Fast growing",
] as const;

export const CATEGORY_OPTIONS = [
  "AI",
  "SaaS",
  "Fintech",
  "Cybersecurity",
  "Healthcare",
  "Climate",
  "Consumer",
  "Marketplace",
  "Deep Tech",
  "Robotics",
  "Infrastructure",
  "Other",
] as const;

export const BATCH_OPTIONS = [
  "Summer 2026",
  "Winter 2027",
  "Next Available",
  "Flexible",
] as const;

export const YES_NO = ["Yes", "No"] as const;

export const WORK_STYLE_OPTIONS = ["In person", "Hybrid", "Remote"] as const;

export const HELP_AREAS = [
  "Fundraising",
  "Product",
  "Growth",
  "Hiring",
  "GTM",
  "Network",
  "AI Strategy",
  "Enterprise Sales",
  "Global Expansion",
] as const;

/**
 * =========================
 * APPLICATION SCORING MODEL (/80)
 * =========================
 * This is your internal Cirglob filter system.
 * Will later plug into AI scoring engine.
 */

export const SCORING_WEIGHTS = {
  founderQuality: 10,
  execution: 10,
  marketSize: 10,
  urgency: 10,
  moatPotential: 10,
  traction: 10,
  coachability: 10,
  cirglobFit: 10,
} as const;

export const SCORING_CATEGORIES = Object.keys(
  SCORING_WEIGHTS
) as Array<keyof typeof SCORING_WEIGHTS>;

export const MAX_SCORE = 80;

/**
 * =========================
 * DEFAULT EMPTY APPLICATION SHAPE
 * =========================
 * Used for initialization + reset + hydration safety
 */

export const DEFAULT_APPLICATION_STATE = {
  founders: {},
  founderVideo: {},
  company: {},
  progress: {},
  idea: {},
  equity: {},
  curious: {},
  batchPreference: {},
};

/**
 * =========================
 * UI BEHAVIOR CONSTANTS
 * =========================
 */

export const UI_CONFIG = {
  headerHeight: 72,
  footerHeight: 78,
  sidebarWidth: 300,
  animationDuration: 350,
};

/**
 * =========================
 * THEME TOKENS (matches Cirglob design system)
 * =========================
 */

export const THEME = {
  background: "#05060A",

  gradients: {
    primary: "from-blue-500 to-purple-600",
    softGlow: "from-blue-500/15 to-purple-500/15",
    indigoGlow: "from-indigo-500/15 to-blue-500/15",
  },

  glass: {
    base: "bg-white/[0.03]",
    border: "border-white/10",
    strongBorder: "border-white/20",
  },

  text: {
    primary: "text-white",
    secondary: "text-white/60",
    muted: "text-white/40",
  },
};

/**
 * =========================
 * HELPER: SCORE LABELS (for future AI + UI)
 * =========================
 */

export const SCORING_LABELS: Record<
  keyof typeof SCORING_WEIGHTS,
  string
> = {
  founderQuality: "Founder Quality",
  execution: "Execution",
  marketSize: "Market Size",
  urgency: "Urgency",
  moatPotential: "Moat Potential",
  traction: "Traction",
  coachability: "Coachability",
  cirglobFit: "Cirglob Fit",
};

/**
 * =========================
 * FUTURE EXTENSION HOOKS
 * =========================
 * (Important: reserved for AI evaluator, do NOT remove)
 */

export const CIRGLOB_EVALUATION_VERSION = "v1.0";

export const EVALUATION_NOTES = {
  intent:
    "This model evaluates founders on signal quality, not completeness.",
  philosophy:
    "Cirglob prioritizes conviction, execution speed, and long-term defensibility over polish.",
};