"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  FOUNDER_PROFILE_SECTION_LABELS,
  FOUNDER_PROFILE_SECTION_ORDER,
  ROUTES,
  type FounderProfileSection,
} from "@/lib/constants";
import {
  cirglobFounderProfileState,
  type CirglobFounderProfileSnapshot,
  type CirglobFounderProfileStateManager,
  type CirglobFounderProfileStateOptions,
  type FounderProfileTrustedAccess,
} from "@/lib/cirglob-runtime/founder-profile-runtime";
import type { CirglobRuntimeSource } from "@/lib/cirglob-runtime/runtime-types";
import { defaultFounderProfile } from "./founder-profile-types";
import {
  isWorkspaceSecure,
  type WorkspaceRuntimeSnapshot,
} from "@/lib/workspace-runtime.shared";
import { createFounderProfileSyncTransport } from "@/lib/cirglob-runtime/founder-profile-sync-transport";

import FounderProfileSidebar from "./FounderProfileSidebar";
import Headline from "./ui/Headline";
import ReturnToApplicationButton from "./ReturnToApplicationButton";

import Identity from "./sections/Identity";
import ResponsibilitiesCommitment from "./sections/ResponsibilitiesCommitment";
import Background from "./sections/Background";
import Accomplishments from "./sections/Accomplishments";

type SectionRuntimeProps = {
  data: unknown;
  onChange: (next: unknown) => void;
  errors: Record<string, string>;
  locked: boolean;
  disabled: boolean;
  dirty: boolean;
  readonlyReason: string | null;
  founderProfileId: string | null;
  section: FounderProfileSection;
};

type SectionComponentType = React.ComponentType<SectionRuntimeProps>;

type SectionEntry = {
  id: FounderProfileSection;
  component: SectionComponentType;
};

export type FounderProfileWorkspaceProps = {
  workspaceSnapshot: WorkspaceRuntimeSnapshot;
  founderProfileId?: string | null;
  initialSections?: Partial<Record<FounderProfileSection, unknown>>;
  validationSchemas?: CirglobFounderProfileStateOptions["validationSchemas"];
  syncTransport?: CirglobFounderProfileStateOptions["syncTransport"];
  syncOptions?: CirglobFounderProfileStateOptions["syncOptions"];
  autosaveEnabled?: boolean;
  className?: string;
  onAccessDenied?: () => void;
  onStateChange?: (snapshot: CirglobFounderProfileSnapshot) => void;
};

const FOUNDER_PROFILE_RUNTIME_BOOTSTRAP = {
  initialHydrate: false,
  cleanupStaleCache: false,
  restoreMode: "seed" as const,
  seedPolicy: "prefer-committed" as const,
};

const SECTION_DEFAULTS: Record<FounderProfileSection, unknown> = {
  identity: defaultFounderProfile.identity,
  responsibilities_commitment: defaultFounderProfile.responsibilities,
  background: defaultFounderProfile.background,
  accomplishments: defaultFounderProfile.accomplishments,
};

const SECTION_COMPONENTS: Record<FounderProfileSection, SectionComponentType> = {
  identity: Identity as unknown as SectionComponentType,
  responsibilities_commitment:
    ResponsibilitiesCommitment as unknown as SectionComponentType,
  background: Background as unknown as SectionComponentType,
  accomplishments: Accomplishments as unknown as SectionComponentType,
};

function createSectionRegistry(): SectionEntry[] {
  return FOUNDER_PROFILE_SECTION_ORDER.map((section) => ({
    id: section,
    component: SECTION_COMPONENTS[section],
  }));
}

function getSectionValue(
  sections: Partial<Record<FounderProfileSection, unknown>>,
  section: FounderProfileSection,
): unknown {
  return sections[section] ?? SECTION_DEFAULTS[section];
}

function normalizeFounderProfileRuntimeSource(
  source: WorkspaceRuntimeSnapshot["source"],
): CirglobRuntimeSource {
  switch (source) {
    case "secure":
      return "secure";
    case "anonymous":
    default:
      return "unknown";
  }
}

function getFounderProfileTrustedAccess(
  workspaceSnapshot: WorkspaceRuntimeSnapshot,
  founderProfileId: string | null,
): FounderProfileTrustedAccess {
  const resolvedFounderProfileId =
    typeof founderProfileId === "string" && founderProfileId.trim().length > 0
      ? founderProfileId.trim()
      : null;

  return {
    founderProfileId: resolvedFounderProfileId,
    isAuthenticated: workspaceSnapshot.isAuthenticated,
    ownsFounderProfile:
      Boolean(resolvedFounderProfileId) && workspaceSnapshot.ownsFounderProfile,
    canEditFounderProfile:
      Boolean(resolvedFounderProfileId) &&
      workspaceSnapshot.canEditFounderProfile,
    source: normalizeFounderProfileRuntimeSource(workspaceSnapshot.source),
    hydrated: workspaceSnapshot.hydrated,
  };
}

function MobileSectionNav({
  activeSection,
  onChangeSection,
}: {
  activeSection: FounderProfileSection;
  onChangeSection: (section: FounderProfileSection) => void;
}): React.JSX.Element {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
      {FOUNDER_PROFILE_SECTION_ORDER.map((section) => {
        const active = section === activeSection;

        return (
          <button
            key={section}
            type="button"
            onClick={() => onChangeSection(section)}
            aria-current={active ? "true" : undefined}
            className={[
              "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
              active ? "bg-white/10 text-white" : "text-white/55 hover:text-white",
            ].join(" ")}
          >
            {FOUNDER_PROFILE_SECTION_LABELS[section]}
          </button>
        );
      })}
    </nav>
  );
}

function getFounderProfileReadonlyReason(
  workspace: WorkspaceRuntimeSnapshot,
  runtime: CirglobFounderProfileSnapshot,
): string | null {
  if (!workspace.hydrated || !runtime.hydrated) {
    return "Founder profile is still hydrating.";
  }
  if (!workspace.isAuthenticated) {
    return "Sign in to edit your founder profile.";
  }
  if (!workspace.ownsFounderProfile || !runtime.founderProfileId) {
    return "You do not have access to edit this founder profile.";
  }
  if (!workspace.canEditFounderProfile) {
    return "Editing the founder profile is currently disabled.";
  }
  return null;
}

function buildSectionErrorMap(
  runtime: CirglobFounderProfileSnapshot,
): ReadonlyMap<FounderProfileSection, string[]> {
  const map = new Map<FounderProfileSection, string[]>();

  for (const section of FOUNDER_PROFILE_SECTION_ORDER) {
    map.set(section, []);
  }

  for (const result of runtime.validation.sectionResults) {
    const section = result.section;
    if (result.valid || result.missing) {
      map.set(section, []);
      continue;
    }

    const errors = new Set<string>();
    errors.add("This section contains validation issues.");

    map.set(section, Array.from(errors));
  }

  return map;
}

function useFounderProfileRuntimeManager(
  options: FounderProfileWorkspaceProps,
): CirglobFounderProfileStateManager {
  const managerRef = useRef<{
    founderProfileId: string | null;
    manager: CirglobFounderProfileStateManager;
  } | null>(null);

  const resolvedFounderProfileId =
    typeof options.founderProfileId === "string" &&
    options.founderProfileId.trim().length > 0
      ? options.founderProfileId.trim()
      : null;

  const trustedAccess = useMemo(
    () =>
      getFounderProfileTrustedAccess(
        options.workspaceSnapshot,
        resolvedFounderProfileId,
      ),
    [
      options.workspaceSnapshot.hydrated,
      options.workspaceSnapshot.isAuthenticated,
      options.workspaceSnapshot.ownsFounderProfile,
      options.workspaceSnapshot.canEditFounderProfile,
      options.workspaceSnapshot.source,
      options.workspaceSnapshot.userId,
      resolvedFounderProfileId,
    ],
  );

  // Functions cannot cross the server -> client component boundary,
  // so page.tsx (a Server Component) can never hand this workspace a
  // syncTransport prop directly. Build the default HTTP transport
  // here instead, entirely client-side, and only fall back to a
  // caller-supplied transport if one was explicitly passed in.
  const defaultSyncTransport = useMemo(
    () => createFounderProfileSyncTransport(),
    [],
  );
  const resolvedSyncTransport = options.syncTransport ?? defaultSyncTransport;

  if (
    !managerRef.current ||
    managerRef.current.founderProfileId !== resolvedFounderProfileId
  ) {
    managerRef.current?.manager.destroy();

    managerRef.current = {
      founderProfileId: resolvedFounderProfileId,
      manager: cirglobFounderProfileState.create({
        founderProfileId: resolvedFounderProfileId,
        sections: options.initialSections ?? {},
        validationSchemas: options.validationSchemas,
        syncTransport: resolvedSyncTransport,
        syncOptions: options.syncOptions,
        autosaveEnabled: options.autosaveEnabled ?? true,
        trustedAccess,
        ...FOUNDER_PROFILE_RUNTIME_BOOTSTRAP,
      }),
    };
  }

  const manager = managerRef.current.manager;

  useEffect(() => {
    manager.configure({
      founderProfileId: resolvedFounderProfileId,
      validationSchemas: options.validationSchemas,
      syncTransport: resolvedSyncTransport,
      syncOptions: options.syncOptions,
      autosaveEnabled: options.autosaveEnabled ?? true,
      trustedAccess,
      ...FOUNDER_PROFILE_RUNTIME_BOOTSTRAP,
    });
  }, [
    manager,
    resolvedFounderProfileId,
    trustedAccess,
    options.validationSchemas,
    resolvedSyncTransport,
    options.syncOptions,
    options.autosaveEnabled,
  ]);

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  useEffect(() => {
    void manager.hydrateFromStorage(resolvedFounderProfileId);
  }, [manager, resolvedFounderProfileId]);

  return manager;
}

function useFounderProfileSnapshot(
  manager: CirglobFounderProfileStateManager,
): CirglobFounderProfileSnapshot {
  return useSyncExternalStore(
    useCallback((listener) => manager.subscribe(listener), [manager]),
    useCallback(() => manager.getSnapshot(), [manager]),
    useCallback(() => manager.getSnapshot(), [manager]),
  );
}

function FounderProfileBody({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="space-y-12">{children}</div>;
}

function SectionErrorFallback({
  section,
  label,
  onRetry,
}: {
  section: FounderProfileSection;
  label: string;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 shadow-sm">
      <div className="mb-2 text-base font-semibold text-white">{label}</div>
      <p className="mb-4 leading-6 text-white/70">
        This section failed to render. The workspace remains available, and you can
        retry this section without losing the rest of the page.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
      >
        Retry section
      </button>
      <div className="sr-only">Section id: {section}</div>
    </div>
  );
}

class SectionErrorBoundary extends React.Component<
  {
    section: FounderProfileSection;
    label: string;
    retryToken: number;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidUpdate(
    prevProps: Readonly<{
      retryToken: number;
      section: FounderProfileSection;
      label: string;
      children: React.ReactNode;
    }>,
  ): void {
    if (prevProps.retryToken !== this.props.retryToken && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <SectionErrorFallback
          section={this.props.section}
          label={this.props.label}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

function FounderProfileSectionNode({
  section,
  component: Component,
  runtimeSnapshot,
  workspaceSnapshot,
  active,
  retryToken,
  onChange,
  sectionErrors,
  sectionDirty,
}: {
  section: FounderProfileSection;
  component: SectionComponentType;
  runtimeSnapshot: CirglobFounderProfileSnapshot;
  workspaceSnapshot: WorkspaceRuntimeSnapshot;
  active: boolean;
  retryToken: number;
  onChange: (value: unknown) => void;
  sectionErrors: string[];
  sectionDirty: boolean;
}): React.JSX.Element {
  const label = FOUNDER_PROFILE_SECTION_LABELS[section];
  const value = getSectionValue(runtimeSnapshot.sections, section);
  const locked = runtimeSnapshot.locked || !workspaceSnapshot.canEditFounderProfile;
  const readonlyReason = getFounderProfileReadonlyReason(
    workspaceSnapshot,
    runtimeSnapshot,
  );

  return (
    <section
      data-section={section}
      id={section}
      className="scroll-mt-8"
      aria-current={active ? "true" : undefined}
    >
      {sectionErrors.length > 0 ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {sectionErrors.join(" ")}
        </div>
      ) : null}

      <SectionErrorBoundary section={section} label={label} retryToken={retryToken}>
        <Component
          data={value}
          onChange={onChange}
          errors={{}}
          locked={locked}
          disabled={locked}
          dirty={sectionDirty}
          readonlyReason={readonlyReason}
          founderProfileId={runtimeSnapshot.founderProfileId}
          section={section}
        />
      </SectionErrorBoundary>
    </section>
  );
}

export function FounderProfileWorkspace(
  props: FounderProfileWorkspaceProps,
): React.JSX.Element {
  const runtimeManager = useFounderProfileRuntimeManager(props);
  const runtimeSnapshot = useFounderProfileSnapshot(runtimeManager);

  const sectionRegistry = useMemo(() => createSectionRegistry(), []);
  const [activeSection, setActiveSection] = useState<FounderProfileSection>(
    FOUNDER_PROFILE_SECTION_ORDER[0] ?? "identity",
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const releaseTimerRef = useRef<number | null>(null);

  const clearProgrammaticScrollReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const scheduleProgrammaticScrollRelease = useCallback(() => {
    clearProgrammaticScrollReleaseTimer();

    releaseTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      releaseTimerRef.current = null;
    }, 160);
  }, [clearProgrammaticScrollReleaseTimer]);

  const scrollToSection = useCallback((section: FounderProfileSection) => {
    setActiveSection(section);
    const container = scrollContainerRef.current;
    const target = container?.querySelector<HTMLElement>(
      `section[data-section="${section}"]`,
    );

    if (!container || !target) return;

    isProgrammaticScrollRef.current = true;
    scheduleProgrammaticScrollRelease();

    container.scrollTo({
      top: target.offsetTop - 24,
      behavior: "smooth",
    });
  }, [scheduleProgrammaticScrollRelease]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isProgrammaticScrollRef.current) return;
      scheduleProgrammaticScrollRelease();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearProgrammaticScrollReleaseTimer();
      isProgrammaticScrollRef.current = false;
    };
  }, [clearProgrammaticScrollReleaseTimer, scheduleProgrammaticScrollRelease]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const sectionElements = Array.from(
      container.querySelectorAll<HTMLElement>("section[data-section]"),
    );

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const section = visibleEntry.target.getAttribute("data-section") as
            | FounderProfileSection
            | null;

          if (section) {
            setActiveSection(section);
          }
        }
      },
      { root: container, threshold: [0.2, 0.4, 0.6] },
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const [retryToken, setRetryToken] = useState(0);
  const sectionErrorMap = useMemo(
    () => buildSectionErrorMap(runtimeSnapshot),
    [runtimeSnapshot],
  );
  const dirtySectionSet = useMemo(
    () => new Set(runtimeSnapshot.dirtySections ?? []),
    [runtimeSnapshot.dirtySections],
  );

  const readonlyReason = getFounderProfileReadonlyReason(
    props.workspaceSnapshot,
    runtimeSnapshot,
  );
  const locked = Boolean(readonlyReason) || runtimeSnapshot.locked;

  const accessDeniedNotifiedRef = useRef(false);

  useEffect(() => {
    props.onStateChange?.(runtimeSnapshot);
  }, [props.onStateChange, runtimeSnapshot]);

    useEffect(() => {
    const denied =
      props.workspaceSnapshot.hydrated &&
      (!props.workspaceSnapshot.isAuthenticated ||
        !props.workspaceSnapshot.hasWorkspaceAccess ||
        !props.workspaceSnapshot.ownsFounderProfile ||
        !runtimeSnapshot.founderProfileId);

    if (denied && !accessDeniedNotifiedRef.current) {
      accessDeniedNotifiedRef.current = true;
      props.onAccessDenied?.();
      return;
    }

    if (!denied) {
      accessDeniedNotifiedRef.current = false;
    }
  }, [
    props.onAccessDenied,
    props.workspaceSnapshot.hydrated,
    props.workspaceSnapshot.isAuthenticated,
    props.workspaceSnapshot.hasWorkspaceAccess,
    props.workspaceSnapshot.ownsFounderProfile,
    runtimeSnapshot.founderProfileId,
  ]);

  const handleSectionChange = useCallback(
    (section: FounderProfileSection) => (nextValue: unknown) => {
      if (locked || !runtimeSnapshot.founderProfileId) {
        return;
      }

      runtimeManager.setFounderProfileSection(section, nextValue);
      setRetryToken((value) => value + 1);
    },
    [locked, runtimeManager, runtimeSnapshot.founderProfileId],
  );

  const rootClassName = [
    "relative h-screen w-full overflow-hidden bg-[#05060A] text-white",
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

    return (
    <div className={rootClassName}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-15%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <aside className="relative z-10 hidden w-[290px] shrink-0 overflow-hidden border-r border-white/10 bg-white/5 backdrop-blur-xl md:block">
          <FounderProfileSidebar
            activeSection={activeSection}
            onChangeSection={scrollToSection}
          />
        </aside>

        <main
          ref={scrollContainerRef}
          className="application-scroll-root relative z-10 min-w-0 flex-1 h-[100dvh] min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar px-6 md:px-14 py-10 md:py-16 pb-18 md:pb-14"
        >
          <div className="max-w-4xl">
            <div className="flex w-full max-w-4xl items-start gap-4">
              <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-white md:text-[52px]">
                Founder Profile
              </h1>

              <ReturnToApplicationButton
                href={ROUTES.APPLY_DASHBOARD}
                className="ml-auto mt-2 md:mt-4"
              />
            </div>

            <div className="mt-12">
              <div className="md:hidden">
                <MobileSectionNav
                  activeSection={activeSection}
                  onChangeSection={scrollToSection}
                />
              </div>

              <FounderProfileBody>
                {sectionRegistry.map(({ id, component }) => (
                  <FounderProfileSectionNode
                    key={id}
                    section={id}
                    component={component}
                    runtimeSnapshot={runtimeSnapshot}
                    workspaceSnapshot={props.workspaceSnapshot}
                    active={Boolean(activeSection && id === activeSection)}
                    retryToken={retryToken}
                    onChange={handleSectionChange(id)}
                    sectionErrors={sectionErrorMap.get(id) ?? []}
                    sectionDirty={dirtySectionSet.has(id)}
                  />
                ))}
              </FounderProfileBody>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FounderProfileWorkspace;