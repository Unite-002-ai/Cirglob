// =========================================================
//
// CIRGLOB — APPLICATION SECTION REGISTRY
//
// =========================================================
//
// Purpose:
// Canonical source of truth for application section metadata.
//
// This file intentionally contains:
// - section ordering
// - labels
// - descriptions
// - sidebar titles
// - review labels
// - completion hints
// - routing metadata
//
// This file intentionally does NOT contain:
// - Supabase access
// - persistence logic
// - auth logic
// - business workflow orchestration
// - validation execution
// - UI rendering logic
//
// Keep this file framework-agnostic and dependency-light.
//
// =========================================================

import {
  APPLICATION_SECTION_LABELS,
  APPLICATION_SECTION_ORDER,
  APPLICATION_SECTIONS,
  FOUNDER_PROFILE_SECTION_LABELS,
  FOUNDER_PROFILE_SECTION_ORDER,
  FOUNDER_PROFILE_SECTIONS,
  type ApplicationSection,
  type FounderProfileSection,
} from "./constants";

export type SectionDifficulty = "required" | "recommended";

export type ApplicationSectionMeta = {
  id: ApplicationSection;
  label: string;
  sidebarLabel: string;
  reviewLabel: string;
  description: string;
  routeSegment: string;
  order: number;
  completion: SectionDifficulty;
  editableWhenDraft: boolean;
  locksOnSubmit: true;
};

export type FounderProfileSectionMeta = {
  id: FounderProfileSection;
  label: string;
  sidebarLabel: string;
  description: string;
  order: number;
  editableWhenDraft: boolean;
};

type ApplicationSectionContent = {
  description: string;
  routeSegment: string;
  completion: SectionDifficulty;
};

type FounderProfileSectionContent = {
  description: string;
};

function normalizeSectionToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export const APPLICATION_SECTION_ALIASES = {
  video: APPLICATION_SECTIONS.FOUNDER_VIDEO,
  foundervideo: APPLICATION_SECTIONS.FOUNDER_VIDEO,

  insight: APPLICATION_SECTIONS.INSIGHT,

  structurecapital: APPLICATION_SECTIONS.STRUCTURE_CAPITAL,

  timingcommitment: APPLICATION_SECTIONS.TIMING_COMMITMENT,
} as const;

export const FOUNDER_PROFILE_SECTION_ALIASES = {
  identity: FOUNDER_PROFILE_SECTIONS.IDENTITY,
  responsibilitiescommitment:
    FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT,
  background: FOUNDER_PROFILE_SECTIONS.BACKGROUND,
  accomplishments: FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS,
} as const;

export function normalizeApplicationSection(
  value: string,
): ApplicationSection | null {
  const normalized = normalizeSectionToken(value);

  for (const section of APPLICATION_SECTION_ORDER) {
    if (normalizeSectionToken(section) === normalized) {
      return section;
    }
  }

  const alias = APPLICATION_SECTION_ALIASES[
    normalized as keyof typeof APPLICATION_SECTION_ALIASES
  ];

  if (alias) {
    return alias;
  }

  for (const section of APPLICATION_SECTION_ORDER) {
    if (
      normalizeSectionToken(getApplicationSectionRouteSegment(section)) ===
      normalized
    ) {
      return section;
    }
  }

  return null;
}

export function normalizeFounderProfileSection(
  value: string,
): FounderProfileSection | null {
  const normalized = normalizeSectionToken(value);

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    if (normalizeSectionToken(section) === normalized) {
      return section;
    }
  }

  return (
    FOUNDER_PROFILE_SECTION_ALIASES[
      normalized as keyof typeof FOUNDER_PROFILE_SECTION_ALIASES
    ] ?? null
  );
}

export function isFounderProfileSection(
  value: string,
): value is FounderProfileSection {
  return normalizeFounderProfileSection(value) !== null;
}

const APPLICATION_SECTION_CONTENT: Record<
  ApplicationSection,
  ApplicationSectionContent
> = {
  [APPLICATION_SECTIONS.FOUNDERS]: {
    description:
      "Founding team, collaboration roles, and shared application ownership details.",
    routeSegment: "founders",
    completion: "required",
  },
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]: {
    description: "Introductory founder video and presentation context.",
    routeSegment: "founder-video",
    completion: "required",
  },
  [APPLICATION_SECTIONS.COMPANY]: {
    description: "Core company identity, product context, and operating details.",
    routeSegment: "company",
    completion: "required",
  },
  [APPLICATION_SECTIONS.PROGRESS]: {
    description: "Current traction, progress signals, and execution momentum.",
    routeSegment: "progress",
    completion: "required",
  },
  [APPLICATION_SECTIONS.INSIGHT]: {
    description: "Problem insight, market understanding, and internal conviction.",
    routeSegment: "insight",
    completion: "required",
  },
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]: {
    description: "Operating structure, funding context, and capital posture.",
    routeSegment: "structure-capital",
    completion: "required",
  },
  [APPLICATION_SECTIONS.ALIGNMENT]: {
    description: "Founder alignment, goals, and long-term operating fit.",
    routeSegment: "alignment",
    completion: "required",
  },
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]: {
    description: "Timing, commitment level, and readiness to execute.",
    routeSegment: "timing-commitment",
    completion: "required",
  },
} as const;

const FOUNDER_PROFILE_SECTION_CONTENT: Record<
  FounderProfileSection,
  FounderProfileSectionContent
> = {
  [FOUNDER_PROFILE_SECTIONS.IDENTITY]: {
    description: "Core identity, name, and profile foundations.",
  },
  [FOUNDER_PROFILE_SECTIONS.RESPONSIBILITIES_COMMITMENT]: {
    description: "Founder commitments, responsibilities, and availability.",
  },
  [FOUNDER_PROFILE_SECTIONS.BACKGROUND]: {
    description: "Professional background and origin context.",
  },
  [FOUNDER_PROFILE_SECTIONS.ACCOMPLISHMENTS]: {
    description: "Key accomplishments and relevant wins.",
  },
} as const;

function buildApplicationSectionMeta(
  section: ApplicationSection,
  order: number,
): ApplicationSectionMeta {
  const content = APPLICATION_SECTION_CONTENT[section];
  const label = APPLICATION_SECTION_LABELS[section];

  return {
    id: section,
    label,
    sidebarLabel: label,
    reviewLabel: label,
    description: content.description,
    routeSegment: content.routeSegment,
    order,
    completion: content.completion,
    editableWhenDraft: true,
    locksOnSubmit: true,
  };
}

function buildFounderProfileSectionMeta(
  section: FounderProfileSection,
  order: number,
): FounderProfileSectionMeta {
  const content = FOUNDER_PROFILE_SECTION_CONTENT[section];
  const label = FOUNDER_PROFILE_SECTION_LABELS[section];

  return {
    id: section,
    label,
    sidebarLabel: label,
    description: content.description,
    order,
    editableWhenDraft: true,
  };
}

export const APPLICATION_SECTION_METADATA: Record<
  ApplicationSection,
  ApplicationSectionMeta
> = APPLICATION_SECTION_ORDER.reduce(
  (acc, section, index) => {
    acc[section] = buildApplicationSectionMeta(section, index + 1);
    return acc;
  },
  {} as Record<ApplicationSection, ApplicationSectionMeta>,
);

export const FOUNDER_PROFILE_SECTION_METADATA: Record<
  FounderProfileSection,
  FounderProfileSectionMeta
> = FOUNDER_PROFILE_SECTION_ORDER.reduce(
  (acc, section, index) => {
    acc[section] = buildFounderProfileSectionMeta(section, index + 1);
    return acc;
  },
  {} as Record<FounderProfileSection, FounderProfileSectionMeta>,
);

export const APPLICATION_SECTION_INDEX: Record<ApplicationSection, number> =
  APPLICATION_SECTION_ORDER.reduce(
    (acc, section, index) => {
      acc[section] = index;
      return acc;
    },
    {} as Record<ApplicationSection, number>,
  );

export const REQUIRED_APPLICATION_SECTIONS = APPLICATION_SECTION_ORDER.filter(
  (section) => APPLICATION_SECTION_METADATA[section].completion === "required",
) as readonly ApplicationSection[];

export const RECOMMENDED_APPLICATION_SECTIONS = APPLICATION_SECTION_ORDER.filter(
  (section) => APPLICATION_SECTION_METADATA[section].completion === "recommended",
) as readonly ApplicationSection[];

export const APPLICATION_SECTION_ROUTE_MAP: Record<string, ApplicationSection> =
  APPLICATION_SECTION_ORDER.reduce(
    (acc, section) => {
      acc[APPLICATION_SECTION_METADATA[section].routeSegment] = section;
      return acc;
    },
    {} as Record<string, ApplicationSection>,
  );

export function isApplicationSection(value: string): value is ApplicationSection {
  return normalizeApplicationSection(value) !== null;
}

export function getApplicationSectionMeta(
  section: ApplicationSection,
): ApplicationSectionMeta {
  return APPLICATION_SECTION_METADATA[section];
}

export function getApplicationSectionLabel(section: ApplicationSection): string {
  return APPLICATION_SECTION_METADATA[section].label;
}

export function getApplicationSectionSidebarLabel(
  section: ApplicationSection,
): string {
  return APPLICATION_SECTION_METADATA[section].sidebarLabel;
}

export function getApplicationSectionReviewLabel(
  section: ApplicationSection,
): string {
  return APPLICATION_SECTION_METADATA[section].reviewLabel;
}

export function getApplicationSectionDescription(
  section: ApplicationSection,
): string {
  return APPLICATION_SECTION_METADATA[section].description;
}

export function getApplicationSectionRouteSegment(
  section: ApplicationSection,
): string {
  return APPLICATION_SECTION_METADATA[section].routeSegment;
}

export function getApplicationSectionIndex(section: ApplicationSection): number {
  return APPLICATION_SECTION_INDEX[section];
}

export function getPreviousApplicationSection(
  section: ApplicationSection,
): ApplicationSection | null {
  const index = getApplicationSectionIndex(section);
  return index > 0 ? APPLICATION_SECTION_ORDER[index - 1] : null;
}

export function getNextApplicationSection(
  section: ApplicationSection,
): ApplicationSection | null {
  const index = getApplicationSectionIndex(section);
  return index < APPLICATION_SECTION_ORDER.length - 1
    ? APPLICATION_SECTION_ORDER[index + 1]
    : null;
}

export function isRequiredApplicationSection(
  section: ApplicationSection,
): boolean {
  return APPLICATION_SECTION_METADATA[section].completion === "required";
}

export function isRecommendedApplicationSection(
  section: ApplicationSection,
): boolean {
  return APPLICATION_SECTION_METADATA[section].completion === "recommended";
}

export function getApplicationSectionByRouteSegment(
  routeSegment: string,
): ApplicationSection | null {
  return APPLICATION_SECTION_ROUTE_MAP[routeSegment] ?? null;
}

export function getOrderedApplicationSections(): readonly ApplicationSection[] {
  return APPLICATION_SECTION_ORDER;
}

export function getApplicationSectionCount(): number {
  return APPLICATION_SECTION_ORDER.length;
}

export function getFounderProfileSectionMeta(
  section: FounderProfileSection,
): FounderProfileSectionMeta {
  return FOUNDER_PROFILE_SECTION_METADATA[section];
}

export function getFounderProfileSectionLabel(
  section: FounderProfileSection,
): string {
  return FOUNDER_PROFILE_SECTION_METADATA[section].label;
}

export function getFounderProfileSectionSidebarLabel(
  section: FounderProfileSection,
): string {
  return FOUNDER_PROFILE_SECTION_METADATA[section].sidebarLabel;
}

export function getFounderProfileSectionDescription(
  section: FounderProfileSection,
): string {
  return FOUNDER_PROFILE_SECTION_METADATA[section].description;
}

export function getOrderedFounderProfileSections(): readonly FounderProfileSection[] {
  return FOUNDER_PROFILE_SECTION_ORDER;
}

export function getFounderProfileSectionCount(): number {
  return FOUNDER_PROFILE_SECTION_ORDER.length;
}