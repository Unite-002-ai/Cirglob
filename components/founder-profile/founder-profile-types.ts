/**
 * Founder Profile - Core Type System
 * -----------------------------------
 * Single source of truth for founder profile data and helpers.
 */

export const PROFILE_DRAFT_STORAGE_KEY = 'cirglob-founder-profile-draft';

export type YesNo = 'yes' | 'no';
export type MaybeYesNo = YesNo | '';

export type FounderProfileSectionKey =
  | "identity"
  | "responsibilities_commitment"
  | "background"
  | "accomplishments";

export interface FounderProfileSectionMeta {
  key: FounderProfileSectionKey;
  label: string;
}

export const FOUNDER_PROFILE_SECTIONS: readonly FounderProfileSectionMeta[] = [
  {
    key: "identity",
    label: "Identity",
  },
  {
    key: "responsibilities_commitment",
    label: "Responsibilities & Commitment",
  },
  {
    key: "background",
    label: "Background",
  },
  {
    key: "accomplishments",
    label: "Accomplishments",
  },
] as const;

export interface IdentityData {
  fullName: string;
  email: string;
  roleInCompany: string;
  phoneCountryCode: string;
  phoneNumber: string;
  currentLocation: string;
  profileImageUrl: string | null;
}

export interface ResponsibilitiesData {
  mainResponsibilities: string;
  equityPercentage: number | null;
  isTechnicalFounder: MaybeYesNo;
  technicalOwnership: string;
  isFullTime: MaybeYesNo;
  fullTimeTimelineExplanation: string;
  twelveMonthCommitment: MaybeYesNo;
}

export interface EducationData {
  schoolName: string;
  degreeTypeOrLevel: string;
  fieldOfStudy: string;
  from: string;
  to: string;
}

export interface WorkExperienceData {
  companyName: string;
  position: string;
  from: string;
  to: string;
  isCurrentPosition: boolean;
  description: string;
}

export interface BackgroundData {
  linkedInUrl: string;
  githubUrl: string;
  personalWebsite: string;
  twitterUrl: string;
  workHistory: WorkExperienceData[];
  education: EducationData | null;
}

export interface AccomplishmentsData {
  mostImpressiveAchievement: string;
  pastProjects: string;
  unconventionalProblemSolving: string;
  additionalSignals: string;
}

export interface FounderProfile {
  identity: IdentityData;
  responsibilities: ResponsibilitiesData;
  background: BackgroundData;
  accomplishments: AccomplishmentsData;
}

export interface FounderProfileCompletion {
  identity: boolean;
  responsibilities: boolean;
  background: boolean;
  accomplishments: boolean;
}

export interface FounderProfileMeta {
  completionPercentage: number;
  isComplete: boolean;
  lastSavedAt?: string;
}

export interface FounderProfileDraftStorage {
  version: 1;
  profile: FounderProfile;
  lastSavedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNullableString(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === 'string' ? value : null;
}

function asMaybeYesNo(value: unknown): MaybeYesNo {
  return value === 'yes' || value === 'no' ? value : '';
}

function asNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asCountryCode(value: unknown): string {
  const raw = asString(value).trim().toUpperCase();
  return /^[A-Z]{2}$/.test(raw) ? raw : '';
}

function buildLocationFromLegacyFields(
  currentLocation: unknown,
  currentCity: unknown,
  currentCountry: unknown
): string {
  const explicitLocation = asString(currentLocation).trim();
  if (explicitLocation) return explicitLocation;

  const city = asString(currentCity).trim();
  const country = asString(currentCountry).trim();

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;

  return '';
}

function isEducationData(value: unknown): value is EducationData {
  return (
    isRecord(value) &&
    typeof value.schoolName === 'string' &&
    typeof value.degreeTypeOrLevel === 'string' &&
    typeof value.fieldOfStudy === 'string' &&
    typeof value.from === 'string' &&
    typeof value.to === 'string'
  );
}

function asEducationData(value: unknown): EducationData | null {
  if (value === null || value === undefined) return null;

  if (isEducationData(value)) {
    return {
      schoolName: asString(value.schoolName),
      degreeTypeOrLevel: asString(value.degreeTypeOrLevel),
      fieldOfStudy: asString(value.fieldOfStudy),
      from: asString(value.from),
      to: asString(value.to),
    };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    return {
      schoolName: trimmed,
      degreeTypeOrLevel: '',
      fieldOfStudy: '',
      from: '',
      to: '',
    };
  }

  return null;
}

function isWorkExperienceData(value: unknown): value is WorkExperienceData {
  return (
    isRecord(value) &&
    typeof value.companyName === 'string' &&
    typeof value.position === 'string' &&
    typeof value.from === 'string' &&
    typeof value.to === 'string' &&
    typeof value.isCurrentPosition === 'boolean' &&
    typeof value.description === 'string'
  );
}

function asWorkExperienceData(value: unknown): WorkExperienceData | null {
  if (value === null || value === undefined) return null;

  if (isWorkExperienceData(value)) {
    return {
      companyName: asString(value.companyName),
      position: asString(value.position),
      from: asString(value.from),
      to: asString(value.to),
      isCurrentPosition: Boolean(value.isCurrentPosition),
      description: asString(value.description),
    };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    return {
      companyName: trimmed,
      position: '',
      from: '',
      to: '',
      isCurrentPosition: false,
      description: '',
    };
  }

  return null;
}

function asWorkExperienceList(value: unknown): WorkExperienceData[] {
  if (!Array.isArray(value)) {
    const single = asWorkExperienceData(value);
    return single ? [single] : [];
  }

  return value
    .map((item) => asWorkExperienceData(item))
    .filter((item): item is WorkExperienceData => item !== null);
}

export const defaultFounderProfile: FounderProfile = {
  identity: {
    fullName: '',
    email: '',
    roleInCompany: '',
    phoneCountryCode: '',
    phoneNumber: '',
    currentLocation: '',
    profileImageUrl: null,
  },
  responsibilities: {
    mainResponsibilities: '',
    equityPercentage: null,
    isTechnicalFounder: '',
    technicalOwnership: '',
    isFullTime: '',
    fullTimeTimelineExplanation: '',
    twelveMonthCommitment: '',
  },
  background: {
    linkedInUrl: '',
    githubUrl: '',
    personalWebsite: '',
    twitterUrl: '',
    workHistory: [],
    education: null,
  },
  accomplishments: {
    mostImpressiveAchievement: '',
    pastProjects: '',
    unconventionalProblemSolving: '',
    additionalSignals: '',
  },
};

export function coerceFounderProfile(input: unknown): FounderProfile {
  const root = isRecord(input) ? input : {};

  const identity = isRecord(root.identity) ? root.identity : {};
  const responsibilities = isRecord(root.responsibilities)
    ? root.responsibilities
    : {};
  const background = isRecord(root.background) ? root.background : {};
  const accomplishments = isRecord(root.accomplishments)
    ? root.accomplishments
    : {};

  return {
    identity: {
      fullName: asString(identity.fullName),
      email: asString(identity.email),
      roleInCompany: asString(identity.roleInCompany),
      phoneCountryCode: asCountryCode(
        identity.phoneCountryCode ?? identity.phoneCountry ?? identity.countryCode
      ),
      phoneNumber: asString(identity.phoneNumber),
      currentLocation: buildLocationFromLegacyFields(
        identity.currentLocation,
        identity.currentCity,
        identity.currentCountry
      ),
      profileImageUrl: asNullableString(identity.profileImageUrl),
    },
    responsibilities: {
      mainResponsibilities: asString(responsibilities.mainResponsibilities),
      equityPercentage: asNumberOrNull(responsibilities.equityPercentage),
      isTechnicalFounder: asMaybeYesNo(responsibilities.isTechnicalFounder),
      technicalOwnership: asString(responsibilities.technicalOwnership),
      isFullTime: asMaybeYesNo(responsibilities.isFullTime),
      fullTimeTimelineExplanation: asString(
        responsibilities.fullTimeTimelineExplanation
      ),
      twelveMonthCommitment: asMaybeYesNo(
        responsibilities.twelveMonthCommitment
      ),
    },
    background: {
      linkedInUrl: asString(background.linkedInUrl),
      githubUrl: asString(background.githubUrl),
      personalWebsite: asString(background.personalWebsite),
      twitterUrl: asString(background.twitterUrl),
      workHistory: asWorkExperienceList(background.workHistory),
      education: asEducationData(background.education),
    },
    accomplishments: {
      mostImpressiveAchievement: asString(
        accomplishments.mostImpressiveAchievement
      ),
      pastProjects: asString(accomplishments.pastProjects),
      unconventionalProblemSolving: asString(
        accomplishments.unconventionalProblemSolving
      ),
      additionalSignals: asString(accomplishments.additionalSignals),
    },
  };
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isWorkExperienceComplete(experience: WorkExperienceData): boolean {
  if (
    !hasText(experience.companyName) ||
    !hasText(experience.position) ||
    !hasText(experience.from)
  ) {
    return false;
  }

  if (!experience.isCurrentPosition && !hasText(experience.to)) {
    return false;
  }

  return true;
}

export function isIdentityComplete(identity: IdentityData): boolean {
  return (
    hasText(identity.fullName) &&
    hasText(identity.email) &&
    hasText(identity.roleInCompany) &&
    hasText(identity.currentLocation)
  );
}

export function isResponsibilitiesComplete(
  responsibilities: ResponsibilitiesData
): boolean {
  const baseComplete =
    hasText(responsibilities.mainResponsibilities) &&
    responsibilities.equityPercentage !== null &&
    responsibilities.isTechnicalFounder !== '' &&
    responsibilities.isFullTime !== '' &&
    responsibilities.twelveMonthCommitment !== '';

  if (!baseComplete) return false;

  if (
    responsibilities.isTechnicalFounder === 'no' &&
    !hasText(responsibilities.technicalOwnership)
  ) {
    return false;
  }

  if (
    responsibilities.isFullTime === 'no' &&
    !hasText(responsibilities.fullTimeTimelineExplanation)
  ) {
    return false;
  }

  return true;
}

export function isBackgroundComplete(background: BackgroundData): boolean {
  return (
    Array.isArray(background.workHistory) &&
    background.workHistory.some(isWorkExperienceComplete)
  );
}

export function isAccomplishmentsComplete(
  accomplishments: AccomplishmentsData
): boolean {
  return (
    hasText(accomplishments.mostImpressiveAchievement) &&
    hasText(accomplishments.pastProjects) &&
    hasText(accomplishments.unconventionalProblemSolving)
  );
}

export function getFounderProfileCompletion(
  profile: FounderProfile
): FounderProfileCompletion {
  return {
    identity: isIdentityComplete(profile.identity),
    responsibilities: isResponsibilitiesComplete(profile.responsibilities),
    background: isBackgroundComplete(profile.background),
    accomplishments: isAccomplishmentsComplete(profile.accomplishments),
  };
}

export function getFounderProfileCompletionPercentage(
  profile: FounderProfile
): number {
  const completion = getFounderProfileCompletion(profile);
  const total = FOUNDER_PROFILE_SECTIONS.length;
  const completed = Object.values(completion).filter(Boolean).length;

  return Math.round((completed / total) * 100);
}

export function isFounderProfileReadyForSubmission(
  profile: FounderProfile
): boolean {
  return Object.values(getFounderProfileCompletion(profile)).every(Boolean);
}

export function getFounderProfileMeta(
  profile: FounderProfile,
  lastSavedAt?: string
): FounderProfileMeta {
  return {
    completionPercentage: getFounderProfileCompletionPercentage(profile),
    isComplete: isFounderProfileReadyForSubmission(profile),
    lastSavedAt,
  };
}