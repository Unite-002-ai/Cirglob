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
  APPLICATION_SECTIONS,
  APPLICATION_STATUS,
  type ApplicationSection,
  type ApplicationStatus,
} from "@/lib/constants";
import type { ApplicationStatusInput } from "@/lib/application-status";
import {
  getApplicationSectionMeta,
  getOrderedApplicationSections,
} from "@/lib/application-sections";
import {
  cirglobApplicationState,
  type CirglobApplicationSnapshot,
  type CirglobApplicationStateManager,
  type CirglobApplicationStateOptions,
} from "@/lib/cirglob-runtime/application-runtime";
import type { ApplicationSyncTransport } from "@/lib/application-sync";
import { createHttpApplicationSyncTransport } from "@/lib/cirglob-runtime/application-sync-transport.client";
import {
  getWorkspaceAccessLevel,
  getWorkspaceSummary,
  isWorkspaceHydrated,
  isWorkspaceSecure,
  type WorkspaceRuntimeSnapshot,
} from "@/lib/workspace-runtime.shared";
import ApplicationAlerts, {
  type ApplicationAlert,
} from "./ApplicationAlerts";

import ApplicationShell from "./ApplicationShell";
import SubmitApplicationButton from "./SubmitApplicationButton";
import type { SectionKey } from "./application-types";

import Founders from "./sections/Founders";
import FounderVideo from "./sections/FounderVideo";
import Company from "./sections/Company";
import Progress from "./sections/Progress";
import Insight from "./sections/Insight";
import StructureCapital from "./sections/StructureCapital";
import Alignment from "./sections/Alignment";
import TimingCommitment from "./sections/TimingCommitment";

export type ApplicationWorkspaceProps = {
  workspaceSnapshot: WorkspaceRuntimeSnapshot;
  applicationId: string | null;
  applicationStatus: ApplicationStatusInput;
  initialSections?: Partial<Record<ApplicationSection, unknown>>;
  validationSchemas?: CirglobApplicationStateOptions["validationSchemas"];
  syncTransport?: CirglobApplicationStateOptions["syncTransport"];
  syncOptions?: CirglobApplicationStateOptions["syncOptions"];
  autosaveEnabled?: boolean;
  className?: string;
  onAccessDenied?: () => void;
  onStateChange?: (snapshot: CirglobApplicationSnapshot) => void;
};

type SectionRuntimeProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  errors: string[];
  locked: boolean;
  disabled: boolean;
  dirty: boolean;
  readonlyReason: string | null;
  applicationId: string | null;
  status: ApplicationStatus;
  section: ApplicationSection;
};

type SectionComponentType = React.ComponentType<SectionRuntimeProps>;

type FoundersSectionRuntimeProps = SectionRuntimeProps & {
  workspaceSnapshot: WorkspaceRuntimeSnapshot;
  canInviteMember: boolean;
  canRemoveMember: boolean;
  currentMemberRole: string | null;
  isOwner: boolean;
  onAlert?: (alert: ApplicationAlert) => void;
};

type WorkspaceDisplayState = {
  summary: ReturnType<typeof getWorkspaceSummary>;
  accessLevel: ReturnType<typeof getWorkspaceAccessLevel>;
  secure: boolean;
  hydrated: boolean;
  readonlyReason: string | null;
  locked: boolean;
  autosaveEnabled: boolean;
  workspaceLabel: string;
  cycleLabel: string;
  completion: number;
  validationSummary: string;
  saveStatus: string;
  canEdit: boolean;
  completedCount: number;
  totalCount: number | undefined;
  missingCount: number;
  invalidCount: number;
};

const SECTION_COMPONENTS: Record<ApplicationSection, SectionComponentType> = {
  [APPLICATION_SECTIONS.FOUNDERS]: Founders as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.FOUNDER_VIDEO]:
    FounderVideo as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.COMPANY]: Company as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.PROGRESS]: Progress as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.INSIGHT]: Insight as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.STRUCTURE_CAPITAL]:
    StructureCapital as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.ALIGNMENT]: Alignment as unknown as SectionComponentType,
  [APPLICATION_SECTIONS.TIMING_COMMITMENT]:
    TimingCommitment as unknown as SectionComponentType,
};

const APPLICATION_RUNTIME_DEFAULTS = {
  autosaveEnabled: true,
  initialHydrate: false,
  cleanupStaleCache: false,
  // "seed" trusts the freshly-loaded server data (initialSections,
  // fetched fresh on every page load from application_sections) as
  // the starting point every time. Local storage is still written
  // on every autosave as a same-session crash buffer, but it is
  // never read back on mount, so a stale per-browser cache can
  // never again shadow another founder's saved edits.
  restoreMode: "seed" as const,
  seedPolicy: "prefer-committed" as const,
};

function useApplicationRuntimeManager(
  options: ApplicationWorkspaceProps,
): CirglobApplicationStateManager {
  const managerRef = useRef<CirglobApplicationStateManager | null>(null);
  const lastApplicationIdRef = useRef<string | null>(null);
  const defaultSyncTransportRef = useRef<ApplicationSyncTransport | null>(null);

  if (!defaultSyncTransportRef.current) {
    defaultSyncTransportRef.current = createHttpApplicationSyncTransport();
  }

  const resolvedSyncTransport =
    options.syncTransport ?? defaultSyncTransportRef.current;

  if (!managerRef.current) {
    managerRef.current = cirglobApplicationState.create({
      applicationId: options.applicationId,
      status: normalizeApplicationStatus(options.applicationStatus),
      sections: options.initialSections ?? {},
      validationSchemas: options.validationSchemas,
      syncTransport: resolvedSyncTransport,
      syncOptions: options.syncOptions,
      ...APPLICATION_RUNTIME_DEFAULTS,
      initialHydrate: false,
      autosaveEnabled:
        options.autosaveEnabled ?? APPLICATION_RUNTIME_DEFAULTS.autosaveEnabled,
    });

    lastApplicationIdRef.current = options.applicationId;
  }

  const manager = managerRef.current;

  useEffect(() => {
    const applicationIdChanged =
      lastApplicationIdRef.current !== options.applicationId;

    manager.configure({
      applicationId: options.applicationId,
      status: normalizeApplicationStatus(options.applicationStatus),
      validationSchemas: options.validationSchemas,
      syncTransport: resolvedSyncTransport,
      syncOptions: options.syncOptions,
      ...APPLICATION_RUNTIME_DEFAULTS,
      initialHydrate: false,
      autosaveEnabled:
        options.autosaveEnabled ?? APPLICATION_RUNTIME_DEFAULTS.autosaveEnabled,
      ...(applicationIdChanged ? { sections: options.initialSections ?? {} } : {}),
    });

    lastApplicationIdRef.current = options.applicationId;
  }, [
    manager,
    options.applicationId,
    options.applicationStatus,
    options.initialSections,
    options.validationSchemas,
    resolvedSyncTransport,
    options.syncOptions,
    options.autosaveEnabled,
  ]);

  useEffect(() => {
    void manager.hydrateFromStorage(options.applicationId);
  }, [manager, options.applicationId]);

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  return manager;
}

function useApplicationSnapshot(
  manager: CirglobApplicationStateManager,
): CirglobApplicationSnapshot {
  const subscribe = useCallback(
    (listener: () => void) => manager.subscribe(listener),
    [manager],
  );

  const snapshotRef = useRef<CirglobApplicationSnapshot>(manager.getSnapshot());

  useEffect(() => {
    snapshotRef.current = manager.getSnapshot();
  }, [manager]);

  const getSnapshot = useCallback(() => {
    const nextSnapshot = manager.getSnapshot();
    const currentSnapshot = snapshotRef.current;

    if (currentSnapshot.version === nextSnapshot.version) {
      return currentSnapshot;
    }

    snapshotRef.current = nextSnapshot;
    return nextSnapshot;
  }, [manager]);

  const getServerSnapshot = useCallback(() => snapshotRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getWorkspaceReadonlyReason(
  workspace: WorkspaceRuntimeSnapshot,
  runtime: CirglobApplicationSnapshot,
): string | null {
  if (!workspace.hydrated) return "Workspace is still hydrating.";
  if (!workspace.isAuthenticated) return "Sign in to access this workspace.";
  if (!workspace.hasWorkspaceAccess) return "You do not have workspace access.";
  if (workspace.isLocked || runtime.locked) return "This application is locked.";
  if (!workspace.canEditApplication) return "Editing is currently disabled.";
  return null;
}

function buildSectionErrorMap(
  runtime: CirglobApplicationSnapshot,
): ReadonlyMap<ApplicationSection, string[]> {
  const map = new Map<ApplicationSection, string[]>();

  for (const result of runtime.validation.sectionResults) {
    if (result.valid) {
      map.set(result.section, []);
      continue;
    }

    const errors = new Set<string>();
    if (result.missing) errors.add("This section is required.");
    if (!result.missing) errors.add("This section contains validation issues.");

    map.set(result.section, Array.from(errors));
  }

  return map;
}

function normalizeApplicationStatus(
  value: ApplicationStatus | string | null | undefined,
): ApplicationStatus {
  const allowed = new Set(Object.values(APPLICATION_STATUS));
  return allowed.has(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : APPLICATION_STATUS.DRAFT;
}

function SectionErrorFallback({
  section,
  label,
  onRetry,
}: {
  section: ApplicationSection;
  label: string;
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 shadow-sm">
      <div className="mb-2 text-base font-semibold text-white">{label}</div>
      <p className="mb-4 leading-6 text-white/70">
        This section failed to render. The workspace stays available, and you can
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
    section: ApplicationSection;
    label: string;
    retryToken: number;
    children: React.ReactNode;
    onError?: (error: Error) => void;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.(error);
  }

  componentDidUpdate(
    prevProps: Readonly<{
      retryToken: number;
      section: ApplicationSection;
      label: string;
      children: React.ReactNode;
      onError?: (error: Error) => void;
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

function ApplicationSectionNode({
  section,
  component: Component,
  runtimeSnapshot,
  workspaceSnapshot,
  canInviteMember,
  canRemoveMember,
  currentMemberRole,
  isOwner,
  retryToken,
  onChange,
  sectionErrors,
  sectionDirty,
  onAlert,
}: {
  section: ApplicationSection;
  component: SectionComponentType;
  runtimeSnapshot: CirglobApplicationSnapshot;
  workspaceSnapshot: WorkspaceRuntimeSnapshot;
  canInviteMember: boolean;
  canRemoveMember: boolean;
  currentMemberRole: string | null;
  isOwner: boolean;
  retryToken: number;
  onChange: (value: unknown) => void;
  sectionErrors: string[];
  sectionDirty: boolean;
  onAlert?: (alert: ApplicationAlert) => void;
}): React.JSX.Element {
  const meta = getApplicationSectionMeta(section);
  const value = runtimeSnapshot.sections[section];
  const locked = runtimeSnapshot.locked || !workspaceSnapshot.canEditApplication;
  const readonlyReason = getWorkspaceReadonlyReason(
    workspaceSnapshot,
    runtimeSnapshot,
  );

  const sharedProps = {
    value,
    onChange,
    errors: sectionErrors,
    locked,
    disabled: locked,
    dirty: sectionDirty,
    readonlyReason,
    applicationId: runtimeSnapshot.applicationId,
    status: normalizeApplicationStatus(runtimeSnapshot.status),
    section,
  };

  const SectionComponent = Component as React.ComponentType<SectionRuntimeProps>;
  const FoundersComponent =
    Component as React.ComponentType<FoundersSectionRuntimeProps>;

  const handleSectionError = useCallback(
    (error: Error) => {
      onAlert?.({
        id: `section-error-${String(section)}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        level: "error",
        title: `${meta.label} failed to render`,
        message:
          error instanceof Error
            ? error.message
            : "This section failed to render and was replaced with a fallback.",
        sectionId: section,
        source: "section-runtime",
      });
    },
    [meta.label, onAlert, section],
  );

  return (
    <section
      id={section}
      data-section={section}
      className="space-y-6 scroll-mt-8"
      aria-label={meta.label}
    >
      <SectionErrorBoundary
        section={section}
        label={meta.label}
        retryToken={retryToken}
        onError={handleSectionError}
      >
        {section === APPLICATION_SECTIONS.FOUNDERS ? (
          <FoundersComponent
            {...sharedProps}
            workspaceSnapshot={workspaceSnapshot}
            canInviteMember={canInviteMember}
            canRemoveMember={canRemoveMember}
            currentMemberRole={currentMemberRole}
            isOwner={isOwner}
            onAlert={onAlert}
          />
        ) : (
          <SectionComponent {...sharedProps} />
        )}
      </SectionErrorBoundary>
    </section>
  );
}

function useWorkspaceDisplayState(
  workspaceSnapshot: WorkspaceRuntimeSnapshot,
  runtimeSnapshot: CirglobApplicationSnapshot,
  applicationId?: string | null,
  autosaveEnabledProp?: boolean,
): WorkspaceDisplayState {
  return useMemo(() => {
    const summary = getWorkspaceSummary(workspaceSnapshot);
    const accessLevel = getWorkspaceAccessLevel(workspaceSnapshot);
    const secure = isWorkspaceSecure(workspaceSnapshot);
    const hydrated = isWorkspaceHydrated(workspaceSnapshot);
    const readonlyReason = getWorkspaceReadonlyReason(
      workspaceSnapshot,
      runtimeSnapshot,
    );
    const locked = Boolean(readonlyReason) || runtimeSnapshot.locked;
    const autosaveEnabled = autosaveEnabledProp ?? true;

    const workspaceLabel =
      applicationId ??
      workspaceSnapshot.email ??
      workspaceSnapshot.userId ??
      "Application workspace";

    const cycleLabel = workspaceSnapshot.activeApplicationStatus
      ? String(workspaceSnapshot.activeApplicationStatus)
      : "Current cycle";

    const dirtySections = runtimeSnapshot.dirtySections ?? [];
    const dirtyCount = dirtySections.length;
    const sectionResults = runtimeSnapshot.validation?.sectionResults ?? [];

    let completedCount = 0;
    let missingCount = 0;
    let invalidCount = 0;

    for (const result of sectionResults) {
      if (result.missing) {
        missingCount += 1;
      }

      if (result.valid && !result.missing) {
        completedCount += 1;
      }

      if (!result.valid && !result.missing) {
        invalidCount += 1;
      }
    }

    const totalCount = sectionResults.length > 0 ? sectionResults.length : undefined;
    const completion = Math.max(
      0,
      Math.min(
        100,
        Math.round(runtimeSnapshot.validation?.completionPercentage ?? 0),
      ),
    );

    const validationSummary =
      invalidCount > 0
        ? `${invalidCount} validation issue${invalidCount === 1 ? "" : "s"}`
        : missingCount > 0
          ? `${missingCount} section${missingCount === 1 ? "" : "s"} need attention`
          : runtimeSnapshot.validation?.valid === false
            ? "Validation needs attention"
            : "Validation clean";

    const formattedLastSavedAt =
      typeof runtimeSnapshot.lastSavedAt === "number" &&
      Number.isFinite(runtimeSnapshot.lastSavedAt)
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(runtimeSnapshot.lastSavedAt))
        : null;

    const saveStatus = runtimeSnapshot.saving
      ? "Saving…"
      : dirtyCount > 0
        ? "Unsaved changes"
        : formattedLastSavedAt
          ? `Saved ${formattedLastSavedAt}`
          : locked
            ? "Read-only"
            : "Ready";

    const canEdit = Boolean(summary.canEditApplication) && !locked;

    return {
      summary,
      accessLevel,
      secure,
      hydrated,
      readonlyReason,
      locked,
      autosaveEnabled,
      workspaceLabel,
      cycleLabel,
      completion,
      validationSummary,
      saveStatus,
      canEdit,
      completedCount,
      totalCount,
      missingCount,
      invalidCount,
    };
  }, [workspaceSnapshot, runtimeSnapshot, autosaveEnabledProp]);
}

// buildApplicationProgressProps removed — progress UI provided elsewhere.

function titleCase(value: string): string {
  return value
    .trim()
    .replace(/[\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Application header rendering has been removed from this workspace component.
// Header properties are no longer built here.

export function ApplicationWorkspace(
  props: ApplicationWorkspaceProps,
): React.JSX.Element {
  const orderedSections = useMemo(() => getOrderedApplicationSections(), []);
  const sectionRegistry = useMemo(
    () =>
      orderedSections.map((section) => ({
        id: section,
        component: SECTION_COMPONENTS[section],
      })),
    [orderedSections],
  );

  const shellSectionIds = useMemo(
    () => orderedSections.map((section) => String(section) as SectionKey),
    [orderedSections],
  );

  const runtimeManager = useApplicationRuntimeManager(props);
  const runtimeSnapshot = useApplicationSnapshot(runtimeManager);

  const [retryToken, setRetryToken] = useState(0);
  const [runtimeAlerts, setRuntimeAlerts] = useState<ApplicationAlert[]>([]);

  const pushWorkspaceAlert = useCallback((alert: ApplicationAlert) => {
    setRuntimeAlerts((current) => {
      const next = [...current, alert];
      return next.length > 24 ? next.slice(-24) : next;
    });
  }, []);

  useEffect(() => {
    setRuntimeAlerts([]);
  }, [props.applicationId, props.workspaceSnapshot.activeApplicationId]);

  const sectionErrorMap = useMemo(
    () => buildSectionErrorMap(runtimeSnapshot),
    [runtimeSnapshot],
  );

  const dirtySectionSet = useMemo(
    () => new Set(runtimeSnapshot.dirtySections ?? []),
    [runtimeSnapshot.dirtySections],
  );

  const display = useWorkspaceDisplayState(
    props.workspaceSnapshot,
    runtimeSnapshot,
    props.applicationId,
    props.autosaveEnabled,
  );
  // Workspace status banners (hydrating/readonly/validation/saving)
  // have been intentionally removed from workspaceAlerts below in
  // favor of a dedicated notification system. `display` is retained
  // for its other derived fields and potential future consumers.
  void display;

  useEffect(() => {
    props.onStateChange?.(runtimeSnapshot);
  }, [props.onStateChange, runtimeSnapshot]);

  useEffect(() => {
    if (
      !props.workspaceSnapshot.hasWorkspaceAccess ||
      !props.workspaceSnapshot.isAuthenticated
    ) {
      props.onAccessDenied?.();
    }
  }, [
    props.onAccessDenied,
    props.workspaceSnapshot.hasWorkspaceAccess,
    props.workspaceSnapshot.isAuthenticated,
  ]);

    const handleSectionChange = useCallback(
    (section: ApplicationSection) => (nextValue: unknown) => {
      runtimeManager.setSection(section, nextValue);
      setRetryToken((value) => value + 1);
    },
    [runtimeManager],
  );

  const runtimeErrorMessage = useMemo(() => {
    const rawRuntimeError = (
      runtimeSnapshot as CirglobApplicationSnapshot & { lastError?: unknown }
    ).lastError;

    if (typeof rawRuntimeError === "string") {
      const trimmed = rawRuntimeError.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (
      rawRuntimeError &&
      typeof rawRuntimeError === "object" &&
      "message" in rawRuntimeError &&
      typeof (rawRuntimeError as { message?: unknown }).message === "string"
    ) {
      const message = (rawRuntimeError as { message?: string }).message?.trim();
      return message && message.length > 0 ? message : null;
    }

    return null;
  }, [runtimeSnapshot]);

  const workspaceAlerts = useMemo<ApplicationAlert[]>(() => {
    const alerts: ApplicationAlert[] = [];

    // The only banner kept here is a genuine sync failure — the
    // exact failure mode behind the "my work disappeared" bug this
    // fix addresses. Everything else (hydrating/readonly/validation/
    // saving noise, and every ad hoc Founders.tsx alert) has been
    // removed per your request, pending the new notification system.
    if (runtimeErrorMessage) {
      alerts.push({
        id: "workspace-runtime-error",
        level: "error",
        title: "Application sync error",
        message: runtimeErrorMessage,
        source: "runtime",
      });
    }

    return [...alerts, ...runtimeAlerts];
  }, [runtimeAlerts, runtimeErrorMessage]);

  const sidebarItems = useMemo(
    () =>
      orderedSections.map((section) => ({
        id: String(section) as SectionKey,
        label: getApplicationSectionMeta(section).label,
      })),
    [orderedSections],
  );

    return (
    <ApplicationShell sectionIds={shellSectionIds} sidebarItems={sidebarItems}>
      <ApplicationAlerts alerts={workspaceAlerts} />

      {sectionRegistry.map(({ id, component }) => (
        <ApplicationSectionNode
          key={id}
          section={id}
          component={component}
          runtimeSnapshot={runtimeSnapshot}
          workspaceSnapshot={props.workspaceSnapshot}
          canInviteMember={props.workspaceSnapshot.canInviteMember}
          canRemoveMember={props.workspaceSnapshot.canRemoveMember}
          currentMemberRole={props.workspaceSnapshot.currentMemberRole}
          isOwner={props.workspaceSnapshot.isOwner}
          retryToken={retryToken}
          onChange={handleSectionChange(id)}
          sectionErrors={sectionErrorMap.get(id) ?? []}
          sectionDirty={dirtySectionSet.has(id)}
          onAlert={pushWorkspaceAlert}
        />
      ))}

      <SubmitApplicationButton />
    </ApplicationShell>
  );
}

export default ApplicationWorkspace;  